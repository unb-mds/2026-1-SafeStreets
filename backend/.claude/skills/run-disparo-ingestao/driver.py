"""Driver do disparo de ingestao (POST /admin/ingerir).

A rota e fina: chama ingestao.ingerir(db) e devolve o resultado num envelope.
O driver a dirige IN-PROCESS via TestClient do FastAPI, substituindo o ingerir
por um fake (sem rede, sem chave, sem pipeline real) e usando SQLite no get_db.
Cobre: 200 com envelope, 503 quando o banco cai, 405 em metodo errado.
Depois roda o pytest.

Uso (a partir de backend/):
    python .claude/skills/run-disparo-ingestao/driver.py
    python .claude/skills/run-disparo-ingestao/driver.py --only-smoke
    python .claude/skills/run-disparo-ingestao/driver.py --only-tests

Exit 0 = tudo ok. Exit 1 = algum caso falhou ou o pytest falhou.
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.exc import OperationalError  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.core.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Ocorrencia  # noqa: F401,E402 — registra tabelas
from app.services import ingestao  # noqa: E402
from app.services.ingestao import ResultadoIngestao  # noqa: E402

_results: list[bool] = []


def check(nome: str, ok: bool) -> None:
    print(f"{'PASS' if ok else 'FAIL'}: {nome}", flush=True)
    _results.append(ok)


def _client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)

    def _override():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override
    return TestClient(app)


def smoke() -> None:
    client = _client()
    original = ingestao.ingerir
    try:
        # 1. disparo com sucesso -> envelope com os contadores
        ingestao.ingerir = lambda db: ResultadoIngestao(processadas=20, persistidas=2, filtradas=17, sem_regiao=1)
        r = client.post("/admin/ingerir")
        body = r.json()
        check("POST /admin/ingerir -> 200", r.status_code == 200)
        check("envelope success=True + contadores", body.get("success") is True
              and body["data"]["persistidas"] == 2 and body["data"]["filtradas"] == 17)

        # 2. banco indisponivel -> 503
        def _boom(db):
            raise OperationalError("SELECT 1", {}, Exception("db off"))
        ingestao.ingerir = _boom
        r = client.post("/admin/ingerir")
        check("banco off -> 503", r.status_code == 503)

        # 3. metodo errado -> 405
        r = client.get("/admin/ingerir")
        check("GET no disparo -> 405", r.status_code == 405)
    finally:
        ingestao.ingerir = original
        app.dependency_overrides.clear()


def run_pytest() -> bool:
    print("--- pytest tests/test_admin.py ---", flush=True)
    r = subprocess.run([sys.executable, "-m", "pytest", "tests/test_admin.py", "-q"])
    return r.returncode == 0


def main() -> int:
    only_smoke = "--only-smoke" in sys.argv
    only_tests = "--only-tests" in sys.argv

    if not only_tests:
        smoke()
    pytest_ok = True
    if not only_smoke:
        pytest_ok = run_pytest()

    print("", flush=True)
    if all(_results) and pytest_ok:
        print("OK: disparo /admin/ingerir validado (200 / 503 / 405)", flush=True)
        return 0
    print("FALHA: revise os casos marcados como FAIL acima", flush=True)
    return 1


if __name__ == "__main__":
    sys.exit(main())
