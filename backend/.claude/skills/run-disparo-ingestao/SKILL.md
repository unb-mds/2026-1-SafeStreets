---
name: run-disparo-ingestao
description: Implementar, rodar e testar o disparo da ingestão via API (POST /admin/ingerir) no backend SafeStreets. Use ao mexer no endpoint admin de ingestão, disparar a coleta sob demanda, ou validar o gatilho que popula o banco a partir do pipeline.
---

# Run: Disparo da Ingestão (POST /admin/ingerir)

Endpoint administrativo que **dispara o pipeline de ingestão sob demanda**: uma
chamada `POST /admin/ingerir` executa `ingestao.ingerir(db)` (RSS → filtro →
geocode → Gemini → persiste) e devolve os contadores num envelope. A rota é
fina; o driver `driver.py` a dirige **in-process** (TestClient do FastAPI) com
o `ingerir` substituído por um fake — sem rede, sem chave, sem pipeline real.

**Todos os caminhos abaixo são relativos a `backend/`.** Rode de `backend/`.

## Prerequisites

```bash
pip install -r requirements.txt
```

Python 3.11. O driver/teste **não precisam de Postgres, rede nem chave** (SQLite
+ `ingerir` mockado). Use `python -m` (binários fora do PATH no Python MS Store).

## Run (caminho do agente) — driver do disparo

Dirige a rota via TestClient (200/503/405) + roda o pytest. Exit 0 = ok.

```bash
python .claude/skills/run-disparo-ingestao/driver.py
```

Saída esperada:

```
PASS: POST /admin/ingerir -> 200
PASS: envelope success=True + contadores
PASS: banco off -> 503
PASS: GET no disparo -> 405
--- pytest tests/test_admin.py ---
3 passed
OK: disparo /admin/ingerir validado (200 / 503 / 405)
```

Flags: `--only-smoke`, `--only-tests`.

## Run (caminho humano) — disparo REAL no container

No backend já rodando via Docker, o disparo de verdade (pipeline real: RSS +
Nominatim + Gemini → Postgres):

```bash
curl -X POST http://localhost:8000/admin/ingerir
```
Resposta (exemplo real do feed atual):
```json
{"success":true,"data":{"processadas":20,"persistidas":0,"filtradas":19,"sem_regiao":1,"erros":0}}
```
Depois, `GET /ocorrencias` passa a refletir o que foi persistido. Aparece também
no Swagger (`/docs`) como **POST /admin/ingerir** com "Try it out".

## Test (só o pytest)

```bash
python -m pytest tests/test_admin.py -v
```

## Gotchas

- **`ingerir(db)` chama a rede ANTES do banco.** A primeira coisa do pipeline é
  `correio_rss.buscar_itens()` (HTTP), depois Nominatim, depois Gemini, e só no
  fim o banco. Por isso o driver **não** sobe um servidor real para o smoke —
  um POST de verdade dispararia rede+IA (lento, depende de chave). O teste do
  gatilho é feito com `ingerir` **mockado** (TestClient in-process).
- **O 503 só dispara se o erro for `OperationalError`.** A rota captura
  `sqlalchemy.exc.OperationalError` (banco fora) → 503. Outros erros do pipeline
  sobem como 500 — proposital: erro de banco é "indisponível", erro de pipeline
  é bug.
- **Disparo é síncrono.** A resposta só volta quando o lote termina (segundos no
  feed atual). Para volume grande, o caminho seria `BackgroundTasks`/fila — está
  anotado no docstring da rota, não implementado.
- **Sem autenticação.** É `/admin/...` mas ainda aberto (RNF07/auth é futuro).
  Não expor publicamente sem proteção.
- **Rende pouco.** Contra o feed geral, ~19 de 20 são filtradas (não-DF/segurança)
  — ver a skill `run-ingestao`. O disparo funciona; o banco enche devagar.

## Troubleshooting

| Sintoma | Causa / correção |
|---|---|
| `ModuleNotFoundError: No module named 'app'` | Rodando fora de `backend/`; faça `cd backend` (driver insere `backend/` no path via `parents[3]`; pytest depende do CWD) |
| `POST /admin/ingerir` trava no container | Esperado se for o pipeline real (rede+IA). Aguarde o lote; ou rode menos itens |
| `503` sempre | Postgres não está no ar / `DATABASE_URL` errada — `docker compose up -d` |
| `405` ao testar | O disparo é **POST**, não GET |
