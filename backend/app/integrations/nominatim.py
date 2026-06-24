"""Integração com o Nominatim (OpenStreetMap) — geocoding.

Camada de integração (RF12): converte o nome de uma região administrativa do DF
em coordenadas (lat/long) usadas no centroide da ocorrência. NÃO toca no banco.

Separação proposital (igual ao correio_rss):
- `parse_resposta(dados)` é PURO (list[dict] -> Coordenada|None); testável sem rede.
- `_fetch_nominatim(local)` faz a chamada HTTP (httpx).
- `geocodificar(local, fetch_fn=...)` orquestra; aceita fetch injetado p/ teste.
"""
from dataclasses import dataclass

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
# Nominatim EXIGE um User-Agent identificável; sem ele a requisição é bloqueada.
USER_AGENT = "SafeStreets/0.1 (projeto academico UnB-FGA)"


@dataclass
class Coordenada:
    latitude: float
    longitude: float


def parse_resposta(dados: list[dict]) -> Coordenada | None:
    """Extrai a 1ª coordenada da resposta do Nominatim. `lat`/`lon` vêm como
    string no JSON; convertidos para float. Lista vazia -> None."""
    if not dados:
        return None
    primeiro = dados[0]
    try:
        return Coordenada(
            latitude=float(primeiro["lat"]),
            longitude=float(primeiro["lon"]),
        )
    except (KeyError, ValueError, TypeError):
        return None


def _fetch_nominatim(local: str, *, client=None) -> list[dict]:
    import httpx

    params = {"q": f"{local}, Distrito Federal, Brasil", "format": "json", "limit": 1}
    c = client or httpx.Client(timeout=10)
    try:
        resp = c.get(NOMINATIM_URL, params=params, headers={"User-Agent": USER_AGENT})
        resp.raise_for_status()
        return resp.json()
    finally:
        if client is None:
            c.close()


def geocodificar(local: str, *, fetch_fn=None) -> Coordenada | None:
    """Geocodifica uma região administrativa do DF. Retorna `Coordenada` ou
    `None` se não encontrar. `fetch_fn(local) -> list[dict]` pode ser injetada
    nos testes para evitar rede."""
    if not local or not local.strip():
        return None
    fetch = fetch_fn or _fetch_nominatim
    return parse_resposta(fetch(local))
