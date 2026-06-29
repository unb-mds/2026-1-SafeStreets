"""Testes unitários dos schemas Pydantic (app/schemas/).

Testam os modelos diretamente — sem HTTP, sem banco. Validam:
parsing de entrada válida, rejeição de entrada inválida (ValidationError),
serialização de saída e os defaults dos envelopes.
"""
import pytest
from pydantic import ValidationError

from app.schemas.ocorrencia import (
    OcorrenciaCreate,
    OcorrenciaOut,
    OcorrenciaListResponse,
    OcorrenciaDetailResponse,
)


# ---- OcorrenciaCreate: entrada válida ----

def test_create_aceita_entrada_valida():
    o = OcorrenciaCreate(titulo_noticia="Furto na 102 Sul", latitude=-15.79, longitude=-47.88)
    assert o.titulo_noticia == "Furto na 102 Sul"
    assert o.latitude == -15.79
    assert o.longitude == -47.88


def test_create_aceita_limites_do_range():
    OcorrenciaCreate(titulo_noticia="x", latitude=-90, longitude=-180)
    OcorrenciaCreate(titulo_noticia="x", latitude=90, longitude=180)


# ---- OcorrenciaCreate: entrada inválida ----

@pytest.mark.parametrize("lat", [91, -91, 200])
def test_create_rejeita_latitude_fora_do_range(lat):
    with pytest.raises(ValidationError):
        OcorrenciaCreate(titulo_noticia="x", latitude=lat, longitude=0)


@pytest.mark.parametrize("lon", [181, -181, 999])
def test_create_rejeita_longitude_fora_do_range(lon):
    with pytest.raises(ValidationError):
        OcorrenciaCreate(titulo_noticia="x", latitude=0, longitude=lon)


def test_create_rejeita_campo_faltando():
    with pytest.raises(ValidationError):
        OcorrenciaCreate(latitude=0, longitude=0)  # titulo_noticia ausente


# ---- OcorrenciaOut: serialização ----

def test_out_serializa_campos():
    out = OcorrenciaOut(id=1, titulo="Teste", latitude=-15.79, longitude=-47.88)
    dump = out.model_dump()
    assert dump == {
        "id": 1,
        "titulo": "Teste",
        "latitude": -15.79,
        "longitude": -47.88,
        "ra": None,
        "regiao": None,
        "risco": None,
        "resumo": None,
        "resumo_status": None,
        "data": None,
        "descricao_detalhada": None,
        "fonte_url": None,
    }


# ---- Envelopes: defaults ----

def test_envelope_lista_default_success_true():
    env = OcorrenciaListResponse(data=[])
    assert env.success is True
    assert env.data == []


def test_envelope_detalhe_default_success_true():
    out = OcorrenciaOut(id=1, titulo="x", latitude=0, longitude=0)
    env = OcorrenciaDetailResponse(data=out)
    assert env.success is True
    assert env.data.id == 1
