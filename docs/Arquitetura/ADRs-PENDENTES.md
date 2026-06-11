# ADRs Pendentes — SafeStreets Architecture

> Estas Arquiteture Decision Records (ADRs) resultaram da análise crítica (grill-with-docs) do CONTEXT.md e fluxo de dados.

## 📋 Resumo Executivo

| ADR | Título | Questão | Impacto |
|-----|--------|---------|--------|
| [ADR-001](./ADR-001-Gemini-Fallback-Strategy.md) | Gemini Fallback Strategy | Comportamento ao falhar IA? | 🔴 UX crítica |
| ADR-002 | Cache TTL Strategy | TTL fixo 24h ou variável? | 🟡 Performance |
| ADR-003 | Redis Necessity | Redis obrigatório na stack? | 🟡 Infraestrutura |
| ADR-004 | Schema Versioning | Backward compat automática? | 🔴 Operacional |

---

## ADR-001: Gemini Fallback Strategy

**Questão**: Como o backend reage quando Google Gemini falha?

**Opções**:
- A: Retorna card sem resumo (vazio)
- B: Enfileira retry assíncrono
- C: Usa resumo genérico
- D: Circuit breaker + fallback híbrido (**recomendado**)

**Status**: ⏳ Pendente decisão da equipe

📄 [Detalhes](./ADR-001-Gemini-Fallback-Strategy.md)

---

## ADR-002: Cache TTL Strategy

**Questão**: Por quanto tempo dados devem ser considerados válidos no cache?

**Opções**:
- A: TTL fixo de 24h para todos os dados
- B: TTL variável por região administrativa (RAs com alta frequência de notícias = TTL menor)
- C: TTL baseado em frequência de atualizações do feed RSS
- D: TTL adaptativo baseado em volume de notícias recentes na região (alta atividade = 12h, baixa = 72h)

**Trade-off**: 
- Maior TTL = menos chamadas à API + menor custo ↔ risco de dados stale
- Menor TTL = dados sempre frescos ↔ quota consumida rápido, custo alto

**Impacto**: Performance, custo de API, consistência de dados

---

## ADR-003: Redis Necessity

**Questão**: Redis é um requisito de infraestrutura ou opcional?

**Opções**:
- A: Redis **obrigatório** — stack completa com distributed cache
- B: Redis **opcional** — apenas in-memory com TTL de aplicação
- C: **Estratificado** — Redis em prod, in-memory em dev/test

**Trade-off**:
- Redis = escalabilidade, cache distribuído, persistence ↔ overhead de deployment
- In-memory = simples, zero overhead ↔ perde cache entre restarts, não funciona em múltiplos workers

**Impacto**: Infraestrutura, escalabilidade horizontal, custo DevOps

---

## ADR-004: Schema Versioning

**Questão**: Como o sistema reage quando o feed RSS do Correio Braziliense muda sua estrutura XML (novos campos, campos renomeados ou removidos)?

**Opções**:
- A: **Backward compatibility automática** — parser RSS ignora campos desconhecidos; Pydantic usa defaults para campos ausentes
- B: **Falha explícita (fail-fast)** — parser lança erro ao encontrar mudança estrutural; requer intervenção manual e novo deploy
- C: **Versionamento de parser** — manter múltiplas versões do parser RSS (`parser_v1`, `parser_v2`) com detecção automática de formato

**Trade-off**:
- Backward compat automática = pipeline nunca quebra ↔ pode ingerir dados malformados silenciosamente
- Fail-fast = mudanças são detectadas imediatamente ↔ gera downtime até correção manual

**Impacto**: Resiliência do pipeline de ingestão, observabilidade, manutenibilidade

---

## 🚦 Próximos Passos

1. **Reunião de Arquitetura**: Consenso da equipe em ADR-001 a 004
2. **Documentação**: Preencher "Decisão Final" em cada ADR
3. **Implementação**: Atualizar código (backend/app/models.py, services.py) conforme decisões
4. **Testes**: Coverage de cada cenário (Pytest)
5. **Monitoring**: Instrumentar Fallback strategies com logs/metrics

---

## Referências

- [CONTEXT.md](./CONTEXT.md) — Glossário de domínio com decisões pendentes marcadas
- [definir-fluxo-de-dados.md](./definir-fluxo-de-dados.md) — Fluxo técnico refinado com ADRs linkados
- [grill-with-docs findings](../../memories/repo/grill-with-docs-findings.md) — Histórico de análise crítica
