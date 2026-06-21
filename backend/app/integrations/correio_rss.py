"""Integração com o feed RSS do Correio Braziliense.

Camada de integração (RF12/RF14): isola a fonte externa. NÃO toca no banco —
apenas busca o XML e o converte em itens estruturados. A persistência é
responsabilidade da camada de serviço/repositório.

Separação proposital:
- `parse_feed(conteudo)` é PURO (str/bytes -> list[ItemRSS]); testável sem rede.
- `fetch_feed(url)` faz a chamada HTTP (httpx).
- `buscar_itens(url, fetch_fn=...)` orquestra; aceita um fetch injetado p/ teste.
"""
from dataclasses import dataclass
import html
import re
import xml.etree.ElementTree as ET
from urllib.parse import urljoin

CORREIO_BASE_URL = "https://www.correiobraziliense.com.br"
CORREIO_RSS_URL = "https://www.correiobraziliense.com.br/feed/"


@dataclass
class ItemRSS:
    titulo: str
    descricao: str
    link: str
    data_publicacao: str | None
    autor: str | None


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


def parse_feed(conteudo: str | bytes, base_url: str = CORREIO_BASE_URL) -> list[ItemRSS]:
    """Converte o XML do RSS em itens estruturados. Aceita str ou bytes
    (bytes preserva o encoding declarado no XML)."""
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


def buscar_itens(url: str = CORREIO_RSS_URL, *, fetch_fn=None) -> list[ItemRSS]:
    """Busca e parseia o feed. `fetch_fn` pode ser injetada nos testes para
    evitar rede (recebe a url, devolve str/bytes do XML)."""
    fetch = fetch_fn or fetch_feed
    return parse_feed(fetch(url))
