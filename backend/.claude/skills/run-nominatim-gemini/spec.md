# Spec — Skill: run-nominatim-gemini

> O **quê** e o **porquê** desta skill. Detalhes de execução ficam no `SKILL.md`.
> Módulos cobertos: `app/integrations/nominatim.py` e `app/integrations/gemini.py`.
> Referência de processo: `docs/Estudos/spec-driven-development.md`.

## Problema
Duas integrações externas alimentam a ingestão: **Nominatim** (região → lat/long)
e **Gemini** (resumo por IA). Ambas dependem de rede/chave e podem falhar de
formas diferentes — e o Gemini tem uma regra de fallback crítica (ADR-001 Opção
A). É preciso validar as duas de forma **determinística, sem rede, sem chave e sem
banco**, garantindo que falha de IA vira `ERRO` (não exceção).

## Objetivos desta entrega
- [x] Validar o geocoding do Nominatim (parse de `Coordenada`, query com fetch
      injetado).
- [x] Validar o resumo do Gemini com função injetada (`status="COMPLETO"`).
- [x] Garantir o fallback do ADR-001: texto vazio / sem chave / exceção →
      `status="ERRO"` com `resumo=None` (nunca exceção).
- [x] Oferecer modos `--live-nominatim` e `--live-gemini` best-effort.

## Requisitos cobertos
- **RF12 — Geocoding na ingestão:** Nominatim converte a RA em coordenada.
- **RF11 — Resumo por IA:** Gemini resume a ocorrência, com fallback do ADR-001.

## User Stories
- **Como dev/agente**, quero validar geocoding e resumo de IA sem rede nem chave,
  para mexer nas integrações com segurança e feedback imediato.

## Critérios de aceitação
- **Dado** que rodo `python .claude/skills/run-nominatim-gemini/driver.py`,
  **então** os checks passam, o `pytest tests/test_nominatim.py
  tests/test_gemini.py` reporta **13 passed** e o exit é **0**.
- **Dado** uma função de geração injetada, **quando** `GeminiClient.resumir` roda,
  **então** retorna `status="COMPLETO"` com o resumo.
- **Dado** texto vazio, **ou** sem chave e sem função, **ou** exceção do SDK,
  **quando** chamo `resumir`, **então** retorna `status="ERRO"` e `resumo=None`
  (ADR-001 A) — **sem** lançar exceção.
- **Dado** `--live-gemini` sem `GEMINI_API_KEY`, **então** imprime `LIVE SKIP` e
  não falha o driver.

## Fora de escopo (NÃO faz)
- Persistência ou orquestração do pipeline (ver `run-ingestao`).
- Retry assíncrono ou resumo genérico (Opções B/C do ADR-001 foram descartadas).
- Escolha/configuração do modelo do Gemini (responsabilidade de config/deploy).
