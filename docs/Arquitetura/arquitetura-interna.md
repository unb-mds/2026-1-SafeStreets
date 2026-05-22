# Arquitetura Interna — SafeStreets

Documento que descreve como o projeto SafeStreets está estruturado internamente, cobrindo a organização de pastas, o fluxo de dados e a arquitetura em camadas adotada.

---

## 1. Estrutura de Pastas

O projeto é dividido em três grandes blocos: `frontend/`, `backend/` e `database/`.

```
project/
├── docs/
├── frontend/                  # Interface do usuário — TypeScript + Leaflet
│   └── src/
│       ├── view/              # Controla telas e mapa Leaflet
│       ├── utils/             # Funções auxiliares de cálculo
│       ├── styles/            # CSS da aplicação
│       ├── services/          # Fetch API — centraliza todas as chamadas HTTP ao backend
│       ├── types/             # Interfaces TypeScript que espelham os schemas do backend
│       └── components/        # Imagens e arquivos reutilizáveis
│
├── backend/                   # API REST — Python + FastAPI
│   ├── routes/                # Requisições HTTP (entrada da API)
│   ├── services/              # Regras de negócio, geocoding (Nominatim, validar DF)
│   ├── repositories/          # Acesso ao banco de dados
│   ├── models/                # Define tabelas via SQLAlchemy
│   ├── schemas/               # Valida entrada e saída com Pydantic
│   ├── integrations/          # Isola APIs externas (Nominatim, dados.df.gov.br)
│   ├── core/                  # Centraliza conexão com o banco e variáveis de ambiente
│   └── tests/                 # Testes para cada componente
│
└── database/                  # Scripts SQL, migrações e estrutura do banco
```

---

## 2. Tecnologias por Camada

| Camada | Localização | Tecnologia | Responsabilidade |
|--------|------------|------------|-----------------|
| Interface | `frontend/src/view/` | TypeScript + Leaflet.js | Mapa interativo, dashboards e filtros |
| Comunicação | `frontend/src/services/` | TypeScript (Fetch API) | Chamadas HTTP ao backend FastAPI |
| Tipagem | `frontend/src/types/` | TypeScript (interfaces) | Espelha os schemas do backend |
| Roteamento | `backend/routes/` | Python + FastAPI | Recebe requisições HTTP, controla fluxo |
| Negócio | `backend/services/` | Python | Regras de negócio, geocoding, validação do DF |
| Integração | `backend/integrations/` | Python (httpx) | Nominatim (OSM) e dados.df.gov.br |
| Modelos | `backend/models/` | Python + SQLAlchemy | Mapeamento das tabelas do PostgreSQL |
| Validação | `backend/schemas/` | Python + Pydantic | Validação de entrada e saída da API |
| Dados | `backend/repositories/` | Python + GeoAlchemy2 | Queries no PostgreSQL + PostGIS |
| Banco | `database/` | PostgreSQL + PostGIS | Armazenamento com suporte geoespacial |

---

## 3. Arquitetura em Camadas

O backend segue o padrão de **arquitetura em camadas**, onde cada camada tem responsabilidade única e se comunica apenas com a camada imediatamente abaixo.

```
┌─────────────────────────────────────────────────────┐
│         Interface: Dashboards, Filtros e Mapas       │
│              TypeScript + Leaflet.js                 │
└───────────────────────┬─────────────────────────────┘
                        ↓ HTTP (HTTPS)
┌─────────────────────────────────────────────────────┐
│     Camada de Aplicação: Routers                     │
│     Recebe requisições e controla o fluxo            │
│              Python + FastAPI                        │
└───────────────────────┬─────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│     Camada de Negócios: Services                     │
│     Regras de negócio + chama integrations/          │
│     Python — Nominatim via integrations/             │
└───────────────────────┬─────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│     Camada de Modelo: Models + Schemas               │
│     Estrutura dos dados + validação Pydantic         │
│     SQLAlchemy + Pydantic v2                         │
└───────────────────────┬─────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│     Camada de Dados: Repository                      │
│     Acesso ao banco PostgreSQL + PostGIS             │
│     SQLAlchemy + GeoAlchemy2                         │
└─────────────────────────────────────────────────────┘
```

### Princípio adotado

Cada camada **não conhece** a camada acima dela. O `repository` não sabe que existe um `router`. O `service` não faz queries SQL diretamente. Isso garante que mudanças em uma camada não quebrem as outras.

---

## 4. Fluxo de Dados — Registro de Ocorrência

Descreve o caminho completo de uma interação do cidadão até o banco de dados e de volta ao mapa.

```
1. Busca no Mapa (Front-End / Leaflet)
         ↓ captura lat/lon do clique
2. Back-End (FastAPI)
         ↓ recebe POST /occurrences
3. Consulta API Aberta (dados.df.gov.br)
         ↓ busca ocorrências usando Latitude e Longitude
4. Busca ocorrências usando a Latitude e Longitude
         ↓
5. Para cada notícia/evento encontrado:
   └── Busca o conteúdo ou texto completo
         ↓
6. Processa e normaliza os dados (Pydantic)
         ↓
7. Resume notícias (Gemini / Agente de IA)
         ↓
8. Atualiza banco (PostgreSQL)
         ↓
9. Retorna o JSON consolidado
         ↓
10. Renderiza o PIN no Mapa (Front-End / Leaflet)
```

### Detalhamento do fluxo por componente

| Etapa | Componente | Tecnologia | Ação |
|-------|-----------|------------|------|
| 1 | `view/map.ts` | Leaflet.js | Captura evento de clique e extrai coordenadas |
| 2 | `services/api.ts` | TypeScript Fetch | `POST /occurrences {lat, lon}` para o backend |
| 3 | `routes/occurrences.py` | FastAPI | Recebe e valida a requisição via Pydantic |
| 4 | `services/occurrence_service.py` | Python | Chama `integrations/dados_df.py` com lat/lon |
| 5 | `integrations/dados_df.py` | Python (httpx) | Consulta `dados.df.gov.br` — API aberta do GDF |
| 6 | `schemas/occurrence.py` | Pydantic v2 | Normaliza e valida os dados retornados |
| 7 | Agente de IA (externo) | Gemini API | Resume o conteúdo das notícias encontradas |
| 8 | `repositories/occurrence_repository.py` | SQLAlchemy + PostGIS | `INSERT` com `GEOMETRY(POINT, 4326)` |
| 9 | `routes/occurrences.py` | FastAPI | Serializa resposta com schema Pydantic |
| 10 | `view/map.ts` | Leaflet.js | Adiciona PIN no mapa na posição original do clique |

---

## 5. Integrações Externas

| Serviço | Camada | Tecnologia | Uso |
|---------|--------|------------|-----|
| **Nominatim (OSM)** | `integrations/nominatim.py` | HTTP (httpx) | Geocoding reverso: converte lat/lon em endereço e bairro do DF |
| **dados.df.gov.br** | `integrations/dados_df.py` | HTTP (httpx) | Busca ocorrências e notícias abertas do GDF por coordenada |
| **Agente de IA (Gemini)** | `services/` | API externa | Resume textos de notícias e classifica grau de risco |

---

## 6. Banco de Dados

- **Tecnologia:** PostgreSQL 15 + extensão PostGIS 3.3
- **Localização:** `database/` — scripts SQL, migrações e estrutura
- **Container:** imagem `postgis/postgis:15-3.3` no Docker

### Campo geoespacial

Todas as ocorrências são armazenadas com coordenadas no tipo nativo do PostGIS:

```sql
-- Tipo do campo location na tabela occurrences
location GEOMETRY(POINT, 4326)

-- Índice espacial obrigatório para performance
CREATE INDEX idx_occurrences_location
ON occurrences USING GIST (location);

-- Query exemplo: ocorrências num raio de 2km
SELECT * FROM occurrences
WHERE ST_DWithin(
  location::geography,
  ST_MakePoint(-47.9292, -15.7801)::geography,
  2000
);
```

---

## 7. Infraestrutura

O projeto roda inteiramente via **Docker + Docker Compose**, garantindo ambiente consistente entre todos os membros do time.

| Serviço | Imagem | Porta | Descrição |
|---------|--------|-------|-----------|
| `frontend` | `nginx:alpine` | 3000 | Serve o build TypeScript estático |
| `backend` | `python:3.11-slim` | 8000 | API FastAPI com Uvicorn |
| `db` | `postgis/postgis:15-3.3` | 5432 | PostgreSQL com PostGIS habilitado |

---
