"""Driver da integracao Correio RSS (app/integrations/correio_rss.py).

Padrao "import-and-call": importa a integracao e a exercita direto. NAO toca
banco. Por padrao roda OFFLINE (sample embutido + fetch injetado), que e o
caminho deterministico que prova a logica de parse. O modo --live faz um GET
real no feed do Correio (depende de rede; tolera falha).

Uso (a partir de backend/):
    python .claude/skills/run-correio-rss/driver.py            # offline + pytest
    python .claude/skills/run-correio-rss/driver.py --live     # tambem bate no feed real
    python .claude/skills/run-correio-rss/driver.py --only-smoke
    python .claude/skills/run-correio-rss/driver.py --only-tests

Exit 0 = tudo ok. Exit 1 = algum caso falhou ou o pytest falhou.
(O modo --live nunca derruba o exit code: rede e best-effort.)
"""
import subprocess
import sys
from pathlib import Path

# Rodado como script, sys.path[0] e a pasta do driver, nao backend/.
# Coloca backend/ (4 niveis acima) no path para "import app..." resolver.
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from app.integrations.correio_rss import (  # noqa: E402
    CORREIO_RSS_URL,
    buscar_itens,
    limpar_html,
    parse_feed,
)

_results: list[bool] = []

SAMPLE = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <item>
    <title>Roubo &amp; furto na Ceil&#226;ndia</title>
    <link>/cidades-df/2026/06/123-roubo.html</link>
    <description>&lt;p&gt;Ve&#237;culo &lt;b&gt;roubado&lt;/b&gt;.&lt;/p&gt;</description>
    <pubDate>2026-06-20 14:30:00</pubDate>
    <author>Correio Braziliense</author>
  </item>
</channel></rss>"""


def check(nome: str, ok: bool) -> None:
    print(f"{'PASS' if ok else 'FAIL'}: {nome}", flush=True)
    _results.append(ok)


def smoke() -> None:
    itens = parse_feed(SAMPLE)
    check("parse_feed retorna 1 item do sample", len(itens) == 1)

    item = itens[0]
    check("titulo com entidades desfeitas", item.titulo == "Roubo & furto na Ceilândia")
    check("descricao sem tags HTML", "<" not in item.descricao and item.descricao == "Veículo roubado.")
    check("link relativo virou absoluto", item.link.startswith("https://www.correiobraziliense.com.br/"))
    check("pubDate preservado", item.data_publicacao == "2026-06-20 14:30:00")

    check("limpar_html(None) == ''", limpar_html(None) == "")

    # buscar_itens com fetch injetado (sem rede)
    itens2 = buscar_itens(url="http://x/feed", fetch_fn=lambda url: SAMPLE)
    check("buscar_itens usa fetch injetado (sem rede)", len(itens2) == 1)


def live() -> None:
    print("--- live: GET no feed real (best-effort) ---", flush=True)
    try:
        itens = buscar_itens(CORREIO_RSS_URL)
        print(f"LIVE OK: {len(itens)} itens do feed real", flush=True)
        if itens:
            i = itens[0]
            # imprime so ASCII-safe para nao quebrar console Windows
            print(f"  1o item: link={i.link}", flush=True)
            print(f"           tem titulo={bool(i.titulo)} | tem descricao={bool(i.descricao)}", flush=True)
    except Exception as e:  # noqa: BLE001
        print(f"LIVE SKIP: feed indisponivel ({type(e).__name__}) — rede e best-effort", flush=True)


def run_pytest() -> bool:
    print("--- pytest tests/test_correio_rss.py ---", flush=True)
    r = subprocess.run([sys.executable, "-m", "pytest", "tests/test_correio_rss.py", "-q"])
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
        print("OK: integracao Correio RSS validada (sem tocar banco)", flush=True)
        return 0
    print("FALHA: revise os casos marcados como FAIL acima", flush=True)
    return 1


if __name__ == "__main__":
    sys.exit(main())
