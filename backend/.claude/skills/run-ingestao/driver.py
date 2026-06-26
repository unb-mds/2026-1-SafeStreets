"""Driver do servico de ingestao (app/services/ingestao.py).

Padrao "import-and-call": roda o pipeline completo (filtro de relevancia ->
regiao -> geocode -> LocalPin -> Gemini -> persistir Ocorrencia) contra um
SQLite em memoria, com as integracoes INJETADAS (sem rede, sem chave, sem
Postgres). Depois roda o pytest.

Modo --live: usa o feed RSS real do Correio + Nominatim real (rede), com o
filtro de relevancia real, mas Gemini falso. Best-effort.

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
_GEOCODE = lambda local: Coordenada(latitude=-15.81, longitude=-48.10)  # noqa: E731
_GEMINI = GeminiClient(generate_fn=lambda texto: "Resumo gerado.")
_BYPASS = lambda item: True  # noqa: E731


def check(nome: str, ok: bool) -> None:
    print(f"{'PASS' if ok else 'FAIL'}: {nome}", flush=True)
    _results.append(ok)


def _db():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine)()


def _item(titulo, descricao="", link="https://x/1"):
    return ItemRSS(titulo, descricao, link, "2026-06-20 14:30:00", None)


def smoke_filtro() -> None:
    print("- Filtro de relevancia (Camadas 1+2) -", flush=True)
    relevante = _item("Roubo em Taguatinga", "assalto", "https://cb.com/cidades-df/1.html")
    df_sem_seg = _item("Obras na Ceilandia", "nova via", "https://cb.com/cidades-df/2.html")
    seg_sem_df = _item("Roubo em Taguatinga", "assalto", "https://cb.com/politica/3.html")

    check("eh_cidades_df pela URL", ingestao.eh_cidades_df(relevante) and not ingestao.eh_cidades_df(seg_sem_df))
    check("eh_seguranca por keyword", ingestao.eh_seguranca(relevante) and not ingestao.eh_seguranca(df_sem_seg))
    check("eh_relevante exige DF + seguranca", ingestao.eh_relevante(relevante)
          and not ingestao.eh_relevante(df_sem_seg) and not ingestao.eh_relevante(seg_sem_df))

    db = _db()
    res = ingestao.ingerir(db, itens=[relevante, df_sem_seg, seg_sem_df],
                           geocodificar=_GEOCODE, gemini=_GEMINI)  # filtro padrao
    check("ingerir filtra 2 de 3 (so o relevante persiste)",
          res.processadas == 3 and res.filtradas == 2 and res.persistidas == 1)


def smoke_pipeline() -> None:
    print("- Pipeline (filtro bypassado) -", flush=True)
    db = _db()
    itens = [
        _item("Furto em Taguatinga", "Veiculo levado"),
        _item("Roubo na Ceilandia", "Assalto"),
        _item("Noticia sem regiao", "nada"),
    ]
    res = ingestao.ingerir(db, itens=itens, geocodificar=_GEOCODE, gemini=_GEMINI, filtro=_BYPASS)
    check("persistiu 2 (1 sem regiao pulado)", res.persistidas == 2 and res.sem_regiao == 1)
    check("regiao virou codigo RA", {o.regiao_administrativa for o in db.query(Ocorrencia)} == {"RA-003", "RA-009"})
    check("LocalPin por regiao distinta", db.query(LocalPin).count() == 2)
    check("resumo COMPLETO gravado", db.query(Ocorrencia).first().resumo_status == "COMPLETO")

    # ADR-001 A: Gemini falha -> persiste com ERRO
    db2 = _db()
    def quebra(texto):  # noqa: E306
        raise RuntimeError("quota")
    res2 = ingestao.ingerir(db2, itens=[_item("Roubo na Ceilandia")], geocodificar=_GEOCODE,
                            gemini=GeminiClient(generate_fn=quebra), filtro=_BYPASS)
    o = db2.query(Ocorrencia).first()
    check("Gemini falhou -> persiste status ERRO (ADR-001 A)", res2.persistidas == 1 and o.resumo_status == "ERRO")


def live() -> None:
    print("--- live: feed real + Nominatim real + filtro real (Gemini falso) ---", flush=True)
    try:
        db = _db()
        res = ingestao.ingerir(db, gemini=GeminiClient(generate_fn=lambda texto: "resumo offline"))
        print(f"LIVE OK: processadas={res.processadas} filtradas={res.filtradas} "
              f"persistidas={res.persistidas} sem_regiao={res.sem_regiao} erros={res.erros}", flush=True)
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
        smoke_filtro()
        smoke_pipeline()
    if "--live" in sys.argv:
        live()

    pytest_ok = True
    if not only_smoke:
        pytest_ok = run_pytest()

    print("", flush=True)
    if all(_results) and pytest_ok:
        print("OK: ingestao validada (filtro DF/seguranca -> geocode -> pin -> gemini -> persist)", flush=True)
        return 0
    print("FALHA: revise os casos marcados como FAIL acima", flush=True)
    return 1


if __name__ == "__main__":
    sys.exit(main())
