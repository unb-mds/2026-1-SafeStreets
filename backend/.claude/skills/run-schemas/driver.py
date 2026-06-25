"""Driver dos schemas Pydantic — SafeStreets backend (app/schemas/).

Padrão "import-and-call": importa os schemas e os exercita diretamente —
sem servidor HTTP, sem banco. Cobre os 4 comportamentos que importam num
schema Pydantic:
  1. entrada válida é parseada;
  2. entrada inválida levanta ValidationError;
  3. a saída (Out) serializa só os campos esperados;
  4. os envelopes têm os defaults certos (success=True).

Depois roda o pytest unitário de tests/test_schemas.py.

Uso (a partir de backend/):
    python .claude/skills/run-schemas/driver.py
    python .claude/skills/run-schemas/driver.py --only-smoke   # só os asserts inline
    python .claude/skills/run-schemas/driver.py --only-tests   # só o pytest

Exit 0 = tudo ok. Exit 1 = algum caso falhou ou o pytest falhou.
"""
import subprocess
import sys
from pathlib import Path

# Rodado como script, sys.path[0] é a pasta do driver, não backend/.
# Coloca backend/ (4 níveis acima: run-schemas/skills/.claude/backend) no path
# para que "import app..." resolva independente do diretório de invocação.
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from pydantic import ValidationError

from app.schemas.ocorrencia import (
    OcorrenciaCreate,
    OcorrenciaOut,
    OcorrenciaListResponse,
    OcorrenciaDetailResponse,
)

_results: list[bool] = []


def check(nome: str, ok: bool) -> None:
    print(f"{'PASS' if ok else 'FAIL'}: {nome}", flush=True)
    _results.append(ok)


def smoke() -> None:
    # 1. entrada valida
    try:
        o = OcorrenciaCreate(titulo_noticia="Furto na 102 Sul", latitude=-15.79, longitude=-47.88)
        check("OcorrenciaCreate aceita entrada valida", o.latitude == -15.79)
    except Exception as e:  # noqa: BLE001
        check(f"OcorrenciaCreate aceita entrada valida [{e!r}]", False)

    # 2a. latitude fora do range -> ValidationError
    try:
        OcorrenciaCreate(titulo_noticia="x", latitude=999, longitude=0)
        check("OcorrenciaCreate rejeita latitude invalida", False)
    except ValidationError:
        check("OcorrenciaCreate rejeita latitude invalida", True)

    # 2b. longitude fora do range -> ValidationError
    try:
        OcorrenciaCreate(titulo_noticia="x", latitude=0, longitude=999)
        check("OcorrenciaCreate rejeita longitude invalida", False)
    except ValidationError:
        check("OcorrenciaCreate rejeita longitude invalida", True)

    # 2c. campo obrigatorio ausente -> ValidationError
    try:
        OcorrenciaCreate(latitude=0, longitude=0)
        check("OcorrenciaCreate exige titulo_noticia", False)
    except ValidationError:
        check("OcorrenciaCreate exige titulo_noticia", True)

    # 3. Out serializa exatamente os campos do contrato
    out = OcorrenciaOut(id=1, titulo="Teste", latitude=-15.79, longitude=-47.88)
    esperado = {"id": 1, "titulo": "Teste", "latitude": -15.79, "longitude": -47.88}
    check("OcorrenciaOut serializa os campos esperados", out.model_dump() == esperado)

    # 4. envelopes com defaults corretos
    lista = OcorrenciaListResponse(data=[out])
    detalhe = OcorrenciaDetailResponse(data=out)
    check("OcorrenciaListResponse default success=True", lista.success is True and lista.data == [out])
    check("OcorrenciaDetailResponse default success=True", detalhe.success is True and detalhe.data.id == 1)


def run_pytest() -> bool:
    print("--- pytest tests/test_schemas.py ---", flush=True)
    r = subprocess.run([sys.executable, "-m", "pytest", "tests/test_schemas.py", "-q"])
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
        print("OK: schemas validados e testes passaram", flush=True)
        return 0
    print("FALHA: revise os casos marcados como FAIL acima", flush=True)
    return 1


if __name__ == "__main__":
    sys.exit(main())
