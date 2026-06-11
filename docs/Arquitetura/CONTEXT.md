# CONTEXT

## Propósito
Este documento define o vocabulário e os conceitos fundamentais do domínio SafeStreets. Serve como referência canônica para alinhar equipe, documentação, requisitos e implementação em torno dos termos de negócio usados no sistema.

## Escopo do sistema
SafeStreets é uma plataforma de monitoramento de segurança urbana que transforma notícias públicas em ocorrências georreferenciadas e visualizações interativas para apoio à conscientização sobre segurança no Distrito Federal. O sistema **não analisa, interpreta ou classifica** o conteúdo das notícias — ele extrai localização, persiste os dados e delega a síntese textual exclusivamente ao Google Gemini.

---

## Termos do domínio

### SafeStreets
- Plataforma de monitoramento e análise de segurança urbana focada no Distrito Federal.

### Notícia (de monitoramento urbano)
- Relato sobre um evento de segurança pública que o usuário visualiza no sistema. Resultado do processamento e enriquecimento de dados brutos coletados de feeds RSS (e.g., Portal de Notícia do Correio Braziliense). Exibida no feed de notícias e pode ser selecionada para visualizar detalhes em card resumo.

### Ocorrência
- Evento de segurança pública estruturado no backend que resulta do enriquecimento e processamento de dados brutos. Representa um incidente validado e persistido. Mapeado em um **Marcador (pin)** no mapa interativo. É a abstração interna; o usuário interage com a **Notícia de monitoramento urbano** que a representa.

### Ingestão de dados
- Processo de coleta, validação, transformação e enriquecimento de notícias brutas (via feed RSS) em ocorrências estruturadas através de um pipeline ETL (Extração, Tratamento, Transformação). Executado periodicamente (a cada 1h) e sob demanda. O sistema **não classifica tipos de crime** durante a ingestão; apenas extrai localização geográfica e envia o texto para resumo via Gemini.

### Enriquecimento
- Etapa do pipeline ETL que normaliza e complementa os dados brutos extraídos do feed RSS. Compreende: extração de região administrativa a partir do texto (ex: "Taguatinga" → RA-026 + lat/long centroide), limpeza de conteúdo (remoção de HTML, normalização de caracteres) e validação geográfica. **Não inclui classificação de tipo de crime.**

### Feed RSS
- Stream de notícias em formato XML (RSS 2.0) do Portal de Notícia Correio Braziliense. Fornece título, descrição, link, data e categoria de cada notícia sobre segurança pública no DF.

### Localização aproximada
- Coordenadas geográficas estimadas (latitude e longitude) associadas a uma ocorrência, usadas para exibição no mapa interativo.

### Região administrativa
- Subdivisão oficial do Distrito Federal (e.g., Ceilândia, Taguatinga) usada para agrupar, filtrar e analisar ocorrências.

### Mapa interativo
- Visualização geográfica que exibe ocorrências georreferenciadas e permite ao usuário explorar áreas, filtrar por região e investigar pontos de risco.

### Marcador (pin)
- Representação visual no mapa interativo que indica a posição e presença de uma ocorrência ou ponto de interesse de segurança.

### Indicador de risco
- Métrica calculada pelo backend que representa o nível de perigo de uma **região administrativa**, derivada exclusivamente da **quantidade de ocorrências registradas nessa região**. Quanto maior o volume de ocorrências, maior o indicador de risco. Não depende de classificação de tipo de crime — o risco é uma função da contagem, não do conteúdo das notícias. Exibido no card resumo e nos marcadores do mapa (ex: baixo / médio / alto).

### Card resumo
- Painel de informação exibido quando o usuário seleciona uma ocorrência ou região no mapa. Contém: título, risco, localização exata, data, número identificador (RA-XXXXX) e resumo gerado por IA.

### Resumo gerado por IA
- Texto sintetizado automaticamente (via Google Gemini) que condensa informações de uma ocorrência, facilitando a leitura rápida pelo usuário final.

### Dashboard
- Interface que consolida estatísticas, gráficos interativos, filtros e indicadores para análise de ocorrências e tendências de segurança urbana.

### Filtro
- Instrumento usado para refinar a visualização de ocorrências por **região administrativa** (ex: Ceilândia, Taguatinga) e **período/data**, tanto no mapa quanto no dashboard. O sistema não oferece filtro por tipo de crime, pois não realiza classificação de categorias criminais.

### API
- Serviço backend (FastAPI) que expõe dados de notícias, ocorrências, marcadores, estatísticas e métricas para consumo pelo frontend (Next.js).

### Endpoint
- URL específica da API que disponibiliza um recurso ou funcionalidade: e.g., `/ocorrencias`, `/filtros`, `/dados-region`.

### Cache espacial
- Armazenamento em memória ou banco de dados (PostgreSQL) de ocorrências e estatísticas geográficas para evitar buscas repetidas na mesma área e otimizar performance.

### Feed de notícias
- Lista dinâmica de notícias sobre segurança exibida na página inicial, permitindo ao usuário acessar e detalhar eventos de interesse.

### TTL (Time-To-Live) do Cache
- Período de validade dos dados cacheados no PostgreSQL. Após expiração, o sistema refaz o fetch na API externa. Padrão: 24 horas para dados históricos; atualização em tempo real para alertas críticos.

### Fallback Strategy (Gemini)
- Comportamento do sistema quando a API Google Gemini falha (timeout, quota, erro). Alternativas: (1) Retorna notícia sem resumo, (2) Usa resumo genérico padrão, (3) Enfileira para retry assíncrono. Decisão: A ser definida em ADR.

### Rate Limiting & Resilience
- Mecanismos para lidar com limita­ções do feed RSS (Portal de Notícia Correio Braziliense): retry exponencial, circuit breaker, fila de requisições e backoff adaptativo. Protege o sistema contra picos de tráfego, timeouts de conexão e indisponibilidade da fonte.

### Precisão Geográfica
- Coordenadas (lat/long) armazenadas com 6 casas decimais (~0.11m de precisão). Validação: latitude ∈ [-90, 90], longitude ∈ [-180, 180]. Interpolação: se coordenada for aproximada (zona), centroide da região é usado.

---

## Fluxo principal: Do dado bruto à visualização

1. **Coleta (Sob Demanda)**: Notícias são extraídas do feed RSS (Portal de Notícia Correio Braziliense) quando usuário interage com o sistema ou por agendamento periódico (e.g., a cada 1h). Sistema verifica TTL do cache; se expirado, refaz fetch do feed.
2. **Validação**: Pydantic valida e padroniza os dados (datas, coordenadas, campos nulos, range geográfico).
3. **Enriquecimento**: Sistema extrai e normaliza a localização geográfica do texto (nome de RA → lat/long centroide) e limpa o conteúdo bruto. **Não classifica tipo de crime.**
4. **Resumo IA**: Google Gemini gera um resumo conciso. Se falhar: fallback strategy (resumo genérico ou enfileira retry).
5. **Persistência Dupla**: Ocorrência é persistida em PostgreSQL (principal) e cache em memória (redis/app) para respostas ultrarrápidas. TTL: 24h ou conforme política de SLA.
6. **Visualização**: Frontend (Next.js/Leaflet) consome API e exibe ocorrências como marcadores no mapa interativo e cards resumo no dashboard.

---

## Estrutura técnica

### Frontend
- **Framework**: Next.js + TypeScript
- **Visualização**: Leaflet para mapas interativos
- **Estilos**: CSS Modules
- **Consumo**: API RESTful via endpoints

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Validação**: Pydantic (em 2 pontos: entrada externa + cache)
- **Banco**: PostgreSQL (persistência principal)
- **Cache**: Redis ou in-memory (respostas de consultas frequentes)
- **Integração IA**: Google Gemini API (resumo; fallback em falha)
- **Resilience**: Retry exponencial, Circuit Breaker, Rate Limiter
- **Documentação**: Swagger/OpenAPI automático

### Arquitetura de camadas
- **Controllers/Routes**: Recebem requisições HTTP
- **Services**: Encapsulam lógica de negócio e transformação
- **Repositories**: Gerenciam persistência e queries
- **Models**: Definem entidades e relacionamentos

---

## Fora do escopo

- Não é um sistema de resposta emergencial direto.
- Não intervém fisicamente em incidentes.
- Não substitui órgãos oficiais de segurança pública.
- Não realiza vigilância em tempo real com câmeras ou sensores físicos.
- Não coleta dados de cidadãos; apenas processa informações públicas.
- **Não classifica automaticamente tipos ou categorias de crimes** (ex: roubo, homicídio). O texto da notícia é passado integralmente ao Gemini para resumo, sem análise semântica própria.
- Não realiza análise preditiva de criminalidade nem geração de alertas proativos.

---

## Notas de uso

Este contexto deve permanecer **devoid de detalhes de implementação**. Use-o como glossário para:
- Revisar e escrever documentação de requisitos e arquitetura
- Alinhar terminologia em discussões de design
- Validar modelos de dados e fluxos de integração
- Onboard novos membros da equipe

Para decisões arquiteturais e trade-offs, consulte:
- 📄 [`/docs/Arquitetura/`](./README.md) — Arquivos de arquitetura
- 🔴 [`ADRs-PENDENTES.md`](./ADRs-PENDENTES.md) — Decisões que requerem consenso da equipe (Gemini fallback, TTL, Redis, schema versioning)
