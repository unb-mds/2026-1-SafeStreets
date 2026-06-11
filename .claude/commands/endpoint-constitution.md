# Constitution — Skill: endpoint

> Checklist de auto-revisão. Antes de entregar qualquer output, o modelo DEVE executar este processo internamente.

---

## Passo 1 — Gere o rascunho

Produza a resposta normalmente (código, tabela ou docstring).

---

## Passo 2 — Aplique os princípios como checklist

### C1 · Vocabulário de domínio

- Rascunho usa `Noticia` em código backend? → substituir por `Ocorrencia`
- Rascunho menciona tabela `noticias` no banco? → não existe; remover
- Rascunho trata `marcador` como entidade separada? → é campo dentro de `Ocorrencia`

### C2 · Envelope de resposta

- Sucesso retorna `{ "success": true, "data": [...] }`? → obrigatório
- Erro retorna `{ "success": false, "error": { "codigo", "mensagem", "detalhe" } }`? → obrigatório
- Lista retorna `{ "paginacao": { "total", "limit", "offset", "proxima_pagina" } }`? → obrigatório
- Algum campo tem nome diferente do `API-Contract.md`? → alinhar antes de entregar

### C3 · Tipos e validação

- Coordenadas têm 6 casas decimais e validação de range? → obrigatório
- `resumo_status` usa valor fora do enum `("COMPLETO","PENDENTE","ERRO","FALLBACK_GENERICO")`? → corrigir
- Código RA está no formato `RA-XXX` com hífen? → validar com regex `^RA-\d{3}$`
- `limit` tem `le=500` e `offset` tem `ge=0`? → obrigatório em listagens

### C4 · Status HTTP

- Listagem retorna 200 (não 201)? → verificar
- Recurso não encontrado retorna 404 com envelope de erro padrão? → verificar
- Parâmetro inválido retorna 400 (não 422 exposto diretamente ao cliente)? → verificar

### C5 · ADR awareness

Sinalize se o endpoint toca qualquer uma das decisões pendentes:

| Área | ADR | Sinalização obrigatória |
|---|---|---|
| Integração Gemini | ADR-001 | `⚠️ ADR-001 pendente — comportamento de fallback indefinido` |
| Cache / TTL | ADR-002 | `⚠️ ADR-002 pendente — duração do TTL indefinida` |
| Infraestrutura cache | ADR-003 | `⚠️ ADR-003 pendente — Redis vs in-memory indefinido` |
| Campo novo no schema | ADR-004 | `⚠️ ADR-004 pendente — estratégia de versionamento indefinida` |

**Regra**: se uma ADR for sinalizada, não tome a decisão pelo usuário — descreva o impacto e pergunte.

### C6 · Segurança

- Código usa SQL raw ou f-string em query? → proibido; usar ORM / parâmetros bindados
- Endpoint expõe campos além do definido no contrato? → remover do `response_model`
- Usa `print()` para log? → substituir por `logger.*`

### C7 · Completude por tipo de tarefa

| Tarefa | O output inclui... |
|---|---|
| `gerar` | rota FastAPI + schema Pydantic + exemplo de resposta |
| `validar` | tabela com todos os campos do contrato comparados linha a linha |
| `documentar` | summary, description, params e responses no padrão OpenAPI |

---

## Passo 3 — Corrija e entregue

Corrija tudo que violou os princípios acima.

Se uma violação não puder ser resolvida sem decisão do usuário (ex: ADR pendente), entregue o output com a ressalva destacada imediatamente acima do trecho afetado:

```
> ⚠️ ADR-00X pendente: [descreva o impacto aqui]. Confirme a decisão antes de usar em produção.
```
