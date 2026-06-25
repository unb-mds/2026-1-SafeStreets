---
name: run-nominatim-gemini
description: Implementar, rodar e testar as integrações Nominatim (geocoding de RA → lat/long) e Google Gemini (resumo de ocorrências por IA) em app/integrations/ do backend SafeStreets. Use ao mexer no geocoding, no resumo de IA, no fallback do Gemini, ou para validar essas integrações sem tocar no banco.
---

# Run: Integrações Nominatim + Gemini (app/integrations/)

Duas integrações de fonte externa, **sem tocar no banco**:
- **`nominatim.py`** — geocoding: nome de região administrativa do DF → `Coordenada(lat, lon)` (RF12).
- **`gemini.py`** — resumo de ocorrência por IA, com fallback do **ADR-001 (Opção A)**: falhou → `resumo=None`, `status="ERRO"`.

O driver `driver.py` exercita as duas por import-and-call e roda o pytest.

**Todos os caminhos abaixo são relativos a `backend/`.** Rode de `backend/`.

## Prerequisites

```bash
pip install -r requirements.txt
```

Python 3.11. Nominatim usa só `httpx` (stdlib + httpx). Gemini usa o SDK
**`google-genai`** (novo; o `google-generativeai` está deprecado) — já está no
`requirements.txt`. Os imports do SDK são **preguiçosos**, então o módulo
`gemini.py` é importável e testável **mesmo sem o SDK ou sem chave**. Sem banco,
sem servidor. Use `python -m` (binários fora do PATH no Python MS Store).

## Run (caminho do agente) — driver das integrações

Por padrão roda **offline** (dados embutidos + funções injetadas) + pytest.
Determinístico, não precisa de rede nem chave. Exit 0 = ok.

```bash
python .claude/skills/run-nominatim-gemini/driver.py
```

Saída esperada (offline):

```
- Nominatim -
PASS: parse_resposta extrai Coordenada
... (6 checks)
- Gemini (fallback ADR-001 Opcao A) -
PASS: resumo COMPLETO com fn injetada
PASS: texto vazio -> ERRO
PASS: sem chave e sem fn -> ERRO
PASS: excecao do Gemini -> ERRO (resumo None)
--- pytest tests/test_nominatim.py tests/test_gemini.py ---
13 passed
OK: Nominatim + Gemini validados (sem tocar banco)
```

Modos **live** (best-effort, nunca derrubam o exit):

```bash
python .claude/skills/run-nominatim-gemini/driver.py --live-nominatim   # GET real no OSM
python .claude/skills/run-nominatim-gemini/driver.py --live-gemini      # precisa de GEMINI_API_KEY
```

Verificado nesta máquina: `--live-nominatim` → `Taguatinga -> (-15.8335277, -48.0565716)`.
Sem `GEMINI_API_KEY`, `--live-gemini` imprime `LIVE SKIP` (esperado).

Flags: `--only-smoke` (só asserts inline), `--only-tests` (só pytest).

## Direct invocation (uso no código)

```python
from app.integrations.nominatim import geocodificar
coord = geocodificar("Ceilândia")            # -> Coordenada(lat, lon) | None

from app.integrations.gemini import GeminiClient
r = GeminiClient().resumir("texto da notícia...")   # usa GEMINI_API_KEY do ambiente
# r.status in {"COMPLETO", "ERRO"}; r.resumo é None quando ERRO (ADR-001 A)
```

Ambos aceitam injeção para teste sem rede/chave: `geocodificar(local, fetch_fn=...)`
e `GeminiClient(generate_fn=lambda texto: "...")`.

## Test (só o pytest)

```bash
python -m pytest tests/test_nominatim.py tests/test_gemini.py -v
```

## Gotchas

- **Nominatim EXIGE `User-Agent`.** Sem um User-Agent identificável a OSM
  bloqueia a requisição. O `_fetch_nominatim` já manda um. Também há **limite de
  1 req/s** na instância pública — não fazer geocoding em loop apertado.
- **`lat`/`lon` do Nominatim vêm como string** no JSON (`"-15.81..."`); o parser
  converte para float e devolve `None` se não der (campo ausente/inválido).
- **Gemini: use o SDK novo `google-genai`** (`from google import genai;
  genai.Client(...)`). O antigo `google-generativeai` está **deprecado** e emite
  `FutureWarning` no import — não use.
- **Import preguiçoso do Gemini é proposital.** O `from google import genai`
  fica dentro de `_gerar_real`, então `gemini.py` importa e roda nos testes
  mesmo sem o SDK instalado ou sem chave. Não mover o import para o topo.
- **Fallback do Gemini = ADR-001 Opção A.** Qualquer falha (sem chave, SDK
  ausente, timeout, quota, resposta vazia) vira `status="ERRO"` com `resumo=None`
  — **não** há retry nem resumo genérico (opções B/C foram descartadas). Quem
  testar deve esperar `ERRO`, não exceção.
- **Console do Windows (cp1252)** mostra acento como `�`; a saída do driver é
  ASCII de propósito. O conteúdo processado está correto.

## Troubleshooting

| Sintoma | Causa / correção |
|---|---|
| `ModuleNotFoundError: No module named 'app'` | Rodando fora de `backend/`; faça `cd backend`. O driver insere `backend/` no path via `parents[3]`, mas o pytest depende do CWD. |
| `No module named 'google'` (no `--live-gemini`) | SDK não instalado: `pip install -r requirements.txt` |
| `LIVE SKIP: defina GEMINI_API_KEY` | Esperado — exporte `GEMINI_API_KEY` para testar o Gemini real |
| Nominatim retorna `[]`/`None` p/ uma RA | Refine o termo; o fetch já fixa ", Distrito Federal, Brasil" na query |
| `403`/bloqueio no Nominatim | Faltou User-Agent ou excedeu 1 req/s |
