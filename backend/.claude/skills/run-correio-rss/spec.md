# Spec — Skill: run-correio-rss

> O **quê** e o **porquê** desta skill. Detalhes de execução ficam no `SKILL.md`.
> Módulo coberto: `app/integrations/correio_rss.py`.
> Referência de processo: `docs/Estudos/spec-driven-development.md`.

## Problema
A coleta de notícias depende do feed RSS do Correio Braziliense, uma **fonte
externa instável** (URL não óbvia, links relativos, `pubDate` fora do padrão,
sem `<category>`). Sem uma forma rápida e **sem rede** de validar o parse, cada
mexida no scraping arrisca quebrar silenciosamente a ingestão. A skill existe
para exercitar e validar essa camada de integração de forma determinística,
**sem tocar no banco**.

## Objetivos desta entrega
- [x] Validar `parse_feed` (XML → `list[ItemRSS]`) de forma offline e determinística.
- [x] Garantir que `buscar_itens` aceita `fetch_fn` injetada (teste sem rede).
- [x] Cobrir a limpeza de conteúdo (tags HTML removidas, entidades desfeitas) e a
      resolução de `<link>` relativo → absoluto.
- [x] Oferecer um modo `--live` best-effort (GET real no feed) que **nunca**
      derruba o exit.

## Requisitos cobertos
- **RF12 / RF14 — Camada de ingestão (coleta de notícias):** integração que busca
  e estrutura o feed RSS da fonte externa, sem persistência.

## User Stories
- **Como dev/agente**, quero validar o parse do RSS do Correio sem rede nem banco,
  para mexer no scraping com segurança e feedback imediato (exit 0/1).

## Critérios de aceitação
- **Dado** que rodo `python .claude/skills/run-correio-rss/driver.py`, **quando** o
  driver termina, **então** todos os checks inline passam, o `pytest
  tests/test_correio_rss.py` reporta **8 passed** e o exit é **0**.
- **Dado** um `<link>` relativo no feed, **quando** o item é parseado, **então** o
  link vem **absoluto** (resolvido contra `CORREIO_BASE_URL`).
- **Dado** um título com entidades HTML, **quando** parseado, **então** o texto vem
  limpo (tags removidas, entidades desfeitas); `limpar_html(None) == ''`.
- **Dado** o modo `--live` sem rede/feed fora do ar, **quando** executado, **então**
  imprime `LIVE SKIP` e **não** falha o driver (best-effort).

## Fora de escopo (NÃO faz)
- Persistência no banco (é da camada de serviço/repositório — ver `run-ingestao`).
- Filtro de relevância DF/segurança (ver `run-ingestao`).
- Conversão do `pubDate` para `datetime` (é trabalho da ingestão).
- Suporte a outras fontes RSS além do Correio.
