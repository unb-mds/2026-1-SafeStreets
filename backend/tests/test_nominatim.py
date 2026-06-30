"""Testes da integração Nominatim (app/integrations/nominatim.py).

Puros: não tocam rede nem banco. O JSON de exemplo espelha a resposta real do
Nominatim (lista de objetos com `lat`/`lon` como string).
"""
from app.integrations.nominatim import (
    Coordenada,
    geocodificar,
    parse_resposta,
)

# Resposta real (recortada) do Nominatim para "Ceilandia, Distrito Federal".
SAMPLE = [
    {
        "lat": "-15.8173391",
        "lon": "-48.1045766",
        "display_name": "Ceilândia, Distrito Federal, Região Centro-Oeste, Brasil",
    }
]


def test_parse_extrai_coordenada():
    coord = parse_resposta(SAMPLE)
    assert isinstance(coord, Coordenada)
    assert coord.latitude == -15.8173391
    assert coord.longitude == -48.1045766


def test_parse_lista_vazia_retorna_none():
    assert parse_resposta([]) is None


def test_parse_campos_ausentes_retorna_none():
    assert parse_resposta([{"display_name": "sem coords"}]) is None


def test_parse_lat_nao_numerica_retorna_none():
    assert parse_resposta([{"lat": "abc", "lon": "-48.1"}]) is None


def test_geocodificar_local_vazio_retorna_none():
    assert geocodificar("") is None
    assert geocodificar("   ") is None


def test_geocodificar_usa_fetch_injetado_sem_rede():
    chamado = {}

    def fake_fetch(local):
        chamado["local"] = local
        return SAMPLE

    coord = geocodificar("Ceilândia", fetch_fn=fake_fetch)
    assert chamado["local"] == "Ceilândia"
    assert coord.latitude == -15.8173391


def test_geocodificar_sem_resultado_retorna_none():
    coord = geocodificar("LugarInexistente", fetch_fn=lambda local: [])
    assert coord is None
