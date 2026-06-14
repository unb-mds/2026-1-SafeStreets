"""Driver de endpoints — SafeStreets backend.

Dirige a logica da camada app/routes/ sobre HTTP real:
  1. Sobe o uvicorn numa porta dedicada (8791).
  2. Le /openapi.json e descobre TODAS as rotas registradas.
  3. Bate em cada rota GET (substitui path params por valores dummy) e
     registra o status HTTP — o objetivo e exercitar a logica do router,
     nao validar regra de negocio (404 numa rota parametrizada conta como
     "router respondeu sem crashar").
  4. Roda o pytest da pasta tests/ (testes via TestClient).

Uso (a partir de backend/):
    python .claude/skills/run-endpoints/driver.py
    python .claude/skills/run-endpoints/driver.py --only-tests   # so pytest
    python .claude/skills/run-endpoints/driver.py --only-http    # so smoke HTTP

Exit 0 = tudo ok. Exit 1 = alguma rota deu 5xx ou pytest falhou.
"""
import json
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request

PORT = 8791
BASE = f"http://127.0.0.1:{PORT}"
# valores dummy para substituir path params {id}, {ocorrencia_id}, etc.
DUMMY = {"int": "1", "str": "x"}


def http(method: str, path: str) -> tuple[int, str]:
    # Connection: close evita keep-alive — uma rota que crasha (500) pode
    # deixar a conexao engasgada e travar a requisicao seguinte.
    req = urllib.request.Request(
        f"{BASE}{path}", method=method, headers={"Connection": "close"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return r.status, r.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        # Nao ler e.read() aqui: numa resposta 500 do Starlette o corpo do
        # erro pode travar. Para o smoke so o status importa.
        return e.code, ""
    except (TimeoutError, urllib.error.URLError, OSError) as e:
        # Rota travou/derrubou a conexao: status sintetico 0 = falha, mas o
        # driver NAO morre — segue testando as demais rotas.
        return 0, str(e)


def wait_ready(proc: subprocess.Popen) -> bool:
    for _ in range(30):
        if proc.poll() is not None:
            out = proc.stdout.read().decode("utf-8", errors="replace")
            print(f"FAIL: servidor morreu no startup:\n{out}", flush=True)
            return False
        status, _ = http("GET", "/openapi.json")
        if status == 200:
            return True
        time.sleep(0.5)
    print("FAIL: servidor nao respondeu em 15s", flush=True)
    return False


def fill_params(path: str) -> str:
    # /ocorrencias/{id} -> /ocorrencias/1  ;  /x/{name} -> /x/x
    return re.sub(r"\{[^}]+\}", lambda m: "1", path)


def smoke_http() -> list[str]:
    """Bate em cada rota GET do openapi. Retorna lista de rotas que falharam."""
    _, body = http("GET", "/openapi.json")
    spec = json.loads(body)
    paths = spec.get("paths", {})
    failures = []
    print(f"Rotas descobertas: {len(paths)}", flush=True)
    for path, methods in sorted(paths.items()):
        for method in methods:
            if method.lower() != "get":
                print(f"SKIP: {method.upper()} {path} (so GET no smoke)", flush=True)
                continue
            concrete = fill_params(path)
            status, _ = http("GET", concrete)
            # logica do router rodou se respondeu algo < 500.
            # status 0 = timeout/conexao caiu (rota travou) -> falha.
            ok = 0 < status < 500
            tag = "PASS" if ok else "FAIL"
            extra = f" (de {path})" if concrete != path else ""
            print(f"{tag}: GET {concrete}{extra} -> {status}", flush=True)
            if not ok:
                failures.append(concrete)
    return failures


def run_pytest() -> bool:
    print("--- pytest tests/ ---", flush=True)
    r = subprocess.run([sys.executable, "-m", "pytest", "tests/", "-v"])
    return r.returncode == 0


def main() -> int:
    only_tests = "--only-tests" in sys.argv
    only_http = "--only-http" in sys.argv

    http_failures: list[str] = []
    pytest_ok = True

    if not only_tests:
        server = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app",
             "--host", "127.0.0.1", "--port", str(PORT)],
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        )
        try:
            if not wait_ready(server):
                return 1
            http_failures = smoke_http()
        finally:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()

    if not only_http:
        pytest_ok = run_pytest()

    print("", flush=True)
    if http_failures or not pytest_ok:
        if http_failures:
            print(f"HTTP FAIL: {http_failures}", flush=True)
        if not pytest_ok:
            print("PYTEST FAIL", flush=True)
        return 1
    print("OK: rotas responderam (<500) e testes passaram", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
