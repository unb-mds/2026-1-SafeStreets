"""Testes da integração Gemini (app/integrations/gemini.py).

Puros: não tocam rede, não precisam de chave nem do SDK. Usam `generate_fn`
injetada para simular o Gemini. Validam o comportamento de fallback do
ADR-001 (Opção A): qualquer falha -> resumo=None, status="ERRO".
"""
from app.integrations.gemini import GeminiClient, ResumoResult


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
