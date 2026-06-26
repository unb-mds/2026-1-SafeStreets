"""Driver do servico de ingestao (app/services/ingestao.py).

Padrao "import-and-call": roda o pipeline completo (RSS -> regiao -> geocode ->
LocalPin -> Gemini -> persistir Ocorrencia) contra um SQLite em memoria, com as
integracoes INJETADAS (sem rede, sem chave, sem Postgres). Depois roda o pytest.

Modo --live: usa o feed RSS real do Correio + Nominatim real (rede), mas ainda
num SQLite em memoria e com Gemini falso (resumo nunca chama a API). Best-effort.

Uso (a partir de backend/):
    python .claude/skills/run-ingestao/driver.py
    python .claude/skills/run-ingestao/driver.py --live
    python .claude/skills/run-ingestao/driver.py --only-smoke
    python .claude/skills/run-ingestao/driver.py --only-tests

Exit 0 = offline + pytest ok. O modo --live nunca derruba o exit (best-effort).
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.core.database import Base  # noqa: E402
from app.models import LocalPin, Ocorrencia  # noqa: E402
from app.integrations.correio_rss import ItemRSS  # noqa: E402
from app.integrations.nominatim import Coordenada  # noqa: E402
from app.integrations.gemini import GeminiClient  # noqa: E402
from app.services import ingestao  # noqa: E402

_results: list[bool] = []


def check(nome: str, ok: bool) -> None:
    print(f"{'PASS' if ok else 'FAIL'}: {nome}", flush=True)
    _results.append(ok)


def _db():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine)()


def smoke() -> None:
    db = _db()
    itens = [
        ItemRSS("Furto em Taguatinga", "Veiculo levado na QNL", "https://x/1", "2026-06-20 14:30:00", None),
        ItemRSS("Roubo na Ceilandia", "Assalto a pedestre", "https://x/2", "2026-06-19 09:00:00", None),
        ItemRSS("Noticia generica sem regiao", "nada aqui", "https://x/3", None, None),
    ]
    gemini = GeminiClient(generate_fn=lambda texto: "Resumo gerado.")
    geocode = lambda local: Coordenada(latitude=-15.81, longitude=-48.10)  # noqa: E731

    res = ingestao.ingerir(db, itens=itens, geocodificar=geocode, gemini=gemini)

    check("processou os 3 itens", res.processadas == 3)
    check("persistiu 2 (1 sem regiao foi pulado)", res.persistidas == 2 and res.sem_regiao == 1)
    check("2 ocorrencias no banco", db.query(Ocorrencia).count() == 2)
    check("resumo COMPLETO gravado", db.query(Ocorrencia).first().resumo_status == "COMPLETO")
    check("regiao extraida vira codigo RA", {o.regiao_administrativa for o in db.query(Ocorrencia)} == {"RA-003", "RA-009"})
    check("LocalPin criado para cada regiao distinta", db.query(LocalPin).count() == 2)

    # ADR-001 A: Gemini falha -> persiste com ERRO
    db2 = _db()
    def quebra(texto):  # noqa: E306
        raise RuntimeError("quota")
    res2 = ingestao.ingerir(
        db2, itens=[ItemRSS("Roubo na Ceilandia", "", "https://x/9", None, None)],
        geocodificar=geocode, gemini=GeminiClient(generate_fn=quebra),
    )
    o = db2.query(Ocorrencia).first()
    check("Gemini falhou -> persiste com status ERRO (ADR-001 A)", res2.persistidas == 1 and o.resumo_status == "ERRO")


def live() -> None:
    print("--- live: feed real + Nominatim real (Gemini falso) ---", flush=True)
    try:
        db = _db()
        res = ingestao.ingerir(
            db, gemini=GeminiClient(generate_fn=lambda texto: "resumo offline")
        )
        print(f"LIVE OK: processadas={res.processadas} persistidas={res.persistidas} "
              f"sem_regiao={res.sem_regiao} erros={res.erros}", flush=True)
    except Exception as e:  # noqa: BLE001
        print(f"LIVE SKIP: indisponivel ({type(e).__name__})", flush=True)


def run_pytest() -> bool:
    print("--- pytest tests/test_ingestao.py ---", flush=True)
    r = subprocess.run([sys.executable, "-m", "pytest", "tests/test_ingestao.py", "-q"])
    return r.returncode == 0


def main() -> int:
    only_smoke = "--only-smoke" in sys.argv
    only_tests = "--only-tests" in sys.argv

    if not only_tests:
        smoke()
    if "--live" in sys.argv:
        live()

    pytest_ok = True
    if not only_smoke:
        pytest_ok = run_pytest()

    print("", flush=True)
    if all(_results) and pytest_ok:
        print("OK: ingestao validada (RSS->regiao->geocode->pin->gemini->persist)", flush=True)
        return 0
    print("FALHA: revise os casos marcados como FAIL acima", flush=True)
    return 1


if __name__ == "__main__":
    sys.exit(main())
