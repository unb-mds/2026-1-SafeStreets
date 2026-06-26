"""Testes do serviço de ingestão (app/services/ingestao.py).

Usa SQLite em memória + integrações injetadas (itens RSS, geocoding e Gemini
falsos) — sem rede, sem chave, sem Postgres. Verifica o pipeline completo
RSS → região → geocode → pin → gemini → persistência.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.models import LocalPin, Ocorrencia
from app.integrations.correio_rss import ItemRSS
from app.integrations.nominatim import Coordenada
from app.integrations.gemini import GeminiClient
from app.services import ingestao


def _db():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine)()


def _item(titulo, descricao="", link="https://x/1", data="2026-06-20 14:30:00"):
    return ItemRSS(titulo=titulo, descricao=descricao, link=link, data_publicacao=data, autor=None)


def _geocode_fixo(local):
    return Coordenada(latitude=-15.8173391, longitude=-48.1045766)


# ---- extrair_regiao (puro) ----

def test_extrair_regiao_reconhece_ra_no_texto():
    assert ingestao.extrair_regiao("Roubo na Ceilândia ontem") == ("Ceilândia", "RA-009")


def test_extrair_regiao_sem_ra_retorna_none():
    assert ingestao.extrair_regiao("Notícia sem região nenhuma") is None


def test_extrair_regiao_ignora_acento():
    # texto sem acento deve casar com o nome acentuado da RA
    assert ingestao.extrair_regiao("roubo na ceilandia") == ("Ceilândia", "RA-009")


# ---- pipeline ----

def test_ingerir_persiste_ocorrencia_completa():
    db = _db()
    gemini = GeminiClient(generate_fn=lambda texto: "Resumo da ocorrência.")
    itens = [_item("Furto em Taguatinga", "Veículo levado na QNL")]

    res = ingestao.ingerir(db, itens=itens, geocodificar=_geocode_fixo, gemini=gemini)

    assert res.processadas == 1
    assert res.persistidas == 1
    o = db.query(Ocorrencia).one()
    assert o.regiao_administrativa == "RA-003"      # Taguatinga
    assert o.locais_pin_id is not None              # FK preenchida
    assert o.resumo_status == "COMPLETO"
    assert o.resumo_gemini == "Resumo da ocorrência."
    # LocalPin foi criado
    assert db.query(LocalPin).count() == 1


def test_ingerir_pula_noticia_sem_regiao():
    db = _db()
    itens = [_item("Notícia genérica sem região")]
    res = ingestao.ingerir(db, itens=itens, geocodificar=_geocode_fixo, gemini=GeminiClient(generate_fn=lambda t: "x"))
    assert res.sem_regiao == 1
    assert res.persistidas == 0
    assert db.query(Ocorrencia).count() == 0


def test_ingerir_gemini_falha_persiste_com_status_erro():
    """ADR-001 Opção A: Gemini falhou -> persiste mesmo assim, resumo ERRO."""
    db = _db()

    def gemini_quebra(texto):
        raise RuntimeError("timeout/quota")

    gemini = GeminiClient(generate_fn=gemini_quebra)
    res = ingestao.ingerir(db, itens=[_item("Roubo na Ceilândia")], geocodificar=_geocode_fixo, gemini=gemini)

    assert res.persistidas == 1
    o = db.query(Ocorrencia).one()
    assert o.resumo_status == "ERRO"
    assert o.resumo_gemini is None


def test_ingerir_reaproveita_pin_para_mesma_regiao():
    db = _db()
    gemini = GeminiClient(generate_fn=lambda texto: "r")
    itens = [_item("Roubo na Ceilândia A"), _item("Furto na Ceilândia B")]

    res = ingestao.ingerir(db, itens=itens, geocodificar=_geocode_fixo, gemini=gemini)

    assert res.persistidas == 2
    assert db.query(Ocorrencia).count() == 2
    # mesma coordenada+região -> um único LocalPin reaproveitado
    assert db.query(LocalPin).count() == 1


def test_ingerir_sem_geocode_pula():
    db = _db()
    res = ingestao.ingerir(
        db,
        itens=[_item("Roubo na Ceilândia")],
        geocodificar=lambda local: None,   # geocoding não encontrou
        gemini=GeminiClient(generate_fn=lambda t: "x"),
    )
    assert res.sem_regiao == 1
    assert db.query(Ocorrencia).count() == 0
