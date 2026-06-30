"""Integração com feeds RSS de notícias (Correio Braziliense e G1 DF).

Camada de integração (RF12/RF14): isola a fonte externa. NÃO toca no banco —
apenas busca o XML e o converte em itens estruturados. A persistência é
responsabilidade da camada de serviço/repositório.

Multi-fonte: o feed geral do Correio (`/feed/`) traz pouca notícia do DF que
nomeie a Região Administrativa; o feed do G1 DF é exclusivo do Distrito Federal
e as manchetes citam a RA direto. Por isso `buscar_todos()` agrega as fontes
de `FONTES`, marcando cada item com a `fonte` de origem (o filtro de relevância
trata cada origem de um jeito — ver app/services/ingestao.py).

Separação proposital:
- `parse_feed(conteudo)` é PURO (str/bytes -> list[ItemRSS]); testável sem rede.
- `fetch_feed(url)` faz a chamada HTTP (httpx).
- `buscar_itens(url, fetch_fn=...)` busca UMA fonte; aceita fetch injetado p/ teste.
- `buscar_todos(fontes, fetch_fn=...)` agrega TODAS as fontes (uma fora do ar
  não derruba as outras).
"""
import html
import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from urllib.parse import urljoin

CORREIO_BASE_URL = "https://www.correiobraziliense.com.br"
CORREIO_RSS_URL = "https://www.correiobraziliense.com.br/feed/"

# G1 DF: feed exclusivo do Distrito Federal. Links já vêm absolutos (globo.com).
G1_BASE_URL = "https://g1.globo.com"
G1_DF_RSS_URL = "https://g1.globo.com/rss/g1/df/distrito-federal/"


@dataclass
class ItemRSS:
    titulo: str
    descricao: str
    link: str
    data_publicacao: str | None
    autor: str | None
    fonte: str = "correio"  # origem do feed: "correio", "g1-df", ...


@dataclass(frozen=True)
class FonteRSS:
    """Uma fonte RSS configurada. `chave` rotula os itens (`ItemRSS.fonte`)."""
    chave: str
    url: str
    base_url: str


# Fontes agregadas por buscar_todos(). Metrópoles foi avaliado e descartado
# (descrições genéricas "DF" sem citar RA -> nada mapeável).
FONTES: list[FonteRSS] = [
    FonteRSS("correio", CORREIO_RSS_URL, CORREIO_BASE_URL),
    FonteRSS("g1-df", G1_DF_RSS_URL, G1_BASE_URL),
]


def limpar_html(texto: str | None) -> str:
    """Remove tags HTML e desfaz entidades (RF12: limpeza de conteúdo bruto)."""
    sem_tags = re.sub(r"<[^>]+>", "", texto or "")
    return html.unescape(sem_tags).strip()


def _absolutizar(link: str | None, base_url: str) -> str:
    # O feed do Correio traz link relativo (ex.: "/colunistas/..."); resolve
    # para URL absoluta para o frontend conseguir abrir a fonte original.
    link = (link or "").strip()
    if not link:
        return ""
    return urljoin(base_url.rstrip("/") + "/", link)


def parse_feed(
    conteudo: str | bytes,
    base_url: str = CORREIO_BASE_URL,
    fonte: str = "correio",
) -> list[ItemRSS]:
    """Converte o XML do RSS em itens estruturados. Aceita str ou bytes
    (bytes preserva o encoding declarado no XML). `fonte` rotula a origem."""
    root = ET.fromstring(conteudo)
    itens: list[ItemRSS] = []
    for item in root.iter("item"):
        itens.append(
            ItemRSS(
                titulo=limpar_html(item.findtext("title", "")),
                descricao=limpar_html(item.findtext("description", "")),
                link=_absolutizar(item.findtext("link", ""), base_url),
                data_publicacao=(item.findtext("pubDate") or None),
                autor=(item.findtext("author") or None),
                fonte=fonte,
            )
        )
    return itens


def fetch_feed(url: str = CORREIO_RSS_URL, *, client=None) -> bytes:
    """Busca o XML do feed. Retorna bytes (deixa o parser respeitar o encoding)."""
    import httpx

    c = client or httpx.Client(timeout=10, follow_redirects=True)
    try:
        resp = c.get(url)
        resp.raise_for_status()
        return resp.content
    finally:
        if client is None:
            c.close()


def buscar_itens(
    url: str = CORREIO_RSS_URL,
    *,
    fetch_fn=None,
    fonte: str = "correio",
    base_url: str = CORREIO_BASE_URL,
) -> list[ItemRSS]:
    """Busca e parseia UMA fonte. `fetch_fn` pode ser injetada nos testes para
    evitar rede (recebe a url, devolve str/bytes do XML)."""
    fetch = fetch_fn or fetch_feed
    return parse_feed(fetch(url), base_url=base_url, fonte=fonte)


def buscar_todos(fontes: list[FonteRSS] | None = None, *, fetch_fn=None) -> list[ItemRSS]:
    """Agrega todas as fontes configuradas (multi-fonte). Uma fonte fora do ar
    é ignorada para não derrubar as demais. É o que a ingestão usa por padrão."""
    fontes = fontes if fontes is not None else FONTES
    itens: list[ItemRSS] = []
    for f in fontes:
        try:
            itens.extend(
                buscar_itens(f.url, fetch_fn=fetch_fn, fonte=f.chave, base_url=f.base_url)
            )
        except Exception:  # noqa: BLE001 — feed instável não pode parar o lote
            continue
    return itens
