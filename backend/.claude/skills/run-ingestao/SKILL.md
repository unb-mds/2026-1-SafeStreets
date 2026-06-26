---
name: run-ingestao
description: Implementar, rodar e testar o pipeline de ingestão (app/services/ingestao.py) do backend SafeStreets — que conecta as integrações (RSS Correio, Nominatim, Gemini) ao banco. Use ao mexer na ingestão, no enriquecimento de ocorrências, na extração de região, ou para validar o fluxo RSS → geocode → persistência.
---

# Run: Pipeline de Ingestão (app/services/ingestao.py)

O serviço de ingestão é o **motor que conecta as integrações** (RF12): para cada
notícia do RSS, aplica o **filtro de relevância** (só segurança do DF), extrai a
região administrativa do texto, geocodifica (Nominatim), resolve/cria o
`LocalPin`, resume (Gemini) e persiste a `Ocorrencia`. O driver `driver.py` roda
o pipeline inteiro contra um **SQLite em memória** com as integrações injetadas
(sem rede, sem chave, sem Postgres) e depois o pytest.

**Filtro de relevância (2 camadas):**
- **Camada 1 — editoria pela URL**: `eh_cidades_df` mantém só itens cujo `link`
  contém `/cidades-df/` (sinal estruturado, mais confiável que texto).
- **Camada 2 — palavra-chave**: `eh_seguranca` exige um termo de segurança
  (roubo, furto, homicídio, polícia…) no título/descrição.
- `eh_relevante = Camada 1 E Camada 2` é o filtro padrão; injetável via
  `ingerir(db, filtro=...)`.

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
- Filtro de relevancia (Camadas 1+2) -
PASS: eh_cidades_df pela URL
PASS: eh_seguranca por keyword
PASS: eh_relevante exige DF + seguranca
PASS: ingerir filtra 2 de 3 (so o relevante persiste)
- Pipeline (filtro bypassado) -
PASS: persistiu 2 (1 sem regiao pulado)
PASS: regiao virou codigo RA
PASS: LocalPin por regiao distinta
PASS: resumo COMPLETO gravado
PASS: Gemini falhou -> persiste status ERRO (ADR-001 A)
--- pytest tests/test_ingestao.py ---
12 passed
OK: ingestao validada (filtro DF/seguranca -> geocode -> pin -> gemini -> persist)
```

Modo **--live** (feed RSS real + Nominatim real + filtro real; Gemini falso;
SQLite em memória; best-effort, não derruba o exit):

```bash
python .claude/skills/run-ingestao/driver.py --live
```

Verificado nesta máquina: `LIVE OK: processadas=20 filtradas=19 persistidas=0 sem_regiao=1 erros=0`
— o filtro descartou corretamente 19 itens não-DF/segurança; o 1 relevante citava
"DF" genérico (sem RA específica), então caiu em `sem_regiao` (ver Gotchas).

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

- **O feed de editoria do Correio não existe pela via óbvia.** Testado:
  `/feed/?secao=cidades-df` retorna 200 mas **ignora o parâmetro** (idêntico ao
  geral); `/feed/cidades-df/` e `/feed/seguranca/` dão 404. Por isso o filtro é
  feito **no conteúdo**, não na fonte — usando o `/cidades-df/` que vem no `link`
  de cada item (Camada 1).
- **Dois gargalos diferentes, não confundir.** `filtradas` = item não é
  DF/segurança (Camada 1+2). `sem_regiao` = item é relevante mas o texto não
  nomeia uma RA reconhecida. Ao vivo: 20 → 19 `filtradas` (corretas) → 1
  relevante que citava "DF" genérico → 1 `sem_regiao`. Ou seja, com o filtro
  ligado, o gargalo passou a ser a **extração de região**, não o ruído do feed.
- **`TERMOS_SEGURANCA` e `REGIOES_DF` são listas iniciais.** Termo de segurança
  ausente → `filtradas`; RA fora da lista → `sem_regiao`. Ambas são dados que o
  time expande. Falso negativo de keyword é o trade-off conhecido da Camada 2.
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
