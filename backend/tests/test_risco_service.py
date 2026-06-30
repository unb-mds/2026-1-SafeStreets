"""
Testes para risco_service.calcular_risco.

Usa mock de OcorrenciaRepository para testar os limiares sem banco.
"""
from unittest.mock import MagicMock, patch

import pytest

from app.services.risco_service import LIMIARES_RISCO, calcular_risco


@pytest.fixture
def db_mock():
    return MagicMock()


def _mock_contar(total: int):
    """Cria um mock de OcorrenciaRepository com contar_por_regiao retornando `total`."""
    repo_mock = MagicMock()
    repo_mock.contar_por_regiao.return_value = total
    return repo_mock


class TestCalcularRisco:
    def test_retorna_baixo_para_menos_de_20(self, db_mock):
        with patch("app.services.risco_service.OcorrenciaRepository", return_value=_mock_contar(0)):
            assert calcular_risco("RA-026", db_mock) == "baixo"

        with patch("app.services.risco_service.OcorrenciaRepository", return_value=_mock_contar(19)):
            assert calcular_risco("RA-026", db_mock) == "baixo"

    def test_retorna_medio_para_20_a_49(self, db_mock):
        with patch("app.services.risco_service.OcorrenciaRepository", return_value=_mock_contar(20)):
            assert calcular_risco("RA-026", db_mock) == "medio"

        with patch("app.services.risco_service.OcorrenciaRepository", return_value=_mock_contar(49)):
            assert calcular_risco("RA-026", db_mock) == "medio"

    def test_retorna_alto_para_50_ou_mais(self, db_mock):
        with patch("app.services.risco_service.OcorrenciaRepository", return_value=_mock_contar(50)):
            assert calcular_risco("RA-026", db_mock) == "alto"

        with patch("app.services.risco_service.OcorrenciaRepository", return_value=_mock_contar(200)):
            assert calcular_risco("RA-026", db_mock) == "alto"

    def test_limiares_corretos(self):
        """Garante que os valores dos limiares não foram alterados acidentalmente."""
        assert LIMIARES_RISCO["alto"]  == 50
        assert LIMIARES_RISCO["medio"] == 20
