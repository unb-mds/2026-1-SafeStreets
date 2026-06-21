"""Driver das integracoes Nominatim + Gemini (app/integrations/).

Padrao "import-and-call": importa as integracoes e as exercita direto. NAO toca
banco. Por padrao roda OFFLINE (dados embutidos + funcoes injetadas), que e o
caminho deterministico. Modos opcionais batem nos servicos reais:
  --live-nominatim : GET real no Nominatim (rede; best-effort)
  --live-gemini    : chamada real ao Gemini (precisa de GEMINI_API_KEY; best-effort)

Uso (a partir de backend/):
    python .claude/skills/run-nominatim-gemini/driver.py
    python .claude/skills/run-nominatim-gemini/driver.py --live-nominatim
    python .claude/skills/run-nominatim-gemini/driver.py --only-smoke
    python .claude/skills/run-nominatim-gemini/driver.py --only-tests

Exit 0 = offline + pytest ok. Os modos --live nunca derrubam o exit (best-effort).
"""
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from app.integrations.nominatim import Coordenada, geocodificar, parse_resposta  # noqa: E402
from app.integrations.gemini import GeminiClient  # noqa: E402

_results: list[bool] = []

# Resposta real (recortada) do Nominatim para "Ceilandia, Distrito Federal".
NOMINATIM_SAMPLE = [{"lat": "-15.8173391", "lon": "-48.1045766", "display_name": "Ceilandia, DF"}]


def check(nome: str, ok: bool) -> None:
    print(f"{'PASS' if ok else 'FAIL'}: {nome}", flush=True)
    _results.append(ok)


def smoke_nominatim() -> None:
    print("- Nominatim -", flush=True)
    coord = parse_resposta(NOMINATIM_SAMPLE)
    check("parse_resposta extrai Coordenada", isinstance(coord, Coordenada))
    check("lat/lon convertidos para float", coord.latitude == -15.8173391 and coord.longitude == -48.1045766)
    check("lista vazia -> None", parse_resposta([]) is None)
    check("local vazio -> None", geocodificar("") is None)
    # geocodificar com fetch injetado (sem rede)
    coord2 = geocodificar("Ceilandia", fetch_fn=lambda local: NOMINATIM_SAMPLE)
    check("geocodificar usa fetch injetado (sem rede)", coord2.latitude == -15.8173391)
    check("sem resultado -> None", geocodificar("X", fetch_fn=lambda local: []) is None)


def smoke_gemini() -> None:
    print("- Gemini (fallback ADR-001 Opcao A) -", flush=True)
    ok_client = GeminiClient(generate_fn=lambda texto: "Veiculo roubado em Taguatinga.")
    r = ok_client.resumir("Noticia longa sobre roubo...")
    check("resumo COMPLETO com fn injetada", r.status == "COMPLETO" and bool(r.resumo))
    check("texto vazio -> ERRO", ok_client.resumir("").status == "ERRO")
    check("sem chave e sem fn -> ERRO", GeminiClient(api_key=None).resumir("x").status == "ERRO")

    def boom(texto):
        raise RuntimeError("timeout/quota/5xx")

    erro = GeminiClient(generate_fn=boom).resumir("x")
    check("excecao do Gemini -> ERRO (resumo None)", erro.status == "ERRO" and erro.resumo is None)


def live_nominatim() -> None:
    print("--- live Nominatim (best-effort) ---", flush=True)
    try:
        coord = geocodificar("Taguatinga")
        if coord:
            print(f"LIVE OK: Taguatinga -> ({coord.latitude}, {coord.longitude})", flush=True)
        else:
            print("LIVE: sem resultado para Taguatinga", flush=True)
    except Exception as e:  # noqa: BLE001
        print(f"LIVE SKIP: Nominatim indisponivel ({type(e).__name__})", flush=True)


def live_gemini() -> None:
    print("--- live Gemini (best-effort) ---", flush=True)
    if not os.getenv("GEMINI_API_KEY"):
        print("LIVE SKIP: defina GEMINI_API_KEY para testar o Gemini real", flush=True)
        return
    try:
        r = GeminiClient().resumir("Roubo de veiculo registrado na QNL, em Taguatinga, sem vitimas.")
        print(f"LIVE OK: status={r.status} | resumo presente={bool(r.resumo)}", flush=True)
    except Exception as e:  # noqa: BLE001
        print(f"LIVE SKIP: Gemini indisponivel ({type(e).__name__})", flush=True)


def run_pytest() -> bool:
    print("--- pytest tests/test_nominatim.py tests/test_gemini.py ---", flush=True)
    r = subprocess.run(
        [sys.executable, "-m", "pytest", "tests/test_nominatim.py", "tests/test_gemini.py", "-q"]
    )
    return r.returncode == 0


def main() -> int:
    only_smoke = "--only-smoke" in sys.argv
    only_tests = "--only-tests" in sys.argv

    if not only_tests:
        smoke_nominatim()
        smoke_gemini()
    if "--live-nominatim" in sys.argv:
        live_nominatim()
    if "--live-gemini" in sys.argv:
        live_gemini()

    pytest_ok = True
    if not only_smoke:
        pytest_ok = run_pytest()

    print("", flush=True)
    if all(_results) and pytest_ok:
        print("OK: Nominatim + Gemini validados (sem tocar banco)", flush=True)
        return 0
    print("FALHA: revise os casos marcados como FAIL acima", flush=True)
    return 1


if __name__ == "__main__":
    sys.exit(main())
