---
name: run-schemas
description: Implementar, rodar e testar os schemas Pydantic da camada app/schemas/ do backend SafeStreets. Use ao criar/alterar um schema, validar entrada e saída de dados, exercitar os modelos Pydantic ou rodar os testes unitários dos schemas.
---

# Run: Schemas Pydantic (camada app/schemas/)

Os schemas em `app/schemas/` são modelos **Pydantic v2** puros — validam a
entrada da API (`<Recurso>Create`), modelam a saída (`<Recurso>Out`) e os
envelopes de resposta. Não têm servidor nem banco: o driver
`driver.py` os exercita por **import-and-call** (instancia os modelos com
dados válidos/inválidos, confere o comportamento) e roda o pytest unitário.

**Todos os caminhos abaixo são relativos a `backend/`.** Rode de `backend/`.

## Prerequisitos

```bash
pip install -r requirements.txt
```

Python 3.11. Pydantic já vem com `fastapi[all]` (testado: pydantic 2.13.3).
**Não precisa de banco nem de servidor.** Os binários `pytest`/`uvicorn` podem
não estar no PATH (Python da MS Store no Windows) — por isso `python -m`.

## Run (caminho do agente) — driver dos schemas

Um comando: exercita os schemas e roda o pytest. Exit 0 = tudo ok.

```bash
python .claude/skills/run-schemas/driver.py
```

Saída esperada:

```
PASS: OcorrenciaCreate aceita entrada valida
PASS: OcorrenciaCreate rejeita latitude invalida
PASS: OcorrenciaCreate rejeita longitude invalida
PASS: OcorrenciaCreate exige titulo_noticia
PASS: OcorrenciaOut serializa os campos esperados
PASS: OcorrenciaListResponse default success=True
PASS: OcorrenciaDetailResponse default success=True
--- pytest tests/test_schemas.py ---
12 passed
OK: schemas validados e testes passaram
```

Flags:

```bash
python .claude/skills/run-schemas/driver.py --only-smoke   # só os asserts inline
python .claude/skills/run-schemas/driver.py --only-tests   # só o pytest
```

O driver cobre os 4 comportamentos que importam num schema: parsing de entrada
válida, rejeição de entrada inválida (`ValidationError`), serialização do `Out`
e defaults dos envelopes. Hoje cobre `app/schemas/ocorrencia.py`; ao criar um
schema novo, adicione os casos dele no `smoke()` do driver e os testes em
`tests/test_schemas.py`.

## Fluxo: implementar um schema novo com teste

1. **Criar** `app/schemas/<recurso>.py` (Pydantic v2). Padrão por recurso:
   `<Recurso>Create` (entrada + `field_validator`), `<Recurso>Out` (saída),
   `<Recurso>ListResponse` / `<Recurso>DetailResponse` (envelope com
   `success: bool = True` + `data`).

   ```python
   from pydantic import BaseModel, field_validator

   class ExemploCreate(BaseModel):
       nome: str
       valor: float

       @field_validator("valor")
       @classmethod
       def _faixa(cls, v: float) -> float:
           if v < 0:
               raise ValueError("valor deve ser >= 0")
           return v
   ```

2. **Testar** em `tests/test_schemas.py` — testes unitários, sem HTTP/banco:
   pelo menos 1 caso válido, 1 inválido (`pytest.raises(ValidationError)`) e a
   serialização do `Out` (`model_dump()`).

3. **Rodar** o driver:

   ```bash
   python .claude/skills/run-schemas/driver.py
   ```

## Test (só o pytest)

```bash
python -m pytest tests/test_schemas.py -v
```

## Gotchas

- **Rodar de `backend/`.** O driver insere `backend/` no `sys.path` via
  `Path(__file__).parents[3]`, então o `import app...` funciona mesmo invocando
  pelo caminho longo — mas o **pytest** (subprocess) depende do CWD: precisa ser
  `backend/` para achar `tests/` e o pacote `app`.
- **Por que o `sys.path.insert`:** rodando `python caminho/driver.py`, o
  `sys.path[0]` é a pasta do *driver* (`run-schemas/`), não `backend/` — sem o
  insert dá `ModuleNotFoundError: No module named 'app'`. (Drivers que dirigem
  via subprocess HTTP não sofrem disso; este importa `app` direto.)
- **Saída do driver é ASCII de propósito.** O console do Windows (cp1252) exibe
  acentos como `v�lida`. As mensagens de PASS/FAIL evitam acentos para sair
  legíveis em qualquer terminal — os testes em si podem usar acento à vontade.
- **Validação fica no schema; mapeamento de nome, no service.** `OcorrenciaOut`
  usa `titulo` (contrato) mas o ORM tem `titulo_noticia` — essa conversão é
  feita no service, não com lógica dentro do schema.

## Troubleshooting

| Sintoma | Causa / correção |
|---|---|
| `ModuleNotFoundError: No module named 'app'` no pytest | Rodando fora de `backend/`; faça `cd backend` |
| `No module named pytest` | `pip install -r requirements.txt` (de `backend/`) |
| Acentos saem como `v�lida` | Cosmético (encoding do console Windows); a saída do driver já é ASCII, não afeta o exit code |
| `FAIL` num caso de validação | O `field_validator` do schema mudou ou o range está incorreto; veja `app/schemas/ocorrencia.py` |
