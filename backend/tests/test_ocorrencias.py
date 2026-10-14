"""Testes dos endpoints GET de ocorrência.

Usa SQLite em memória + override de get_db (sem Postgres/Docker). Os dados são
semeados direto via sessão — **não há POST público**: ocorrência nasce do
pipeline de ingestão, não de requisição de cliente (CONTEXT.md). Cada cenário
cria um LocalPin + uma Ocorrência completos (todos os campos NOT NULL).
"""
from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.integrations.gemini import GeminiClient
from app.main import app
from app.models import LocalPin, Ocorrencia
from app.services import ocorrencias as service

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
            data_ocorrencia=datetime(2026, 6, 20, 14, 30, tzinfo=UTC),
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


# ---- resumo sob demanda (gerado ao abrir a ocorrência, com cache) ----

def test_buscar_gera_resumo_sob_demanda_e_cacheia():
    novo_id = _seed_ocorrencia(titulo="Assalto no Gama")  # nasce PENDENTE
    chamadas = {"n": 0}

    def fake_gemini(texto: str) -> str:
        chamadas["n"] += 1
        return "Resumo gerado sob demanda."

    gemini = GeminiClient(generate_fn=fake_gemini)
    db = TestingSession()
    try:
        # 1ª abertura: PENDENTE -> gera e cacheia (COMPLETO)
        out1 = service.buscar(db, novo_id, gemini=gemini)
        assert out1.resumo == "Resumo gerado sob demanda."
        assert out1.resumo_status == "COMPLETO"
        assert chamadas["n"] == 1

        # 2ª abertura: já COMPLETO -> usa cache, NÃO chama o Gemini de novo
        out2 = service.buscar(db, novo_id, gemini=gemini)
        assert out2.resumo == "Resumo gerado sob demanda."
        assert chamadas["n"] == 1
    finally:
        db.close()


def test_buscar_com_gemini_falho_marca_erro_sem_quebrar():
    novo_id = _seed_ocorrencia(titulo="Furto no Guará")

    def gemini_quebra(texto: str) -> str:
        raise RuntimeError("quota/rate limit")

    gemini = GeminiClient(generate_fn=gemini_quebra)
    db = TestingSession()
    try:
        out = service.buscar(db, novo_id, gemini=gemini)
        assert out is not None                 # ADR-001 A: não quebra a resposta
        assert out.resumo_status == "ERRO"
        assert out.resumo is None
    finally:
        db.close()


# ---- risco calculado no read por contagem na RA (limiares: >=10 médio, >=15 alto) ----

def _gemini_fake() -> GeminiClient:
    # buscar() dispara o resumo sob demanda; injeta um fake p/ não tocar a rede.
    return GeminiClient(generate_fn=lambda texto: "resumo")


def test_risco_baixo_quando_ra_tem_poucas_ocorrencias():
    novo_id = _seed_ocorrencia(titulo="Furto isolado", regiao="RA-096")
    db = TestingSession()
    try:
        out = service.buscar(db, novo_id, gemini=_gemini_fake())
        assert out.risco == "Baixo"   # 1 ocorrência na RA < limiar médio (5)
    finally:
        db.close()


def test_risco_medio_quando_ra_atinge_10_ocorrencias():
    ids = [_seed_ocorrencia(titulo=f"Furto {i}", regiao="RA-097") for i in range(10)]
    db = TestingSession()
    try:
        out = service.buscar(db, ids[0], gemini=_gemini_fake())
        assert out.risco == "Médio"   # 10 ocorrências na RA >= limiar médio (10)
    finally:
        db.close()


def test_risco_alto_quando_ra_atinge_15_ocorrencias():
    ids = [_seed_ocorrencia(titulo=f"Roubo {i}", regiao="RA-098") for i in range(15)]
    db = TestingSession()
    try:
        out = service.buscar(db, ids[0], gemini=_gemini_fake())
        assert out.risco == "Alto"    # 15 ocorrências na RA >= limiar alto (15)
    finally:
        db.close()
