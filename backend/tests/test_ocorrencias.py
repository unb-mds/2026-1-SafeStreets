"""Testes dos endpoints GET de ocorrência.

Usa SQLite em memória + override de get_db (sem Postgres/Docker). Os dados são
semeados direto via sessão — **não há POST público**: ocorrência nasce do
pipeline de ingestão, não de requisição de cliente (CONTEXT.md). Cada cenário
cria um LocalPin + uma Ocorrência completos (todos os campos NOT NULL).
"""
from datetime import datetime, timezone

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.models import LocalPin, Ocorrencia

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


def _seed_ocorrencia(titulo: str = "Furto na 102 Sul", regiao: str = "RA-001") -> int:
    """Insere um LocalPin + Ocorrência completos e devolve o id da ocorrência."""
    db = TestingSession()
    try:
        pin = LocalPin(latitude=-15.79, longitude=-47.88, regiao_administrativa=regiao)
        db.add(pin)
        db.flush()  # garante pin.id antes de referenciar na FK
        ocorrencia = Ocorrencia(
            locais_pin_id=pin.id,
            titulo_noticia=titulo,
            latitude=-15.79,
            longitude=-47.88,
            regiao_administrativa=regiao,
            data_ocorrencia=datetime(2026, 6, 20, 14, 30, tzinfo=timezone.utc),
        )
        db.add(ocorrencia)
        db.commit()
        db.refresh(ocorrencia)
        return ocorrencia.id
    finally:
        db.close()


def test_listar_retorna_ocorrencias_semeadas():
    novo_id = _seed_ocorrencia(titulo="Roubo em Taguatinga")
    r = client.get("/ocorrencias")
    assert r.status_code == 200
    assert r.json()["success"] is True
    assert any(o["id"] == novo_id for o in r.json()["data"])


def test_detalhar_retorna_ocorrencia():
    novo_id = _seed_ocorrencia(titulo="Furto na 102 Sul")
    r = client.get(f"/ocorrencias/{novo_id}")
    assert r.status_code == 200
    assert r.json()["data"]["titulo"] == "Furto na 102 Sul"


def test_detalhar_inexistente_retorna_404():
    r = client.get("/ocorrencias/999999")
    assert r.status_code == 404
