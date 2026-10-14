"""Testes de CORS — a peça que conecta o frontend (navegador) ao backend.

Sem o CORS liberando a origem do front, o navegador **bloqueia** as respostas da
API (mesmo o backend respondendo 200). Aqui validamos que:
- origens permitidas recebem o header `Access-Control-Allow-Origin`;
- o preflight (OPTIONS) de uma origem permitida é liberado;
- origem desconhecida NÃO recebe o header (o navegador bloquearia).

A config é lida de env (CORS_ORIGINS / CORS_ORIGIN_REGEX) em `app/main.py`. Sem
essas envs (caso dos testes), o default libera `localhost:3000` e `:3001` — as
portas do dev do Next.js.
"""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

_ORIGEM_PERMITIDA = "http://localhost:3000"
_ORIGEM_DESCONHECIDA = "http://origem-nao-liberada.com"


def test_cors_libera_origem_permitida():
    # GET simples de uma origem permitida -> resposta traz o header de liberação
    r = client.get("/health", headers={"Origin": _ORIGEM_PERMITIDA})
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-origin") == _ORIGEM_PERMITIDA


def test_cors_preflight_de_origem_permitida_e_liberado():
    # Preflight (OPTIONS) que o navegador manda antes de um GET "não-simples"
    r = client.options(
        "/ocorrencias",
        headers={
            "Origin": _ORIGEM_PERMITIDA,
            "Access-Control-Request-Method": "GET",
        },
    )
    assert r.status_code in (200, 204)
    assert r.headers.get("access-control-allow-origin") == _ORIGEM_PERMITIDA


def test_cors_nao_libera_origem_desconhecida():
    # Origem fora da lista -> sem header de liberação (o navegador bloquearia)
    r = client.get("/health", headers={"Origin": _ORIGEM_DESCONHECIDA})
    assert r.headers.get("access-control-allow-origin") is None
