# Análise de Compatibilidade de Tecnologias — SafeStreets

## Visão geral da stack

| Camada | Tecnologia |
|---|---|
| Front-end | Next.js + TypeScript + CSS Modules |
| Back-end | Python + FastAPI |
| Banco de dados | PostgreSQL |
| ORM | SQLAlchemy |
| Containerização | Docker |
| IA | Gemini API |
| Geocodificação | Nominatim |
| Mapas | Leaflet.js |
| Fontes de dados | Feeds RSS (Metrópoles, Correio Braziliense) |
| Documentação da API | Swagger / OpenAPI |

---

## Resultado geral

A stack é **compatível**. Todas as tecnologias escolhidas se comunicam por padrões abertos (HTTP/REST e JSON), o que elimina dependências diretas entre front-end e back-end. Os pontos de atenção existem, mas todos têm solução clara descrita neste documento.

---

## Análise por par de tecnologias

### Next.js ↔ FastAPI

**Compatibilidade: total.**

Next.js consome qualquer API REST via `fetch` nativo ou bibliotecas como `axios`. O FastAPI expõe endpoints REST com retorno em JSON, que é o formato esperado pelo front-end. A comunicação segue o padrão cliente-servidor sem nenhuma dependência de linguagem ou framework entre os dois lados.

**Ponto de atenção — CORS:**
Por padrão, o FastAPI bloqueia requisições vindas de origens diferentes (como `localhost:3000` do Next.js acessando `localhost:8000` do FastAPI). Isso precisa ser configurado explicitamente.

Solução:

```python
# main.py — FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # em produção, coloque o domínio real
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Leaflet.js ↔ Next.js (SSR)

**Compatibilidade: requer configuração.**

Este é o conflito mais comum nessa stack. O Leaflet.js acessa o objeto `window` do navegador durante a inicialização. O Next.js, por padrão, tenta renderizar componentes no servidor (SSR), onde `window` não existe — isso causa o erro `window is not defined` em tempo de build ou execução.

Solução — carregar o componente de mapa apenas no cliente:

```tsx
// components/Mapa.tsx
import dynamic from "next/dynamic";

const MapaLeaflet = dynamic(() => import("./MapaLeaflet"), {
  ssr: false,           // desativa a renderização no servidor para este componente
  loading: () => <p>Carregando mapa...</p>,
});

export default MapaLeaflet;
```

O componente `MapaLeaflet` interno pode usar o Leaflet normalmente, pois só será executado no navegador.

---

### Nominatim ↔ FastAPI

**Compatibilidade: total, com restrição de uso.**

O Nominatim é o serviço de geocodificação do OpenStreetMap. A chamada deve ser feita sempre pelo back-end (FastAPI), nunca diretamente pelo front-end. Isso evita expor a origem das requisições e centraliza o controle de cache e rate limit.

**Ponto de atenção — limite de requisições:**
O servidor público do Nominatim (`nominatim.openstreetmap.org`) impõe um limite de **1 requisição por segundo** e exige um `User-Agent` identificando o projeto. Exceder esse limite resulta em bloqueio de IP.

Solução — wrapper com cache no FastAPI:

```python
import httpx
from functools import lru_cache

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "SafeStreets/1.0 (contato@safestreets.com)"}

@lru_cache(maxsize=512)
def geocodificar(endereco: str) -> dict | None:
    """
    Converte um endereço em coordenadas.
    O cache evita chamadas repetidas para o mesmo endereço.
    """
    params = {"q": endereco, "format": "json", "limit": 1}
    response = httpx.get(NOMINATIM_URL, params=params, headers=HEADERS)
    resultados = response.json()
    if resultados:
        return {
            "lat": float(resultados[0]["lat"]),
            "lon": float(resultados[0]["lon"]),
            "display_name": resultados[0]["display_name"],
        }
    return None
```

Se o volume de geocodificações crescer muito, considere instalar uma instância própria do Nominatim via Docker — a imagem oficial está disponível em `mediagis/nominatim`.

---

### Gemini API ↔ FastAPI

**Compatibilidade: total.**

A biblioteca `google-generativeai` é Python nativa, integrando diretamente com o FastAPI sem nenhuma adaptação. O Gemini será chamado pelo back-end para processar o texto das notícias RSS e extrair localidade e tipo de ocorrência.

**Ponto de atenção — chamadas assíncronas:**
O FastAPI é assíncrono por natureza (`async/await`). A biblioteca padrão do Gemini tem suporte a chamadas síncronas e assíncronas. Use a versão assíncrona para não bloquear o event loop do FastAPI.

Solução:

```python
import google.generativeai as genai
import asyncio

genai.configure(api_key="SUA_CHAVE")
model = genai.GenerativeModel("gemini-1.5-flash")

async def extrair_localidade(texto: str) -> dict:
    loop = asyncio.get_event_loop()
    # executa a chamada síncrona em uma thread separada para não bloquear
    resposta = await loop.run_in_executor(
        None,
        lambda: model.generate_content(texto)
    )
    return resposta.text
```

---

### Feeds RSS ↔ FastAPI

**Compatibilidade: total.**

O `feedparser` é uma biblioteca Python que lê feeds RSS e retorna os dados como dicionário Python — integração direta com o FastAPI. O RSS não tem autenticação, não tem SDK, é apenas uma requisição HTTP GET para uma URL fixa.

**Ponto de atenção — coleta periódica:**
O FastAPI não tem um agendador de tarefas nativo. Para coletar os feeds RSS automaticamente a cada intervalo de tempo (por exemplo, a cada hora), você precisaria de uma solução de agendamento separada.

Solução — usar `APScheduler` junto com o FastAPI:

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager
from fastapi import FastAPI

scheduler = AsyncIOScheduler()

async def coletar_rss():
    """Função que será executada periodicamente."""
    # lógica de coleta e processamento dos feeds
    pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(coletar_rss, "interval", hours=1)
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)
```

Isso garante que a coleta acontece automaticamente sem precisar de um serviço externo.

---

### Feeds RSS ↔ Gemini API

**Compatibilidade: total — integração intencional.**

Esses dois componentes formam o núcleo de inteligência do SafeStreets. O RSS entrega texto bruto (título e resumo da notícia) e o Gemini extrai estrutura (localidade, tipo de ocorrência, bairro). O resultado estruturado é então passado para o Nominatim para geocodificação.

Fluxo completo:

```
Feed RSS → texto da notícia
         → Gemini API → {"local": "QNL 8, Taguatinga", "tipo": "roubo"}
         → Nominatim  → {"lat": -15.8397, "lon": -48.0536}
         → PostgreSQL → registro salvo com coordenadas
         → FastAPI    → endpoint REST
         → Next.js    → Leaflet.js renderiza no mapa
```

---

### PostgreSQL ↔ SQLAlchemy ↔ FastAPI

**Compatibilidade: total — combinação padrão da indústria.**

Essa tríade é amplamente utilizada e bem documentada. O SQLAlchemy gerencia a comunicação com o PostgreSQL e o FastAPI usa os modelos do SQLAlchemy para validar e persistir dados.

**Ponto de atenção — driver assíncrono:**
Para aproveitar o modelo assíncrono do FastAPI, o driver de conexão com o PostgreSQL precisa ser o `asyncpg`, não o `psycopg2` padrão.

Dependências necessárias:

```
fastapi
sqlalchemy[asyncio]
asyncpg
```

Configuração da conexão:

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

DATABASE_URL = "postgresql+asyncpg://usuario:senha@localhost/safestreets"
engine = create_async_engine(DATABASE_URL)
```

---

### Docker ↔ stack completa

**Compatibilidade: total.**

O Docker isola cada serviço em um container separado, eliminando conflitos de dependência entre o front-end (Node.js) e o back-end (Python). A comunicação entre containers é feita via rede interna do Docker Compose.

Estrutura recomendada de containers:

```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:senha@db/safestreets
      - GEMINI_API_KEY=${GEMINI_API_KEY}

  db:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=senha
      - POSTGRES_DB=safestreets
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Ponto de atenção — variáveis de ambiente sensíveis:**
A chave da Gemini API e credenciais do banco nunca devem estar no código ou no `docker-compose.yml` diretamente. Use um arquivo `.env` na raiz do projeto e adicione-o ao `.gitignore`.

---

### TypeScript ↔ Swagger / OpenAPI

**Compatibilidade: total — integração altamente recomendada.**

O FastAPI gera automaticamente um schema OpenAPI em `/openapi.json`. Esse schema pode ser usado para gerar automaticamente os tipos TypeScript do front-end, eliminando erros de integração entre front e back.

Ferramenta recomendada — `openapi-typescript`:

```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
```

Isso gera um arquivo com todos os tipos da API prontos para uso no Next.js, garantindo que o front-end e o back-end estejam sempre sincronizados.

---

## Resumo dos pontos de atenção

| Conflito | Gravidade | Solução |
|---|---|---|
| Leaflet.js + SSR do Next.js | Alta — quebra o build | `dynamic import` com `ssr: false` |
| CORS entre Next.js e FastAPI | Alta — bloqueia requisições | Middleware CORS no FastAPI |
| Nominatim rate limit (1 req/s) | Média — risco de bloqueio de IP | Cache com `lru_cache` no back-end |
| Gemini API bloqueando o event loop | Média — degrada performance | `run_in_executor` para chamadas síncronas |
| Agendamento da coleta RSS | Média — sem agendador nativo no FastAPI | `APScheduler` integrado ao lifespan |
| Driver PostgreSQL síncrono | Baixa — perde performance assíncrona | Substituir `psycopg2` por `asyncpg` |
| Chaves de API no código | Alta — risco de segurança | Arquivo `.env` + `.gitignore` |

---

## Dependências Python necessárias

```
fastapi
uvicorn[standard]
sqlalchemy[asyncio]
asyncpg
feedparser
google-generativeai
httpx
apscheduler
python-dotenv
```

## Dependências Node.js necessárias

```
next
react
react-dom
typescript
leaflet
react-leaflet
@types/leaflet
axios
openapi-typescript
```

# Conclusão — Análise de Compatibilidade SafeStreets

A análise de compatibilidade da stack do SafeStreets demonstra que o conjunto de tecnologias escolhido é **coeso, moderno e tecnicamente viável**. Todas as camadas do sistema se comunicam por meio de padrões abertos e amplamente consolidados — HTTP, REST e JSON — o que elimina dependências diretas entre front-end e back-end e garante que cada parte do projeto possa evoluir de forma independente.

Nenhum dos conflitos identificados representa um impeditivo ao desenvolvimento. Os pontos de atenção mapeados — como a incompatibilidade do Leaflet.js com o SSR do Next.js, a configuração de CORS entre os serviços e o limite de requisições do Nominatim — são problemas conhecidos, com soluções documentadas e de baixa complexidade de implementação. Desde que tratados no início do desenvolvimento, não impactarão a arquitetura nem a escalabilidade do projeto.

A escolha do Python com FastAPI como base do back-end se mostrou especialmente acertada para o SafeStreets, pois viabiliza de forma natural a integração com a API do Gemini para processamento inteligente das notícias coletadas via RSS, com o Nominatim para geocodificação e com o PostgreSQL para persistência — formando uma cadeia de dados coerente desde a coleta até a exibição no mapa.

A adoção do Docker como ambiente de containerização reforça a compatibilidade geral do projeto, isolando as dependências de cada serviço e garantindo que a stack funcione de forma consistente em qualquer ambiente, do desenvolvimento à produção.

Em síntese, o SafeStreets foi projetado sobre uma base tecnológica sólida, sem sobreposições desnecessárias e sem lacunas críticas de integração. As tecnologias escolhidas se complementam e estão alinhadas com as necessidades funcionais do sistema, oferecendo boas condições para o desenvolvimento, manutenção e crescimento do projeto.