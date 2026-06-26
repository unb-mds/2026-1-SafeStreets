---
name: run-ingestao
description: Implementar, rodar e testar o pipeline de ingestão (app/services/ingestao.py) do backend SafeStreets — que conecta as integrações (RSS Correio, Nominatim, Gemini) ao banco. Use ao mexer na ingestão, no enriquecimento de ocorrências, na extração de região, ou para validar o fluxo RSS → geocode → persistência.
---

# Run: Pipeline de Ingestão (app/services/ingestao.py)

O serviço de ingestão é o **motor que conecta as integrações** (RF12): para cada
notícia do RSS, extrai a região administrativa do texto, geocodifica (Nominatim),
resolve/cria o `LocalPin`, resume (Gemini) e persiste a `Ocorrencia`. O driver
`driver.py` roda o pipeline inteiro contra um **SQLite em memória** com as
integrações injetadas (sem rede, sem chave, sem Postgres) e depois o pytest.

**Todos os caminhos abaixo são relativos a `backend/`.** Rode de `backend/`.

## Prerequisites

```bash
pip install -r requirements.txt
```

Python 3.11. O driver/teste **não precisam de Postgres, rede nem chave** — usam
SQLite em memória e integrações injetadas. Use `python -m` (binários fora do PATH).

## Run (caminho do agente) — driver da ingestão

Por padrão roda **offline** (itens RSS, geocoding e Gemini falsos) + pytest.
Determinístico. Exit 0 = ok.

```bash
python .claude/skills/run-ingestao/driver.py
```

Saída esperada (offline):

```
PASS: processou os 3 itens
PASS: persistiu 2 (1 sem regiao foi pulado)
PASS: 2 ocorrencias no banco
PASS: resumo COMPLETO gravado
PASS: regiao extraida vira codigo RA
PASS: LocalPin criado para cada regiao distinta
PASS: Gemini falhou -> persiste com status ERRO (ADR-001 A)
--- pytest tests/test_ingestao.py ---
8 passed
OK: ingestao validada (RSS->regiao->geocode->pin->gemini->persist)
```

Modo **--live** (feed RSS real + Nominatim real; Gemini continua falso; SQLite
em memória; best-effort, não derruba o exit):

```bash
python .claude/skills/run-ingestao/driver.py --live
```

Verificado nesta máquina: `LIVE OK: processadas=20 persistidas=1 sem_regiao=19 erros=0`
— do feed geral, só 1 das 20 notícias mencionava uma RA do DF (ver Gotchas).

Flags: `--only-smoke`, `--only-tests`.

## Direct invocation (uso no código)

```python
from app.services import ingestao
# Pipeline real (busca RSS, geocodifica, chama Gemini com GEMINI_API_KEY do env):
resultado = ingestao.ingerir(db)
# Injetando tudo (teste/local sem rede/chave):
resultado = ingestao.ingerir(db, itens=[...], geocodificar=fn, gemini=GeminiClient(generate_fn=fn))
# resultado: ResultadoIngestao(processadas, persistidas, sem_regiao, erros)
```

## Test (só o pytest)

```bash
python -m pytest tests/test_ingestao.py -v
```

## Gotchas

- **O feed geral do Correio (`/feed/`) descarta ~95% no filtro de região.**
  Testado ao vivo: 20 notícias → **1 persistida, 19 sem_regiao**. O feed não é
  focado em segurança do DF (vem celebridade, nacional, etc.), e a ingestão só
  guarda o que menciona uma RA. Para volume real, o time precisa de um feed de
  editoria do DF ou de um filtro de relevância melhor.
- **A extração de região ignora acento de propósito.** `extrair_regiao` normaliza
  (NFKD + lowercase), então "ceilandia" casa com "Ceilândia". Sem isso, texto sem
  acento era silenciosamente pulado — bug real pego pelo driver. Não remova o
  `_normalizar`.
- **`REGIOES_DF` é um subconjunto inicial** (nome → código `RA-XXX`). Só ~13 RAs.
  Notícia de uma RA fora da lista é tratada como "sem região". Expandir é tarefa
  de dados do time.
- **Gemini falho NÃO bloqueia a persistência** (ADR-001 Opção A): a ocorrência é
  gravada com `resumo_status="ERRO"` e resumo nulo. O `except` por item garante
  que uma notícia ruim não derruba o lote inteiro.
- **`regiao_administrativa` é o código (`RA-009`), não o nome.** O nome
  ("Ceilândia") vai para `LocalPin.nome_regiao`; a coluna da ocorrência é
  `String(10)` e guarda o código.

## Troubleshooting

| Sintoma | Causa / correção |
|---|---|
| `ModuleNotFoundError: No module named 'app'` | Rodando fora de `backend/`; faça `cd backend` (o driver insere `backend/` no path via `parents[3]`, mas o pytest depende do CWD) |
| `persistidas=0` no offline | O texto dos itens de teste não contém nenhuma RA de `REGIOES_DF`, ou o `geocodificar` injetado retornou `None` |
| `LIVE SKIP` | Sem rede; o `--live` é best-effort |
| Muitos `sem_regiao` no `--live` | Esperado com o feed geral (ver Gotchas) — não é bug |
