---
name: run-correio-rss
description: Implementar, rodar e testar a integração do feed RSS do Correio Braziliense (app/integrations/correio_rss.py) no backend SafeStreets. Use ao mexer no scraping/ingestão de notícias, no parse do RSS, ou para validar a extração de itens sem tocar no banco.
---

# Run: Integração Correio RSS (app/integrations/)

Camada de integração que busca e parseia o feed RSS do Correio Braziliense em
itens estruturados (`ItemRSS`). **Não toca no banco** — só converte XML em
objetos; persistir é trabalho da camada de serviço/repositório. O driver
`driver.py` exercita a integração por import-and-call e roda o pytest.

**Todos os caminhos abaixo são relativos a `backend/`.** Rode de `backend/`.

## Prerequisitos

```bash
pip install -r requirements.txt
```

Python 3.11. Usa só `httpx` (já vem em `requirements.txt`) e a stdlib
(`xml.etree.ElementTree`, `urllib.parse`). **Sem banco, sem servidor.** Os
binários `pytest` podem não estar no PATH (Python MS Store) — por isso `python -m`.

## Run (caminho do agente) — driver da integração

Por padrão roda **offline** (sample embutido + fetch injetado) + pytest. Esse é
o caminho determinístico. Exit 0 = tudo ok.

```bash
python .claude/skills/run-correio-rss/driver.py
```

Saída esperada (offline):

```
PASS: parse_feed retorna 1 item do sample
PASS: titulo com entidades desfeitas
PASS: descricao sem tags HTML
PASS: link relativo virou absoluto
PASS: pubDate preservado
PASS: limpar_html(None) == ''
PASS: buscar_itens usa fetch injetado (sem rede)
--- pytest tests/test_correio_rss.py ---
8 passed
OK: integracao Correio RSS validada (sem tocar banco)
```

Modo **--live** (faz um GET real no feed; depende de rede, nunca derruba o exit):

```bash
python .claude/skills/run-correio-rss/driver.py --live
```

Verificado nesta máquina: `LIVE OK: 20 itens do feed real`, com o link relativo
do feed resolvido para absoluto.

Flags: `--only-smoke` (só asserts inline), `--only-tests` (só pytest).

## Direct invocation (uso da integração no código)

```python
from app.integrations.correio_rss import buscar_itens, parse_feed

# busca + parse (rede):
itens = buscar_itens()                      # usa CORREIO_RSS_URL
# só parse (sem rede), p/ teste ou pipeline com XML em mãos:
itens = parse_feed(xml_bytes_ou_str)
# itens: list[ItemRSS(titulo, descricao, link, data_publicacao, autor)]
```

`buscar_itens(url, fetch_fn=...)` aceita uma função de fetch injetada — é assim
que os testes evitam rede.

## Test (só o pytest)

```bash
python -m pytest tests/test_correio_rss.py -v
```

## Gotchas

Coisas reais do feed do Correio (descobertas inspecionando o feed ao vivo):

- **A URL que funciona é `https://www.correiobraziliense.com.br/feed/`.** Vários
  caminhos "óbvios" (`/rss/`, `/rss/cidades-df/`, `/rss.xml`) retornam **404 com
  página HTML**, não XML. O `/feed/` é geral (todas as editorias, não só
  segurança do DF) — para filtrar por DF, filtre os itens depois do parse ou
  procure uma URL de editoria específica.
- **`<link>` vem relativo** (`/colunistas/...`), não absoluto. O parser resolve
  com `urljoin` contra `CORREIO_BASE_URL`. Sem isso o frontend não abre a fonte.
- **`<pubDate>` é `YYYY-MM-DD HH:MM:SS`**, não o RFC822 padrão de RSS
  (`Tue, 27 Feb 2024 ...`). Guardado como string crua; converter é trabalho da
  ingestão, não do parser.
- **Não há `<category>`** neste feed (tem `author`, `guid`, `thumbnail`). Por
  isso `ItemRSS` não tem categoria.
- **Passe bytes, não str, para `parse_feed` quando vier da rede.**
  `httpx.Response.content` (bytes) deixa o ElementTree respeitar o encoding
  declarado no XML; decodificar manualmente erra acento.
- **Console do Windows (cp1252) mostra acento como `�`.** É só exibição — o
  conteúdo parseado está correto. A saída do driver é ASCII de propósito.

## Troubleshooting

| Sintoma | Causa / correção |
|---|---|
| `ModuleNotFoundError: No module named 'app'` | Rodando fora de `backend/`; faça `cd backend`. O driver insere `backend/` no path via `parents[3]`, mas o pytest depende do CWD. |
| `No module named pytest` / `httpx` | `pip install -r requirements.txt` (de `backend/`) |
| `LIVE SKIP: feed indisponivel` | Sem rede ou feed fora do ar; o modo `--live` é best-effort e não falha o driver |
| `ParseError` no `parse_feed` | Veio HTML (página 404) em vez de XML — confira a URL do feed (use `/feed/`) |
