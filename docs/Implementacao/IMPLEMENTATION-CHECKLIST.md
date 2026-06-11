# Implementation Checklist — SafeStreets v0.1.0+

> Referência de tudo que foi refinado na documentação e precisa ser implementado/validado no código

---

## ✅ Documentação Concluída (não requer mudança de código)

### Core Documentation
- [x] **CONTEXT.md** — Glossário de domínio refinado com 19 termos
- [x] **definir-fluxo-de-dados.md** — Pipeline ETL detalhado com resilience patterns
- [x] **API-Contract.md** — Especificação de JSON request/response
- [x] **requisitos.md** — Requisitos alinhados com terminologia
- [x] **definições-de-back.md** — Stack backend com referências cruzadas
- [x] **definicoes-front-end.md** — Stack frontend com mapeamento Ocorrência→Notícia

### Architecture Decisions
- [x] **ADR-001-Gemini-Fallback-Strategy.md** — 4 opções de fallback
- [x] **ADRs-PENDENTES.md** — Sumário de 4 ADRs requerendo consenso

---

## ⏳ Decisões Arquiteturais (Requer Team Consensus)

### ADR-001: Gemini Fallback Strategy
**Status**: ⏳ Pendente

**Questão**: Como backend reage quando Google Gemini falha?

**Opções Recomendadas**:
- [ ] Opção A: Retorna card sem resumo (vazio)
- [ ] Opção B: Enfileira retry assíncrono  
- [ ] Opção C: Usa resumo genérico padrão
- [x] **Opção D**: Circuit breaker + fallback híbrido ← **RECOMENDADA**

**Ação**: Team decision → Atualizar [ADR-001](./docs/Arquitetura/ADR-001-Gemini-Fallback-Strategy.md) com decisão

---

### ADR-002: Cache TTL Strategy
**Status**: ⏳ Pendente

**Questão**: Por quanto tempo dados devem ser válidos?

**Opções**:
- [ ] A: TTL fixo 24h para todos
- [ ] B: TTL variável por tipo de crime
- [ ] C: TTL baseado em frequência de API
- [ ] D: TTL adaptativo por trending

**Ação**: Team decision → Implementar em backend (historico_consultas.ttl_expiracao)

---

### ADR-003: Redis Necessity
**Status**: ⏳ Pendente

**Questão**: Redis é obrigatório ou opcional?

**Opções**:
- [ ] A: Obrigatório (distributed cache)
- [ ] B: Opcional (in-memory only)
- [ ] C: Estratificado (prod=Redis, dev=in-memory)

**Ação**: Team decision → Atualizar docker-compose.yml

---

### ADR-004: Schema Versioning
**Status**: ⏳ Pendente

**Questão**: Responder a mudanças na estrutura XML do feed RSS do Correio Braziliense?

**Opções**:
- [ ] A: Backward compat automática (Pydantic default)
- [ ] B: Migration manual (fail-fast)
- [ ] C: Versioning de endpoints (/v1 vs /v2)

**Ação**: Team decision → Implementar em models.py

---

## 🔴 Código: Deve Implementar/Validar

### backend/app/models.py

**Atual**:
```python
class Ocorrencia(Base):
    __tablename__ = "ocorrencias"
    id = Column(Integer, primary_key=True)
    titulo_noticia = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
```

**Deve ter**:
- [x] Tabela: `ocorrencias_criminais` (conforme API-Contract.md)
- [ ] Campo: `locais_pin_id` (foreign key)
- [ ] Campo: `tipo_crime` (string, indexed)
- [ ] Campo: `data_ocorrencia` (datetime)
- [ ] Campo: `descricao_detalhada` (nullable)
- [ ] Campo: `resumo_gemini` (nullable)
- [ ] Campo: `resumo_status` enum("COMPLETO"|"PENDENTE"|"ERRO"|"FALLBACK_GENERICO")
- [ ] Campo: `regiao_administrativa` (RA code)
- [ ] Campo: `criado_em` (datetime default now)
- [ ] Campo: `atualizado_em` (datetime default now)
- [ ] Índice espacial: GiST em (latitude, longitude)
- [ ] Índice: em (regiao_administrativa, data_ocorrencia) para queries por filtro

**Referência**: [API-Contract.md#1-modelo-de-dados-ocorrência](./docs/Arquitetura/API-Contract.md#1-modelo-de-dados-ocorrência)

---

### backend/app/services.py (Novo/Expandido)

**Deve ter**:

#### ServiçoGemini
- [ ] `sumarizar(texto: str) → str | None` com retry exponencial
- [ ] Circuit breaker (abrir após 5 falhas)
- [ ] Timeout 30s
- [ ] Fallback: resumo genérico se falhar
- [ ] Log de tentativas (para monitoring)

**Referência**: [ADR-001](./docs/Arquitetura/ADR-001-Gemini-Fallback-Strategy.md)

#### ServiçoIngestão
- [ ] Rate limiter para feed RSS (Correio Braziliense)
- [ ] Retry exponencial: 1s → 2s → 4s → 8s
- [ ] Circuit breaker (abrir após 5 falhas)
- [ ] **Parser XML/RSS** (feedparser library)
  - [ ] Extração de título, descrição, link, data, guid
  - [ ] Tratamento de feeds malformados
- [ ] **Extração de Localização** (NLP ou regex)
  - [ ] Mapeamento de nomes de RA → lat/long
  - [ ] Fallback: geocodificação ou centroide do DF
- [ ] **Classificação de Crime** (keyword matching)
  - [ ] Regex por tipo (roubo, homicídio, etc.)
  - [ ] Fallback: "outro"
- [ ] Validação Pydantic (entrada)
- [ ] Transformação para ORM Ocorrencia
- [ ] Deduplicação por `id_externo_rss`
- [ ] Persistência dupla (PostgreSQL + Redis)

**Referência**: [definir-fluxo-de-dados.md](./docs/Arquitetura/definir-fluxo-de-dados.md)

---

### backend/app/routers/ocorrencias.py (Novo)

**Endpoints**:

#### GET /ocorrencias
- [x] Query params: regiao, data_inicio, data_fim, limit, offset
- [ ] Response: 200 com paginação (conforme API-Contract.md)
- [ ] Response: 400 se data_inicio > data_fim
- [ ] Response: 429 se rate limit excedido
- [ ] Response: 503 se feed RSS indisponível

**Referência**: [API-Contract.md#2-request-get-ocorrências-com-filtros](./docs/Arquitetura/API-Contract.md#request-get-ocorrências-com-filtros)

#### GET /ocorrencias/{id}
- [ ] Response: Ocorrência com resumo (ou status PENDENTE/FALLBACK)
- [ ] Consultar cache antes de BD
- [ ] TTL aplicado conforme ADR-002

**Referência**: [API-Contract.md#3-endpoint-card-resumo](./docs/Arquitetura/API-Contract.md#3-endpoint-card-resumo)

---

### frontend/types/Noticia.ts

**Deve ter**:
```typescript
interface Noticia {
  id: string;
  titulo: string;
  descricao: string;
  tipo_crime: string;
  data: Date;
  localizacao: {
    latitude: number;
    longitude: number;
    endereco: string;
    regiao: string;
  };
  resumo_ia: string | null;
  status_resumo: "completo" | "pendente" | "erro" | "fallback_generico";
  // ...
}
```

**Referência**: [API-Contract.md#estrutura-no-frontend-typescript](./docs/Arquitetura/API-Contract.md#estrutura-no-frontend-typescript)

---

### frontend/hooks/useOcorrencias.ts (Novo)

**Deve fazer**:
- [ ] Fetch GET /ocorrencias com filtros
- [ ] Polling se `resumo_ia === null && status_resumo === "PENDENTE"` (máx 5 vezes)
- [ ] Mapeamento Ocorrência → Noticia
- [ ] Tratamento de erro 503 (mostrar fallback message)

**Referência**: [API-Contract.md#cenário-1-gemini-indisponível-circuit-breaker-aberto](./docs/Arquitetura/API-Contract.md#cenário-1-gemini-indisponível-circuit-breaker-aberto)

---

### database.py (Validação)

**Deve ter**:
- [x] Conexão PostgreSQL
- [ ] Pool de conexões configurado
- [ ] Suporte a GiST index (PostGIS? ou índice simples?)

**Referência**: [CONTEXT.md#cache-espacial](./docs/Arquitetura/CONTEXT.md#cache-espacial)

---

### Testes (Pytest)

**Casos que devem passar**:

#### test_ocorrencia_model.py
- [ ] Criar Ocorrencia com campos obrigatórios
- [ ] Validar latitude ∈ [-90, 90]
- [ ] Validar longitude ∈ [-180, 180]
- [ ] Validar precisão: 6 casas decimais (~0.11m)

#### test_gemini_fallback.py
- [ ] Mock Gemini timeout → volta com status "PENDENTE"
- [ ] Mock Gemini erro → volta com status "FALLBACK_GENERICO"
- [ ] Mock Gemini success → volta com status "COMPLETO"
- [ ] Verificar circuit breaker abre após 5 falhas

#### test_api_resilience.py
- [ ] Mock feed RSS timeout → retry 1s → 2s → 4s
- [ ] Mock feed RSS indisponível > 5min → circuit breaker abre
- [ ] Mock postgres indisponível → falha gracefully
- [ ] Testar parser RSS com feeds malformados

#### test_rss_processing.py (NOVO)
- [ ] Parse XML válido → extração correta de campos
- [ ] Extração de RA: "Taguatinga" → RA-026
- [ ] Classificação de crime: "homicídio" → "homicídio"
- [ ] Deduplicação: mesmo `id_externo_rss` não duplica
- [ ] Geocodificação fallback: sem RA → centroide DF

#### test_api_contract.py
- [ ] GET /ocorrencias retorna schema conforme API-Contract.md
- [ ] GET /ocorrencias?regiao=RA-XXX retorna apenas aquela região
- [ ] GET /ocorrencias?data_inicio > data_fim retorna 400

---

## 📋 Documentação: Falta Completar

### README.md (Top-Level)
- [ ] Adicionar link para [CONTEXT.md](./docs/Arquitetura/CONTEXT.md)
- [ ] Adicionar instrução: "Leia CONTEXT.md primeiro para entender termos"

### docs/README.md (Arquitetura)
- [ ] Criar índice com links para:
  - CONTEXT.md
  - API-Contract.md
  - definir-fluxo-de-dados.md
  - ADRs-PENDENTES.md

### backend/README.md
- [ ] Setup local (docker-compose up)
- [ ] Pytest: `pytest tests/`
- [ ] Swagger: http://localhost:8000/docs

### frontend/README.md
- [ ] Setup local (npm install)
- [ ] Dev server: `npm run dev`
- [ ] Referência ao API-Contract.md

---

## 🚀 Ordem de Prioridade

### Phase 1: Team Alignment (Now)
1. ⏳ **Resolver ADR-001** (Gemini fallback)
2. ⏳ **Resolver ADR-002** (Cache TTL)
3. ⏳ **Resolver ADR-003** (Redis)
4. ⏳ **Resolver ADR-004** (Schema versioning)

### Phase 2: Backend Implementation
5. ✏️ Atualizar `models.py` conforme modelo refinado
6. ✏️ Implementar `services.py` com resilience
7. ✏️ Criar `routers/ocorrencias.py` com endpoints
8. ✏️ Adicionar testes Pytest
9. ✏️ Validar Swagger docs

### Phase 3: Frontend Implementation
10. ✏️ Criar `types/Noticia.ts` com mapeamento
11. ✏️ Implementar `hooks/useOcorrencias.ts`
12. ✏️ Testar polling de resumo PENDENTE
13. ✏️ Testar tratamento de erro 503

### Phase 4: Integration & Deployment
14. ✏️ E2E tests (cypress)
15. ✏️ Validar cache TTL conforme ADR-002
16. ✏️ Validar circuit breaker em carga
17. ✏️ Deploy staging

---

## 📚 Referências Rápidas

| Documento | Propósito | Link |
|-----------|-----------|------|
| CONTEXT.md | Glossário de termos | [docs/Arquitetura/CONTEXT.md](./docs/Arquitetura/CONTEXT.md) |
| API-Contract.md | Estrutura de JSON | [docs/Arquitetura/API-Contract.md](./docs/Arquitetura/API-Contract.md) |
| **RSS-Integration.md** | **Parser RSS + Extração de Dados** | **[docs/Arquitetura/RSS-Integration.md](./docs/Arquitetura/RSS-Integration.md)** |
| definir-fluxo-de-dados.md | Pipeline e resilience | [docs/Arquitetura/definir-fluxo-de-dados.md](./docs/Arquitetura/definir-fluxo-de-dados.md) |
| ADRs-PENDENTES.md | Decisões a fazer | [docs/Arquitetura/ADRs-PENDENTES.md](./docs/Arquitetura/ADRs-PENDENTES.md) |
| ADR-001 | Gemini Fallback | [docs/Arquitetura/ADR-001-Gemini-Fallback-Strategy.md](./docs/Arquitetura/ADR-001-Gemini-Fallback-Strategy.md) |
| requisitos.md | User stories | [docs/Requisitos/requisitos.md](./docs/Requisitos/requisitos.md) |

---

**Mantido por**: Grill-with-Docs Analysis  
**Data da última atualização**: 2026-06-06  
**Próxima revisão**: Após resolução dos 4 ADRs
