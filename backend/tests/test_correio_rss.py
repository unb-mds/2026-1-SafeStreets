"""Testes da integração Correio RSS (app/integrations/correio_rss.py).

Puros: não tocam rede nem banco. O XML de exemplo espelha a estrutura real
do feed do Correio Braziliense (link relativo, pubDate "YYYY-MM-DD HH:MM:SS",
entidades HTML e tags na descrição).
"""
from app.integrations.correio_rss import (
    ItemRSS,
    limpar_html,
    parse_feed,
    buscar_itens,
)

SAMPLE = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Correio Braziliense</title>
    <item>
      <title>Roubo &amp; furto na Ceil&#226;ndia</title>
      <link>/cidades-df/2026/06/123-roubo-ceilandia.html</link>
      <author>Correio Braziliense</author>
      <description>&lt;p&gt;Ve&#237;culo &lt;b&gt;roubado&lt;/b&gt; na QNL.&lt;/p&gt;</description>
      <pubDate>2026-06-20 14:30:00</pubDate>
    </item>
    <item>
      <title>Item minimo</title>
      <link>https://www.correiobraziliense.com.br/ja-absoluto.html</link>
      <description>Sem tags.</description>
    </item>
  </channel>
</rss>"""


def test_parse_retorna_todos_os_itens():
    itens = parse_feed(SAMPLE)
    assert len(itens) == 2
    assert all(isinstance(i, ItemRSS) for i in itens)


def test_parse_limpa_html_e_entidades():
    item = parse_feed(SAMPLE)[0]
    assert item.titulo == "Roubo & furto na Ceilândia"
    # tags <p>/<b> removidas e entidades desfeitas
    assert item.descricao == "Veículo roubado na QNL."
    assert "<" not in item.descricao


def test_parse_resolve_link_relativo_para_absoluto():
    item = parse_feed(SAMPLE)[0]
    assert item.link == "https://www.correiobraziliense.com.br/cidades-df/2026/06/123-roubo-ceilandia.html"


def test_parse_preserva_link_ja_absoluto():
    item = parse_feed(SAMPLE)[1]
    assert item.link == "https://www.correiobraziliense.com.br/ja-absoluto.html"


def test_parse_pubdate_e_autor_opcionais():
    primeiro, segundo = parse_feed(SAMPLE)
    assert primeiro.data_publicacao == "2026-06-20 14:30:00"
    assert primeiro.autor == "Correio Braziliense"
    # segundo item não tem pubDate nem author -> None
    assert segundo.data_publicacao is None
    assert segundo.autor is None


def test_parse_aceita_bytes():
    itens = parse_feed(SAMPLE.encode("utf-8"))
    assert itens[0].titulo == "Roubo & furto na Ceilândia"


def test_limpar_html_em_none_retorna_vazio():
    assert limpar_html(None) == ""


def test_buscar_itens_usa_fetch_injetado_sem_rede():
    chamado = {}

    def fake_fetch(url):
        chamado["url"] = url
        return SAMPLE

    itens = buscar_itens(url="http://exemplo/feed", fetch_fn=fake_fetch)
    assert chamado["url"] == "http://exemplo/feed"
    assert len(itens) == 2
    assert itens[0].titulo == "Roubo & furto na Ceilândia"
