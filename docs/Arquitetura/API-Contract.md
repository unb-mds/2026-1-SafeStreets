# API Contract — SafeStreets

> Especificação formal do contrato JSON entre Frontend e Backend

---

## Propósito

Este documento formaliza a **estrutura de dados** que flui entre Frontend (Next.js) e Backend (FastAPI), garantindo:
- Tipagem consistente entre TS (frontend) e Python (backend)
- Versionamento de API
- Tratamento de erros padronizado
- Exemplos de request/response

> 📌 Complementa [CONTEXT.md](./CONTEXT.md) com detalhe técnico. Consulte [definir-fluxo-de-dados.md](./definir-fluxo-de-dados.md) para fluxo de ingestão.

---

## 1. Modelo de Dados: Ocorrência

### Representação Interna (Backend ORM)

```python
# backend/app/models.py
class Ocorrencia(Base):
    __tablename__ = "ocorrencias_criminais"
    
    id: int (primary_key)
    locais_pin_id: int (foreign_key)
    titulo_noticia: str
    descricao_detalhada: str (nullable)
    data_ocorrencia: datetime
    latitude: float (precision: 6 decimals)
    longitude: float (precision: 6 decimals)
    resumo_gemini: str (nullable)
    resumo_status: str ("COMPLETO" | "PENDING" | "ERRO")
    regiao_administrativa: str (RA code)
    criado_em: datetime (default: now)
    atualizado_em: datetime (default: now)
```

### Request: GET `/ocorrencias` (com Filtros)

```json
GET /ocorrencias?regiao=RA-XXX&data_inicio=2026-06-01&data_fim=2026-06-06

Query Parameters:
- regiao: string (RA code, e.g., "RA-010")
- data_inicio: date (ISO 8601)
- data_fim: date (ISO 8601)
- limit: int (default: 100, max: 500)
- offset: int (default: 0)
```

### Response: 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Roubo em Taguatinga",
      "descricao": "Roubo de veículo na QNL...",
      "data_ocorrencia": "2026-06-06T14:30:00Z",
      "latitude": -15.7975,
      "longitude": -48.0473,
      "resumo": "Veículo roubado em Taguatinga. Sem vítimas.",
      "resumo_status": "COMPLETO",
      "regiao_administrativa": "RA-026",
      "marcador": {
        "id": "pin_1",
        "coordenadas": [-15.7975, -48.0473],
        "risco": "alto"
      }
    }
  ],
  "paginacao": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "proxima_pagina": "...&offset=100"
  }
}
```

### Response: 400 Bad Request

```json
{
  "success": false,
  "error": {
    "codigo": "INVALID_DATE_RANGE",
    "mensagem": "data_inicio deve ser anterior a data_fim",
    "detalhe": "data_inicio=2026-06-06, data_fim=2026-06-01"
  }
}
```

---

## 2. Modelo: Notícia (Montagem no Frontend)

> Notícia é uma **montagem/apresentação** no Frontend de uma Ocorrência enriquecida. Não existe tabela no backend chamada `noticias`.

### Estrutura no Frontend (TypeScript)

```typescript
// frontend/types/Noticia.ts
interface Noticia {
  id: string;
  titulo: string;
  descricao: string;
  data: Date;
  localizacao: {
    latitude: number;
    longitude: number;
    endereco: string;
    regiao: string;
  };
  resumo_ia: string;
  imagem?: string;
  fonte_original?: string;
  status_resumo: "completo" | "pendente" | "erro";
}
```

### Mapeamento Ocorrência → Notícia

```
Backend Response (Ocorrencia) → Frontend (Noticia)
├── id ────────────────► id
├── titulo_noticia ────► titulo
├── descricao ─────────► descricao
├── data_ocorrencia ───► data
├── latitude + longitude ──► localizacao.latitude/longitude
├── regiao_administrativa ─► localizacao.regiao
├── resumo_gemini ─────► resumo_ia
└── resumo_status ─────► status_resumo
```

---

## 3. Endpoint: Card Resumo

### Request: GET `/ocorrencias/{id}`

```json
GET /ocorrencias/1

Response 200:
{
  "id": 1,
  "titulo": "Roubo em Taguatinga",
  "data": "2026-06-06T14:30:00Z",
  "localizacao": {
    "latitude": -15.7975,
    "longitude": -48.0473,
    "endereco": "QNL 02, Taguatinga-DF",
    "regiao": "RA-026"
  },
  "resumo_ia": "Veículo roubado em Taguatinga. Sem vítimas. Polícia foi acionada.",
  "status_resumo": "COMPLETO",
  "fonte_original": "https://www.correiobraziliense.com.br/...",
  "marcador_id": "pin_1",
  "risco_nivel": "alto"
}
```

---

## 4. Tratamento de Fallback: Quando Resumo Falha

### Cenário 1: Gemini Indisponível (Circuit Breaker Aberto)

```json
{
  "id": 1,
  "titulo": "Roubo em Taguatinga",
  "resumo_ia": "Crime de roubo registrado em RA-026 em 2026-06-06.",
  "status_resumo": "FALLBACK_GENERICO",
  "aviso": "Resumo indisponível no momento. Usando resumo padrão."
}
```

### Cenário 2: Gemini em Retry Assíncrono

```json
{
  "id": 1,
  "titulo": "Roubo em Taguatinga",
  "resumo_ia": null,
  "status_resumo": "PENDENTE",
  "aviso": "Resumo sendo gerado. Tente novamente em alguns segundos."
}
```

---

## 5. Versionamento de API

### Estratégia

- **Versão Atual**: `v1` (implícita em `/ocorrencias`)
- **Mudança Não-Compatível**: Nova versão `/v2/ocorrencias`
- **Mudança Compatível**: Sem mudança de versão (ex: novo campo opcional)

### Exemplo: Introduzindo `/v2`

```json
POST /v2/ocorrencias
{
  "titulo": "...",
  "novo_campo_futuro": "valor"
}

// v1 continua funcional:
GET /ocorrencias  → sem novo_campo_futuro
GET /v1/ocorrencias  → explícito, sem novo_campo
GET /v2/ocorrencias  → com novo_campo (backward compat)
```

---

## 6. Autenticação (Futuro)

> Fora do escopo de v0.1.0, documentado para futuro.

```http
GET /ocorrencias
Authorization: Bearer <jwt_token>

Response 401:
{
  "error": "Token inválido ou expirado"
}
```

---

## 7. Rate Limiting (Para API Externa)

> Não exposto ao frontend, mas documentado para contexto interno.

```python
# Backend tratamento de rate limit da API governamental
# Retentar com backoff: 1s → 2s → 4s → 8s
# Circuit breaker abre após 5 tentativas
# Retorna dados stale ou erro ao cliente
```

---

## 8. Correlação com CONTEXT.md

| Termo em CONTEXT.md | Mapeamento na API |
|---|---|
| Notícia de monitoramento urbano | Estrutura `Noticia` no frontend (montada a partir de `Ocorrencia`) |
| Ocorrência | Recurso `/ocorrencias` (tabela `ocorrencias_criminais`) |
| Marcador (pin) | Campo `marcador_id` em cada Ocorrência |
| Resumo gerado por IA | Campo `resumo_gemini` + status |
| Região administrativa | Campo `regiao_administrativa` |
| Indicador de risco | Campo `risco_nivel` (calculado a partir da contagem de ocorrências da região) |
| Cache espacial | TTL de 24h em histórico_consultas |
| Dashboard | Consome múltiplos `/ocorrencias` com filtros |

---

## 9. Mudanças Futuras Esperadas

Quando os seguintes ADRs forem resolvidos, este contrato será atualizado:

- [ ] **ADR-001**: Definir resposta exata quando resumo Gemini falha
- [ ] **ADR-002**: Definir se TTL variável por região administrativa
- [ ] **ADR-004**: Definir estratégia de schema versioning

---

## Referências

- [CONTEXT.md](./CONTEXT.md#termos-do-domínio) — Glossário de termos
- [definir-fluxo-de-dados.md](./definir-fluxo-de-dados.md) — Pipeline de ingestão
- [ADRs-PENDENTES.md](./ADRs-PENDENTES.md) — Decisões arquiteturais
- [backend/app/models.py](../../backend/app/models.py) — Implementação ORM
