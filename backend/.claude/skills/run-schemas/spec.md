# Spec — Skill: run-schemas

> O **quê** e o **porquê** desta skill. Detalhes de execução ficam no `SKILL.md`.
> Camada coberta: `app/schemas/` (modelos Pydantic v2).
> Referência de processo: `docs/Estudos/spec-driven-development.md`.

## Problema
Os schemas Pydantic são o **contrato de entrada e saída** da API: validam o que
entra (`<Recurso>Create`), modelam o que sai (`<Recurso>Out`) e padronizam os
envelopes de resposta. Um validador errado ou um default trocado quebra o contrato
silenciosamente. É preciso validar esse comportamento de forma unitária, **sem
servidor nem banco**.

## Objetivos desta entrega
- [x] Validar parsing de entrada **válida** nos schemas `Create`.
- [x] Validar rejeição de entrada **inválida** (`ValidationError`) — ex.: lat/long
      fora de faixa, campo obrigatório ausente.
- [x] Validar a serialização do `Out` (campos esperados).
- [x] Validar os defaults dos envelopes (`success=True`).

## Requisitos cobertos
- **Camada de contrato (transversal):** garante validação de entrada e formato de
  saída da API; base para os RFs expostos por endpoint.

## User Stories
- **Como dev/agente**, quero validar os schemas Pydantic (válido/inválido/saída)
  sem HTTP nem banco, para alterar contratos com feedback imediato.

## Critérios de aceitação
- **Dado** que rodo `python .claude/skills/run-schemas/driver.py`, **então** os
  checks passam, o `pytest tests/test_schemas.py` reporta **12 passed** e o exit é
  **0**.
- **Dado** uma entrada válida, **quando** instancio `OcorrenciaCreate`, **então** o
  modelo é criado sem erro.
- **Dado** latitude/longitude fora da faixa ou `titulo_noticia` ausente, **quando**
  instancio `OcorrenciaCreate`, **então** é lançado `ValidationError`.
- **Dado** um `OcorrenciaOut`, **quando** serializo, **então** os campos esperados
  do contrato saem corretos; os envelopes têm `success=True` por default.

## Fora de escopo (NÃO faz)
- Mapeamento de nome de campo do contrato → ORM (ex.: `titulo` ↔ `titulo_noticia`)
  — é responsabilidade do **service**, não do schema.
- Persistência ou consultas (camada de repositório).
- Validação via HTTP/endpoint (ver `run-endpoints`).
