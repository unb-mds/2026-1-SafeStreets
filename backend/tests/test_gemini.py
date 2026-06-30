"""Testes da integração Gemini (app/integrations/gemini.py).

Puros: não tocam rede, não precisam de chave nem do SDK. Usam `generate_fn`
injetada para simular o Gemini. Validam o comportamento de fallback do
ADR-001 (Opção A): qualquer falha -> resumo=None, status="ERRO".

Os testes de `_gerar_real` (retry para ServerError 5xx transitório) usam
`google.genai` mockado — `importorskip` evita quebrar caso o SDK não esteja
instalado no ambiente.
"""
from unittest.mock import MagicMock, patch

import pytest

from app.integrations.gemini import GeminiClient, ResumoResult

genai_errors = pytest.importorskip("google.genai.errors")


def test_resumo_completo_com_fn_injetada():
    client = GeminiClient(generate_fn=lambda texto: "Veículo roubado em Taguatinga.")
    r = client.resumir("Notícia longa sobre roubo de veículo na QNL...")
    assert isinstance(r, ResumoResult)
    assert r.status == "COMPLETO"
    assert r.resumo == "Veículo roubado em Taguatinga."


def test_texto_vazio_retorna_erro():
    client = GeminiClient(generate_fn=lambda texto: "qualquer")
    assert client.resumir("").status == "ERRO"
    assert client.resumir("   ").resumo is None


def test_sem_chave_e_sem_fn_retorna_erro():
    # Sem GEMINI_API_KEY e sem generate_fn não há como chamar o Gemini.
    client = GeminiClient(api_key=None)
    r = client.resumir("Notícia qualquer")
    assert r.status == "ERRO"
    assert r.resumo is None


def test_excecao_do_gemini_vira_erro():
    def boom(texto):
        raise RuntimeError("timeout / quota / 5xx")

    client = GeminiClient(generate_fn=boom)
    r = client.resumir("Notícia qualquer")
    assert r.status == "ERRO"
    assert r.resumo is None


def test_resposta_vazia_do_gemini_vira_erro():
    client = GeminiClient(generate_fn=lambda texto: "   ")
    r = client.resumir("Notícia qualquer")
    assert r.status == "ERRO"
    assert r.resumo is None


def test_resumo_e_trimado():
    client = GeminiClient(generate_fn=lambda texto: "  Resumo com espacos.  ")
    assert client.resumir("x").resumo == "Resumo com espacos."


def _server_error() -> "genai_errors.ServerError":
    return genai_errors.ServerError(503, {"error": {"message": "high demand"}})


def test_gerar_real_retenta_servererror_transitorio_ate_suceder():
    resposta_ok = MagicMock(text="Resumo gerado após retry.")
    mock_models = MagicMock()
    mock_models.generate_content.side_effect = [_server_error(), _server_error(), resposta_ok]

    with patch("app.integrations.gemini.time.sleep") as mock_sleep, \
         patch("google.genai.Client") as MockClient:
        MockClient.return_value.models = mock_models
        client = GeminiClient(api_key="fake-key")
        texto = client._gerar_real("Notícia de teste")

    assert texto == "Resumo gerado após retry."
    assert mock_models.generate_content.call_count == 3
    assert mock_sleep.call_count == 2


def test_gerar_real_esgota_retries_e_repassa_o_erro():
    mock_models = MagicMock()
    mock_models.generate_content.side_effect = [_server_error() for _ in range(4)]

    with patch("app.integrations.gemini.time.sleep"), \
         patch("google.genai.Client") as MockClient:
        MockClient.return_value.models = mock_models
        client = GeminiClient(api_key="fake-key")
        with pytest.raises(genai_errors.ServerError):
            client._gerar_real("Notícia de teste")

    # 1 tentativa inicial + 3 retries (ADR-001: backoff 1s -> 2s -> 4s)
    assert mock_models.generate_content.call_count == 4


def _quota_error() -> "genai_errors.ClientError":
    return genai_errors.ClientError(429, {"error": {"message": "quota exceeded"}})


def test_gerar_real_retenta_429_rate_limit_ate_suceder():
    resposta_ok = MagicMock(text="Resumo gerado após retry de quota.")
    mock_models = MagicMock()
    mock_models.generate_content.side_effect = [_quota_error(), resposta_ok]

    with patch("app.integrations.gemini.time.sleep") as mock_sleep, \
         patch("google.genai.Client") as MockClient:
        MockClient.return_value.models = mock_models
        client = GeminiClient(api_key="fake-key")
        texto = client._gerar_real("Notícia de teste")

    assert texto == "Resumo gerado após retry de quota."
    assert mock_models.generate_content.call_count == 2
    assert mock_sleep.call_count == 1


def test_gerar_real_nao_retenta_clienterror_permanente():
    erro_permanente = genai_errors.ClientError(400, {"error": {"message": "invalid input"}})
    mock_models = MagicMock()
    mock_models.generate_content.side_effect = erro_permanente

    with patch("app.integrations.gemini.time.sleep") as mock_sleep, \
         patch("google.genai.Client") as MockClient:
        MockClient.return_value.models = mock_models
        client = GeminiClient(api_key="fake-key")
        with pytest.raises(genai_errors.ClientError):
            client._gerar_real("Notícia de teste")

    assert mock_models.generate_content.call_count == 1
    mock_sleep.assert_not_called()


def test_resumir_apos_esgotar_retries_vira_status_erro():
    mock_models = MagicMock()
    mock_models.generate_content.side_effect = [_server_error() for _ in range(4)]

    with patch("app.integrations.gemini.time.sleep"), \
         patch("google.genai.Client") as MockClient:
        MockClient.return_value.models = mock_models
        r = GeminiClient(api_key="fake-key").resumir("Notícia qualquer")

    assert r.status == "ERRO"
    assert r.resumo is None
