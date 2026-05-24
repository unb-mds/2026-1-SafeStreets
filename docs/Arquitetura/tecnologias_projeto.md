# Descrição das Tecnologias — SafeStreets

Este documento descreve as tecnologias complementares utilizadas no projeto SafeStreets, detalhando o que são, como funcionam e qual papel exercem dentro do sistema.

---

## Nominatim

### O que é

Nominatim é um serviço de geocodificação de código aberto mantido pelo projeto OpenStreetMap. Geocodificação é o processo de converter um endereço ou nome de local em coordenadas geográficas — latitude e longitude — que podem ser plotadas em um mapa.

### Como funciona

O serviço recebe um texto descrevendo uma localização (como "QNL 8, Taguatinga, Brasília") e retorna as coordenadas geográficas correspondentes. Também suporta o processo inverso, chamado geocodificação reversa: recebe coordenadas e retorna o endereço correspondente.

A comunicação é feita por meio de uma API REST simples. Uma requisição de exemplo:

```
GET https://nominatim.openstreetmap.org/search?q=Taguatinga,+Brasília&format=json
```

Retorno:

```json
[
  {
    "lat": "-15.8397",
    "lon": "-48.0536",
    "display_name": "Taguatinga, Região Administrativa III, Distrito Federal, Brasil"
  }
]
```

### Papel no SafeStreets

Após o Gemini extrair a localidade de uma notícia — por exemplo, "acidente ocorreu na EPNB próximo ao Gama" — o Nominatim converte esse texto em coordenadas geográficas. Essas coordenadas são salvas no banco de dados e usadas pelo Leaflet.js para posicionar o marcador correto no mapa.

### Observações importantes

- O servidor público do Nominatim impõe um limite de **1 requisição por segundo** e exige que a aplicação se identifique por meio do cabeçalho `User-Agent`.
- Para volumes maiores de requisições, recomenda-se implementar cache no back-end ou hospedar uma instância própria do Nominatim via Docker.
- O uso deve respeitar a [política de uso do Nominatim](https://operations.osmfoundation.org/policies/nominatim/), que proíbe o uso em aplicações de alta escala sem instância própria.

---

## Leaflet.js

### O que é

Leaflet.js é uma biblioteca JavaScript de código aberto para criação de mapas interativos em aplicações web. É amplamente utilizada em projetos que precisam exibir dados geográficos de forma visual, leve e responsiva.

### Como funciona

O Leaflet renderiza mapas no navegador utilizando tiles — pequenas imagens que formam o mapa ao serem combinadas. Esses tiles são carregados de provedores externos, sendo o OpenStreetMap o mais comum e gratuito. A biblioteca permite adicionar marcadores, popups, camadas e eventos de interação diretamente sobre o mapa.

Exemplo básico de uso com React:

```tsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

<MapContainer center={[-15.7801, -47.9292]} zoom={12}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={[-15.8397, -48.0536]}>
    <Popup>Acidente registrado em Taguatinga</Popup>
  </Marker>
</MapContainer>
```

### Papel no SafeStreets

O Leaflet.js é a camada de visualização geográfica do projeto. Ele recebe as coordenadas salvas no banco de dados — obtidas via Nominatim — e exibe cada ocorrência como um marcador no mapa. O usuário pode interagir com os marcadores para ver detalhes da ocorrência, como tipo de crime, data e fonte da notícia.

### Observações importantes

- Por acessar o objeto `window` do navegador durante a inicialização, o Leaflet.js é incompatível com o SSR (Server-Side Rendering) do Next.js. O componente de mapa deve ser carregado com `dynamic import` e `ssr: false` para evitar erros de build.
- A biblioteca `react-leaflet` oferece uma camada de componentes React sobre o Leaflet, facilitando a integração com o Next.js.

---

## API do Gemini

### O que é

Gemini é o modelo de linguagem de grande escala (LLM) desenvolvido pelo Google. Sua API permite que aplicações enviem textos e recebam respostas geradas por inteligência artificial, podendo realizar tarefas como análise de texto, classificação, extração de informações e geração de conteúdo.

### Como funciona

A comunicação é feita por meio da biblioteca oficial `google-generativeai` para Python. A aplicação envia um prompt — uma instrução em linguagem natural junto com o texto a ser processado — e recebe uma resposta estruturada do modelo.

Exemplo de chamada:

```python
import google.generativeai as genai

genai.configure(api_key="SUA_CHAVE")
model = genai.GenerativeModel("gemini-1.5-flash")

resposta = model.generate_content("""
Extraia do texto abaixo a localidade e o tipo de ocorrência.
Responda apenas em JSON.

Texto: "Homem é preso após roubo a mão armada na QNL 8, em Taguatinga."
""")

print(resposta.text)
# {"local": "QNL 8", "bairro": "Taguatinga", "tipo": "roubo"}
```

### Papel no SafeStreets

O Gemini é o componente de inteligência do projeto. Ele recebe o título e o resumo de cada notícia coletada via RSS e extrai de forma estruturada as informações relevantes: localidade, bairro, tipo de ocorrência e se a notícia é de fato relevante para o SafeStreets. Sem essa etapa, os dados chegariam como texto livre e seria inviável posicioná-los no mapa automaticamente.

### Observações importantes

- O modelo recomendado para essa tarefa é o `gemini-1.5-flash`, por ser mais rápido e econômico, sendo mais do que suficiente para extração de informações de textos curtos.
- O plano gratuito da API do Gemini oferece uma cota generosa de requisições mensais, adequada para a escala inicial do SafeStreets.
- As chamadas ao Gemini devem ser feitas pelo back-end (FastAPI), nunca diretamente pelo front-end, para proteger a chave de API.

---

## RSS de Notícias

### O que é

RSS (Really Simple Syndication) é um formato padrão baseado em XML que sites de notícias utilizam para distribuir seu conteúdo de forma estruturada e automática. Funciona como uma "janela" que os veículos de comunicação deixam aberta para que sistemas externos possam ler as publicações mais recentes sem precisar acessar o site manualmente.

### Como funciona

Cada veículo mantém um arquivo RSS em uma URL fixa. Esse arquivo é atualizado automaticamente a cada nova publicação e contém os dados estruturados das notícias mais recentes: título, resumo, link e data de publicação.

Exemplo de estrutura de um item RSS:

```xml
<item>
  <title>Homem é preso após roubo em Taguatinga</title>
  <description>A PMDF deteve o suspeito na QNL 8 após denúncia de moradores da região.</description>
  <link>https://metropoles.com/noticia/...</link>
  <pubDate>Fri, 22 May 2026 14:30:00 GMT</pubDate>
</item>
```

No SafeStreets, a leitura dos feeds é feita com a biblioteca Python `feedparser`, que converte o XML do RSS em dicionários Python prontos para uso:

```python
import feedparser

feed = feedparser.parse("https://www.metropoles.com/distrito-federal/seguranca-df/feed")

for noticia in feed.entries:
    print(noticia.title)
    print(noticia.summary)
    print(noticia.link)
```

### Fontes utilizadas no SafeStreets

| Veículo | URL do Feed | Cobertura |
|---|---|---|
| Metrópoles — Segurança DF | `https://www.metropoles.com/distrito-federal/seguranca-df/feed` | Crimes e ocorrências policiais no DF |
| Correio Braziliense — Cidades DF | `https://www.correiobraziliense.com.br/cidades-df/feed` | Notícias gerais do DF, incluindo acidentes e crimes |

### Papel no SafeStreets

Os feeds RSS são a fonte primária de dados do SafeStreets. O back-end coleta automaticamente as notícias publicadas nesses veículos em intervalos regulares, sem necessidade de acesso manual ao site. O conteúdo coletado é então enviado ao Gemini para extração de localidade e tipo de ocorrência, dando início ao fluxo de processamento que culmina na exibição do dado no mapa.

### Observações importantes

- O RSS entrega título e resumo, mas não o corpo completo da matéria. Na maioria dos casos, essas informações são suficientes para identificar a localidade e o tipo de ocorrência.
- O uso de feeds RSS é público e gratuito. No entanto, o conteúdo das notícias pertence aos veículos de comunicação e não deve ser reproduzido integralmente. O SafeStreets utiliza apenas os metadados para processamento interno, sem armazenar ou exibir o texto original das matérias.
- A coleta periódica deve ser implementada com `APScheduler` no back-end, garantindo que novos dados sejam processados automaticamente sem intervenção manual.

---

## Fluxo integrado das tecnologias

As quatro tecnologias descritas neste documento atuam em sequência dentro do SafeStreets:

```
RSS de Notícias   →   coleta título e resumo das ocorrências
        ↓
API do Gemini     →   extrai localidade e tipo de ocorrência do texto
        ↓
Nominatim         →   converte o endereço em coordenadas geográficas
        ↓
Leaflet.js        →   exibe o marcador no mapa com os detalhes da ocorrência
```

Cada tecnologia resolve uma etapa específica do problema, e juntas formam o pipeline central de inteligência e visualização do projeto.
