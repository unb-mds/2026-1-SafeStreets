"""Testes do endpoint de disparo da ingestão (POST /admin/ingerir).

A rota é fina: chama `ingestao.ingerir(db)` e devolve o resultado num envelope.
Os testes substituem (`monkeypatch`) o `ingerir` por um fake, então a rota é
exercitada sem rede, sem chave e sem o pipeline real. O get_db usa SQLite.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import OperationalError

from app.main import app
from app.core.database import Base, get_db
from app.models import Ocorrencia  # noqa: F401 — registra tabelas em Base.metadata
from app.services import ingestao
from app.services.ingestao import ResultadoIngestao

engine = create_engine(
    "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def _override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db
client = TestClient(app)


def test_disparo_retorna_resultado_no_envelope(monkeypatch):
    # ingerir falso: não toca rede/pipeline, devolve um resultado conhecido
    def fake_ingerir(db):
        return ResultadoIngestao(processadas=20, persistidas=2, filtradas=17, sem_regiao=1, erros=0)

    monkeypatch.setattr(ingestao, "ingerir", fake_ingerir)

    r = client.post("/admin/ingerir")
    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert body["data"] == {
        "processadas": 20,
        "persistidas": 2,
        "filtradas": 17,
        "sem_regiao": 1,
        "duplicadas": 0,
        "erros": 0,
    }


def test_disparo_retorna_503_quando_banco_indisponivel(monkeypatch):
    def fake_ingerir(db):
        raise OperationalError("SELECT 1", {}, Exception("conexão recusada"))

    monkeypatch.setattr(ingestao, "ingerir", fake_ingerir)

    r = client.post("/admin/ingerir")
    assert r.status_code == 503
    assert "indisponível" in r.json()["detail"]


def test_disparo_so_aceita_post():
    # GET no endpoint de disparo não é permitido
    r = client.get("/admin/ingerir")
    assert r.status_code == 405
