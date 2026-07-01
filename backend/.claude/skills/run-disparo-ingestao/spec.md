# Spec — Skill: run-disparo-ingestao

> O **quê** e o **porquê** desta skill. Detalhes de execução ficam no `SKILL.md`.
> Módulo coberto: `app/routes/admin.py` (`POST /admin/ingerir`).
> Referência de processo: `docs/Estudos/spec-driven-development.md`.

## Problema
A ingestão precisa ser **disparada sob demanda** por uma rota administrativa, mas
um `POST` real executa o pipeline inteiro (rede + IA + Postgres) — lento e
dependente de chave. É preciso validar o **gatilho** (a rota e seus contratos de
resposta) isoladamente, sem rodar o pipeline de verdade. A skill dirige a rota
in-process (TestClient) com `ingerir` mockado.

## Objetivos desta entrega
- [x] Validar que `POST /admin/ingerir` retorna **200** com envelope
      `success=True` + contadores.
- [x] Validar que banco fora (`OperationalError`) retorna **503**.
- [x] Validar que método errado (GET) retorna **405**.
- [x] Não disparar rede/IA no smoke (pipeline substituído por fake).

## Requisitos cobertos
- **RF12 — Ingestão sob demanda:** endpoint administrativo que aciona o pipeline
  e devolve os contadores do lote.

## User Stories
- **Como dev/agente**, quero validar o endpoint de disparo (200/503/405) sem
  executar o pipeline real, para garantir o contrato da rota com feedback rápido.
- **Como operador**, quero disparar a coleta com `POST /admin/ingerir` e receber os
  contadores do lote.

## Critérios de aceitação
- **Dado** que rodo `python .claude/skills/run-disparo-ingestao/driver.py`,
  **então** os checks passam, o `pytest tests/test_admin.py` reporta **3 passed** e
  o exit é **0**.
- **Dado** o pipeline mockado, **quando** chamo `POST /admin/ingerir`, **então**
  recebo **200** e um JSON `{"success": true, "data": {processadas, persistidas,
  filtradas, sem_regiao, duplicadas, erros}}`.
- **Dado** que o banco está indisponível (`OperationalError`), **quando** disparo,
  **então** recebo **503**.
- **Dado** uma requisição **GET** em `/admin/ingerir`, **então** recebo **405**.

## Fora de escopo (NÃO faz)
- A lógica do pipeline em si (filtro/geocode/persistência) — ver `run-ingestao`.
- Autenticação do endpoint (RNF07/auth é trabalho futuro).
- Execução assíncrona / fila (`BackgroundTasks`) — anotado, não implementado.
