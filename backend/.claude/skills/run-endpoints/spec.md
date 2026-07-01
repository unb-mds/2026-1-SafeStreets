# Spec — Skill: run-endpoints

> O **quê** e o **porquê** desta skill. Detalhes de execução ficam no `SKILL.md`.
> Camada coberta: `app/routes/` (registrada em `app/main.py`).
> Referência de processo: `docs/Estudos/spec-driven-development.md`.

## Problema
A API FastAPI cresce com novos endpoints, e cada rota nova pode quebrar o startup
ou responder com erro de servidor. É preciso uma forma de **exercitar todas as
rotas sobre HTTP real** sem manutenção manual de uma lista de URLs. A skill sobe o
servidor, **auto-descobre** as rotas pelo `/openapi.json`, bate em cada GET e roda
o pytest — pegando rota que crasha (5xx/timeout) sem precisar de banco.

## Objetivos desta entrega
- [x] Subir o servidor e descobrir todas as rotas via `/openapi.json`.
- [x] Bater em cada GET (path params preenchidos com valor dummy) e exigir resposta
      `<500`.
- [x] Rodar o `pytest tests/` da API.
- [x] Ser **auto-descoberto**: endpoint novo registrado no `main.py` entra no smoke
      sem alterar o driver.

## Requisitos cobertos
- **Camada de API (transversal):** garante que as rotas HTTP respondem sem erro de
  servidor; base de validação para qualquer RF exposto por endpoint.

## User Stories
- **Como dev/agente**, quero exercitar todas as rotas da API automaticamente, para
  detectar rota que crasha (5xx/timeout) ao adicionar/alterar endpoints.

## Critérios de aceitação
- **Dado** que rodo `python .claude/skills/run-endpoints/driver.py`, **então** todas
  as rotas respondem `<500`, o `pytest tests/` passa e o exit é **0**.
- **Dado** um endpoint novo registrado em `main.py`, **quando** rodo o driver,
  **então** ele aparece no smoke **sem** mudança no driver (auto-descoberta).
- **Dado** uma rota de path param (`/recurso/{id}`), **quando** exercitada com `1`,
  **então** um `404`/`422` conta como sucesso (a rota respondeu sem crashar).
- **Dado** uma rota que lança exceção não tratada (500/timeout), **então** o driver
  a marca como falha e sai **1**.

## Fora de escopo (NÃO faz)
- Regras de negócio de cada endpoint (o smoke só verifica que a rota responde).
- Testes de payload/contrato detalhado de cada rota (ficam nos testes específicos).
- Endpoints que dependem de banco (nenhuma rota atual consulta o Postgres).
