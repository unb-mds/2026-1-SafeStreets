# Spec — Skill: run-ingestao

> O **quê** e o **porquê** desta skill. Detalhes de execução ficam no `SKILL.md`.
> Módulo coberto: `app/services/ingestao.py`.
> Referência de processo: `docs/Estudos/spec-driven-development.md`.

## Problema
A ingestão é o **motor que conecta as integrações** (RSS → filtro → geocode →
Gemini → persistência). É a parte com mais lógica e mais pontos de falha do
backend: filtro de relevância, extração de região, fallback de IA. Validar isso
contra Postgres/rede/chave real seria lento e não-determinístico. A skill existe
para rodar o **pipeline inteiro** contra SQLite em memória com as integrações
injetadas — sem rede, sem chave, sem Postgres.

## Objetivos desta entrega
- [x] Validar o filtro de relevância em 2 camadas (`eh_cidades_df` + `eh_seguranca`).
- [x] Validar o pipeline completo: região → código RA → geocode → `LocalPin` →
      resumo → persistência da `Ocorrencia`.
- [x] Garantir o fallback do ADR-001 (Opção A): Gemini falho **não** bloqueia a
      persistência (grava `resumo_status="ERRO"`).
- [x] Oferecer modo `--live` best-effort (feed + Nominatim reais, Gemini falso).

## Requisitos cobertos
- **RF12 — Ingestão e enriquecimento de notícias:** filtro DF/segurança, geocoding
  e persistência das ocorrências.
- **RF11 — Resumo por IA (via integração Gemini):** acionado no pipeline, com
  fallback do ADR-001.

## User Stories
- **Como dev/agente**, quero rodar o pipeline de ingestão de ponta a ponta sem
  rede/banco/chave, para validar filtro, geocode e persistência de forma rápida.

## Critérios de aceitação
- **Dado** que rodo `python .claude/skills/run-ingestao/driver.py`, **então** os
  checks inline passam, o `pytest tests/test_ingestao.py` reporta **12 passed** e o
  exit é **0**.
- **Dado** 3 itens (1 relevante, 2 não), **quando** `ingerir` roda, **então** só o
  relevante é persistido (Camadas 1+2 descartam os outros).
- **Dado** um item relevante sem RA reconhecida no texto, **quando** processado,
  **então** ele cai em `sem_regiao` e **não** é persistido.
- **Dado** que o Gemini falha, **quando** o item é processado, **então** a
  ocorrência é persistida com `resumo_status="ERRO"` (ADR-001 A), sem derrubar o lote.

## Fora de escopo (NÃO faz)
- Disparo via HTTP (`POST /admin/ingerir`) — ver `run-disparo-ingestao`.
- Implementação interna das integrações (RSS, Nominatim, Gemini) — skills próprias.
- Classificação de tipo de crime (fora do escopo do RF12).
- Garantir cobertura ampla de RAs/termos (são listas de dados que o time expande).
