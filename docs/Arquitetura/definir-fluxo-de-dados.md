# Fluxo de Dados: SafeStreets (Ingestão e Processamento)

Conforme definido na decisão de arquitetura, o sistema adota um pipeline estruturado de **ETL (Extração, Tratamento e Transformação)** focado especificamente em dados de segurança pública, acoplado a uma IA dedicada exclusivamente à sumarização dos relatos.
## Estratégia de Extração: Pull Periódico + Cache

O sistema utiliza **pull periódico** (agendado a cada 1h) + sob demanda quando usuário interage:
- Se TTL do cache não expirou: retorna dados do PostgreSQL/Redis
- Se TTL expirou: refaz fetch do feed RSS, parseia, extrai localização, valida e persiste
- **Feed RSS**: Não há scheduler batch continuamente; apenas a cada 1h + opcional sob ação do usuário
---

# Pipeline de Entrada (Backend e Ingestão)

O **FastAPI** gerencia o ciclo de vida da ingestão de dados de forma assíncrona, garantindo que a comunicação com serviços externos não bloqueie a experiência do usuário ao navegar pelo mapa de criminalidade.

### Resilience Patterns Aplicados

- **Rate Limiter**: Protege contra timeouts ou indisponibilidade do feed RSS
- **Retry Exponencial**: Backoff 1s → 2s → 4s → 8s em falhas temporárias
- **Circuit Breaker**: Se feed ficar indisponível por >5 min, retorna cached fallback
- **Timeout**: Máximo 30s por requisição ao feed; falência após

```plaintext
[Feed RSS - Portal de Notícia Correio Braziliense]
           │
           ▼ (HTTPX / Requests Assíncronos + Parser XML)
[Camada de Ingestão (Python)] ──► Validação Inicial (Pydantic) + Extração de Localização
           │
           ▼
[Pipeline de Processamento (ETL)] ──► Enriquecimento (Extração de Localização + Geocodificação)
           │
           ▼
[Módulo de Inteligência Artificial] ──► Gemini (Geração de Resumos Concisos)
           │
           ▼
[Camada de Persistência] ──► Banco de Dados Relacional (PostgreSQL com histórico cacheado)
```
## **Passo a Passo do Fluxo de Ingestão** 

## **1. Extração de Feed RSS**

O backend extrai notícias do feed RSS (Portal de Notícia Correio Braziliense) periodicamente (a cada 1h) ou sob demanda:
- **Check TTL**: Se cache ainda é válido (< 24h), retorna imediatamente
- **Fetch com Resilience**: Se TTL expirou, realiza nova requisição com rate limiting + retry (ex: 1s, 2s, 4s)
- **Parser XML/RSS**: Extrai título, descrição, link, data de publicação
- **Extração de Localização**: Identifica nomes de regiões/endereços no texto (NLP ou regex; ex: "Taguatinga" → RA-026)
- **Tratamento de Falha**: Se feed indisponível, circuit breaker retorna últimos dados cacheados (stale) ou erro explícito
- **Validação Geográfica**: Valida lat/long dentro de [-90, 90] e [-180, 180]; interpola se zona aproximada

## **2. Enriquecimento**

Para cada notícia extraída do feed RSS, o sistema enriquece o conteúdo com dados estruturáveis — sem interpretar ou categorizar o crime:
- Extração e normalização de localização do texto (ex: "Taguatinga" → RA-026 + lat/long centroide)
- Limpeza de conteúdo (remoção de HTML, normalização de caracteres)

> **O sistema não classifica tipos de crime.** Não há lógica de categorização semântica (ex: roubo, homicídio). O texto da notícia é repassado ao Gemini para resumo sem análise prévia de categoria criminal.

## **3. Tratamento e Transformação (Pydantic + ORM)**

O JSON bruto é parseado, validado e transformado em entidade ORM:
1. **Pydantic Validate**: Tipagem forte, datas padronizadas, campos nulos, range geográfico
2. **Criação de Ocorrência**: Dado validado é convertido em modelo SQLAlchemy `Ocorrencia` (mapeado para tabela `ocorrencias_criminais`)
3. **Link to Locais_Pin**: A Ocorrência é associada ao registro em `locais_pin` (ponto geográfico único ou centroide de zona)
4. **Persistência Intermediária**: Registro é salvo em PostgreSQL **antes** da IA (garante falha não perde dado) 

## **4. Processamento por IA**

O texto validado é enviado via API para o Google Gemini. O modelo executa uma única ação: condensar o relato do crime em um resumo ágil e direto.

### Fallback Strategy (Se Gemini Falhar)
- **Timeout/Rate Limit**: Enfileira para retry assíncrono; retorna Ocorrência sem resumo imediatamente
- **Quota Excedida**: Usa resumo genérico padrão ("Crime registrado em [LOCAL] em [DATA]")
- **Erro Permanente**: Log error, marca Ocorrência com `resumo_status='PENDING'`, tenta novamente em 1h
- **Timeout Circuit**: Se Gemini indisponível > 5min, circuit breaker abre; todo card mostra aviso "Resumo indisponível" 

## **5. Persistência Dupla (Cache Distribuido)**

A ocorrência, agora com seu resumo gerado pela IA e suas coordenadas exatas, é persistida em:
1. **PostgreSQL** (principal): Tabela `ocorrencias_criminais` com índices em `locais_pin_id`, `data_criacao`
2. **Redis/In-Memory** (cache): TTL de 24h; respostas ultra-rápidas para queries frequentes (top crimes, region X)

Isso evita:
- Chamadas redundantes à API de segurança
- Reprocessamento no Gemini (economia de tokens)
- Consultas lentas ao banco em picos de tráfego 

## **Pipeline de Saída (Do Banco à Tela do Usuário)** 

O consumo de dados é otimizado para que a interface cartográfica responda de forma fluida e instantânea aos cliques do usuário, focando na exibição clara dos incidentes. 

|**Etapa**|**Responsável**|**Descrição Técnica**||
|---|---|---|---|
|1. Disparo|Frontend (Next.js / Leaflet)|O usuário clica em um ponto do mapa interativo. O Next.js captura Latitude/Longitude e dispara um GET tipado em TypeScript.||
|2. Recepção|Backend (FastAPI)|O backend recebe a requisição. O Pydantic valida o formato numérico das coordenadas.||
|3. Consulta|Banco (PostgreSQL)|O backend verifica se há dados de crimes cacheados para aquele raio espacial.||
|4. Resposta|Backend (FastAPI)|O FastAPI consolida os crimes da região em um OcorrenciasLocalResponse.||
|5. Exibição|Frontend (Next.js)|O Next.js recebe o JSON e o Leaflet renderiza um PIN interativo no mapa.||



## **Estrutura de Dados Espaciais e Conteúdo (Modelo Relacional)** 

O sistema adota um modelo relacional simplificado no PostgreSQL, focado na ligação direta entre coordenadas geográficas e ocorrências criminais resumidas. 

### Semântica de `locais_pin`

`locais_pin` representa um **ponto geográfico único ou centroide de zona**:
- Se coordenada é precisa: um ponto (lat, long) específico
- Se coordenada é aproximada (zona): centroide da zona (ex: região administrativa)
- **Relação 1:0..* com ocorrências**: Um local pode ter múltiplos crimes históricos (série temporal)
- **Índice espacial**: PostgreSQL GiST index em (latitude, longitude) para queries rápidas por bbox

### Validação de Versionamento de Schema

Se API governamental mudar formato (e.g., novo campo, renomear existing):
1. **Backward Compatibility**: Pydantic ignora campos desconhecidos (configurável)
2. **New Required Fields**: Tratadas com default fallback para não quebrar pipeline
3. **Schema Migration**: Se mudança crítica, ADR deve documentar e preparar migration script
4. **Test Coverage**: Testes em fixtures com velhas e novas versões de payload
 

## **Modelagem de Dados no Backend (FastAPI + Pydantic/ORM)** 

As relações são mapeadas conectando os locais físicos diretamente às ocorrências criminais já processadas. 

```plaintext
[locais_pin] 1 ──── 0..* [ocorrencias_criminais]
      │                                                   
      │ 1                                               
      └──────── 0..* [historico_consultas]
```

## **Detalhes das Interações de Fluxo** 

## **Associação Crime-Local** 

O FastAPI garante que toda nova ocorrência criminal obtida da API externa seja vinculada ao id da tabela `locais_pin`. Um mesmo local perigoso pode concentrar múltiplos registros de crimes ao longo do tempo.

## **Geração de Cache Espacial com TTL**

A tabela `historico_consultas` registra:
- `timestamp_ultima_atualizacao`: Quando dados foram fetched pela última vez
- `raio_geografico`: Bbox ou zona consultada
- `ttl_expiracao`: timestamp + 24h

O FastAPI utiliza essas informações para decidir:
- Se TTL ainda é válido (< agora): retorna dados do PostgreSQL/Redis sem nova API call
- Se TTL expirou: realiza novo fetch com resilience pattern (rate limiter + retry + circuit breaker)
- Se fetch falha: circuit breaker retorna dados stale do cache ou erro expl'icito ao usuário
 

## **Benefícios Arquiteturais da Stack Selecionada** 

## **Casamento de Tipos (Pydantic** → **TypeScript)** 

A definição do retorno das ocorrências no FastAPI garante um contrato OpenAPI previsível. O frontend em Next.js gera interfaces TypeScript automaticamente, reduzindo bugs de integração. 

## **Otimização Extrema de Custos** 

Ao delegar ao Gemini apenas a função de resumo, o sistema reduz drasticamente o tamanho dos prompts e o consumo de tokens. O PostgreSQL atua como camada de cache para evitar reprocessamentos. 

## **Confiabilidade e Testabilidade Rigorosa** 

A arquitetura modular do FastAPI facilita testes automatizados utilizando Pytest, garantindo validação contínua dos endpoints e funcionamento correto da rota /health. 

---

## **Decisões Arquiteturais Pendentes (Deve Resultar em ADRs)**

| Decisão | Impacto | Status |
|---------|--------|--------|
| Fallback Gemini: Resumo genérico vs Enfileira retry? | UX: usuário vê card incompleto vs vazio | ⏳ Aguardando ADR |
| TTL do Cache: 24h ou variável por tipo de crime? | Performance vs Consistência | ⏳ Aguardando ADR |
| Redis obrigatório ou apenas in-memory? | Custo de infraestrutura, escalabilidade | ⏳ Aguardando ADR |
| Versionamento de schema: Backward compat automática vs Migration manual? | Resiliência vs Controle | ⏳ Aguardando ADR |
 

