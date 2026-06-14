---
name: run-endpoints
description: Implementar, rodar e testar endpoints HTTP da camada app/routes/ do backend SafeStreets. Use ao criar um endpoint novo, exercitar as rotas, verificar requisições HTTP, rodar o smoke das rotas ou os testes (pytest) do FastAPI.
---

# Run: Endpoints (camada app/routes/)

API FastAPI servida por uvicorn. Os endpoints vivem em `app/routes/` e são
registrados em `app/main.py` via `app.include_router(...)`. O driver
`driver.py` dirige a lógica dessas rotas sobre **HTTP real**: sobe o
servidor, descobre todas as rotas pelo `/openapi.json`, bate em cada GET
(substituindo path params por valores dummy) e roda o pytest de `tests/`.

**Todos os caminhos abaixo são relativos a `backend/`.** É obrigatório
estar em `backend/` — o módulo é `app.main:app`.

## Prerequisitos

```bash
pip install -r requirements.txt
```

Python 3.11 (MS Store no Windows). Os binários `uvicorn`/`pytest` podem não
estar no PATH — por isso tudo abaixo usa `python -m`. **Não precisa de banco**:
nenhuma rota atual consulta o Postgres.

## Run (caminho do agente) — driver de endpoints

Um comando: sobe o servidor na porta 8791, descobre as rotas, bate em cada
GET e roda o pytest. Exit 0 = todas as rotas responderam `<500` e os testes
passaram.

```bash
python .claude/skills/run-endpoints/driver.py
```

Saída no estado atual (2 rotas):

```
Rotas descobertas: 2
PASS: GET / -> 200
PASS: GET /health -> 200
--- pytest tests/ ---
tests/test_main.py::test_health_check PASSED
OK: rotas responderam (<500) e testes passaram
```

Flags:

```bash
python .claude/skills/run-endpoints/driver.py --only-http    # só o smoke HTTP
python .claude/skills/run-endpoints/driver.py --only-tests   # só o pytest
```

O smoke é **auto-descoberto**: ao adicionar um router novo em `app/routes/` e
registrá-lo no `main.py`, ele aparece no `/openapi.json` e o driver passa a
testá-lo sem nenhuma mudança no driver. Path params (`/ocorrencias/{id}`) são
preenchidos com `1` — o objetivo é exercitar a lógica do router, não a regra
de negócio, então um `404`/`422` conta como sucesso (a rota respondeu sem
crashar). Só `5xx` ou timeout contam como falha.

## Fluxo: implementar um endpoint novo com teste

1. **Criar o router** em `app/routes/<nome>.py`:

   ```python
   from fastapi import APIRouter
   router = APIRouter(prefix="/exemplo", tags=["Exemplo"])

   @router.get("")
   def listar():
       return {"itens": []}
   ```

2. **Registrar** em `app/main.py`:

   ```python
   from app.routes import health, exemplo
   app.include_router(exemplo.router)
   ```

3. **Escrever o teste** em `tests/test_<nome>.py` (padrão TestClient, igual
   a `tests/test_main.py`):

   ```python
   from fastapi.testclient import TestClient
   from app.main import app

   client = TestClient(app)

   def test_listar():
       r = client.get("/exemplo")
       assert r.status_code == 200
   ```

4. **Rodar o driver** — ele descobre a rota nova e roda o teste novo:

   ```bash
   python .claude/skills/run-endpoints/driver.py
   ```

## Run (caminho humano) — servidor interativo

```bash
python -m uvicorn app.main:app --port 8000 --host 127.0.0.1
```

Swagger em `http://127.0.0.1:8000/docs`. Sem GUI — sob headless só serve
para `curl`/Swagger via browser.

## Test

```bash
python -m pytest tests/ -v
```

## Gotchas

- **Rodar de `backend/`, não da raiz.** O módulo é `app.main:app`; da raiz dá
  `ModuleNotFoundError: No module named 'app'`.
- **`python -m uvicorn`, nunca `uvicorn` direto** (scripts fora do PATH na
  instalação MS Store).
- **Uma rota com exceção NÃO tratada trava o servidor de dev.** Testado: uma
  rota que faz `raise RuntimeError(...)` retorna 500 e, no Windows, **a
  requisição seguinte dá timeout** (o driver mostra status `0` para as rotas
  posteriores). O driver não morre — registra todas como falha e sai 1 — mas o
  diagnóstico real é a rota que crashou. Use `raise HTTPException(status_code=...)`
  para erros esperados (retorna 4xx limpo, não trava).
- **Não leia o corpo de uma resposta 500 via urllib.** `HTTPError.read()` pode
  travar no corpo de erro do Starlette. O driver só usa o status code; o
  `http()` já trata isso.
- **`Connection: close` em toda request.** Sem isso, o keep-alive faz uma rota
  problemática contaminar a próxima conexão.
- O driver usa a **porta 8791** de propósito, separada do uvicorn manual (8000).

## Troubleshooting

| Sintoma | Causa / correção |
|---|---|
| `No module named pytest` / `uvicorn` | `pip install -r requirements.txt` (de `backend/`) |
| `No module named 'app'` | Rodando da raiz do repo; faça `cd backend` |
| Driver mostra `-> 0` numa rota | A rota travou ou derrubou a conexão (geralmente exceção não tratada → 500). Veja os logs da rota; troque por `HTTPException`. |
| `FAIL: servidor nao respondeu em 15s` | Erro de import no startup; rode `python -c "from app.main import app"` para ver o traceback |
