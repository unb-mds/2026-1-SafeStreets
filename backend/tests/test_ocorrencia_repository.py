"""
Testes para OcorrenciaRepository.

Usa banco SQLite em memória para evitar dependência do PostgreSQL nos testes.
"""
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.local_pin import LocalPin
from app.models.ocorrencia import Ocorrencia
from app.models.historico_consulta import HistoricoConsulta  # noqa: F401
from app.repositories.ocorrencia_repository import OcorrenciaRepository


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def db_session():
    """Cria um banco SQLite em memória para cada teste."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture
def pin_fixture(db_session):
    """Cria um LocalPin de suporte para os testes."""
    pin = LocalPin(
        latitude=-15.7975,
        longitude=-48.0473,
        regiao_administrativa="RA-026",
        nome_regiao="Taguatinga",
    )
    db_session.add(pin)
    db_session.commit()
    db_session.refresh(pin)
    return pin


def _nova_ocorrencia(pin_id: int, regiao: str = "RA-026", status: str = "PENDENTE", dias_atras: int = 0) -> Ocorrencia:
    return Ocorrencia(
        locais_pin_id=pin_id,
        titulo_noticia="Roubo de veículo",
        latitude=-15.7975,
        longitude=-48.0473,
        regiao_administrativa=regiao,
        resumo_status=status,
        risco_nivel="baixo",
        data_ocorrencia=datetime.utcnow() - timedelta(days=dias_atras),
    )


# ── Testes ───────────────────────────────────────────────────────────────────

class TestCriar:
    def test_criar_retorna_ocorrencia_com_id(self, db_session, pin_fixture):
        repo = OcorrenciaRepository(db_session)
        ocorrencia = _nova_ocorrencia(pin_fixture.id)
        result = repo.criar(ocorrencia)

        assert result.id is not None
        assert result.titulo_noticia == "Roubo de veículo"

    def test_criar_persiste_no_banco(self, db_session, pin_fixture):
        repo = OcorrenciaRepository(db_session)
        repo.criar(_nova_ocorrencia(pin_fixture.id))

        total = db_session.query(Ocorrencia).count()
        assert total == 1


class TestBuscarPorId:
    def test_retorna_ocorrencia_existente(self, db_session, pin_fixture):
        repo = OcorrenciaRepository(db_session)
        criada = repo.criar(_nova_ocorrencia(pin_fixture.id))

        resultado = repo.buscar_por_id(criada.id)
        assert resultado is not None
        assert resultado.id == criada.id

    def test_retorna_none_para_id_inexistente(self, db_session, pin_fixture):
        repo = OcorrenciaRepository(db_session)
        assert repo.buscar_por_id(999) is None


class TestBuscarPorRegiaoEPeriodo:
    def test_retorna_ocorrencias_da_regiao_no_periodo(self, db_session, pin_fixture):
        repo = OcorrenciaRepository(db_session)
        repo.criar(_nova_ocorrencia(pin_fixture.id, regiao="RA-026", dias_atras=1))
        repo.criar(_nova_ocorrencia(pin_fixture.id, regiao="RA-026", dias_atras=2))

        resultado = repo.buscar_por_regiao_e_periodo(
            "RA-026",
            datetime.utcnow() - timedelta(days=7),
            datetime.utcnow(),
        )
        assert len(resultado) == 2

    def test_nao_retorna_outra_regiao(self, db_session, pin_fixture):
        repo = OcorrenciaRepository(db_session)
        repo.criar(_nova_ocorrencia(pin_fixture.id, regiao="RA-010"))

        resultado = repo.buscar_por_regiao_e_periodo(
            "RA-026",
            datetime.utcnow() - timedelta(days=7),
            datetime.utcnow(),
        )
        assert len(resultado) == 0

    def test_respeita_limit_e_offset(self, db_session, pin_fixture):
        repo = OcorrenciaRepository(db_session)
        for i in range(5):
            repo.criar(_nova_ocorrencia(pin_fixture.id, dias_atras=i))

        resultado = repo.buscar_por_regiao_e_periodo(
            "RA-026",
            datetime.utcnow() - timedelta(days=10),
            datetime.utcnow(),
            limit=2,
            offset=0,
        )
        assert len(resultado) == 2


class TestContarPorRegiao:
    def test_conta_corretamente(self, db_session, pin_fixture):
        repo = OcorrenciaRepository(db_session)
        repo.criar(_nova_ocorrencia(pin_fixture.id, regiao="RA-026"))
        repo.criar(_nova_ocorrencia(pin_fixture.id, regiao="RA-026"))
        repo.criar(_nova_ocorrencia(pin_fixture.id, regiao="RA-010"))

        assert repo.contar_por_regiao("RA-026") == 2
        assert repo.contar_por_regiao("RA-010") == 1
        assert repo.contar_por_regiao("RA-999") == 0


class TestBuscarPendentesResumo:
    def test_retorna_apenas_pendentes(self, db_session, pin_fixture):
        repo = OcorrenciaRepository(db_session)
        repo.criar(_nova_ocorrencia(pin_fixture.id, status="PENDENTE"))
        repo.criar(_nova_ocorrencia(pin_fixture.id, status="COMPLETO"))

        pendentes = repo.buscar_pendentes_resumo()
        assert len(pendentes) == 1
        assert pendentes[0].resumo_status == "PENDENTE"


class TestAtualizarResumo:
    def test_atualiza_campos_corretamente(self, db_session, pin_fixture):
        repo = OcorrenciaRepository(db_session)
        ocorrencia = repo.criar(_nova_ocorrencia(pin_fixture.id, status="PENDENTE"))

        repo.atualizar_resumo(ocorrencia.id, "Resumo gerado com sucesso.", "COMPLETO")

        atualizada = repo.buscar_por_id(ocorrencia.id)
        assert atualizada.resumo_gemini == "Resumo gerado com sucesso."
        assert atualizada.resumo_status == "COMPLETO"
