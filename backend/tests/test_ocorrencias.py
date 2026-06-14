"""Testes dos endpoints de ocorrência.

Usa SQLite em memória + override da dependência get_db, então rodam sem
Postgres/Docker. O TestClient exercita a cadeia route -> service ->
repository de ponta a ponta.
"""
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.models import Ocorrencia  # noqa: F401 — registra a tabela em Base.metadata

# Banco SQLite em memória, compartilhado entre as requisições do teste.
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
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


def test_criar_listar_e_detalhar():
    r = client.post(
        "/ocorrencias",
        json={"titulo_noticia": "Furto na 102 Sul", "latitude": -15.79, "longitude": -47.88},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["success"] is True
    novo_id = body["data"]["id"]
    assert body["data"]["titulo"] == "Furto na 102 Sul"

    r = client.get("/ocorrencias")
    assert r.status_code == 200
    assert r.json()["success"] is True
    assert any(o["id"] == novo_id for o in r.json()["data"])

    r = client.get(f"/ocorrencias/{novo_id}")
    assert r.status_code == 200
    assert r.json()["data"]["titulo"] == "Furto na 102 Sul"


def test_detalhar_inexistente_retorna_404():
    r = client.get("/ocorrencias/999999")
    assert r.status_code == 404


def test_criar_com_latitude_invalida_retorna_422():
    r = client.post(
        "/ocorrencias",
        json={"titulo_noticia": "x", "latitude": 999, "longitude": 0},
    )
    assert r.status_code == 422
