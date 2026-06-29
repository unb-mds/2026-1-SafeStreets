"""Testes do serviço de ingestão (app/services/ingestao.py).

Usa SQLite em memória + integrações injetadas (itens RSS, geocoding e Gemini
falsos) — sem rede, sem chave, sem Postgres. Verifica o filtro de relevância
(Camadas 1+2) e o pipeline completo RSS → região → geocode → pin → gemini →
persistência.

Os testes de pipeline passam `filtro=_sem_filtro` para isolar a lógica de
persistência do filtro de relevância (testado à parte).
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


def _item(titulo, descricao="", link="https://x/1", data="2026-06-20 14:30:00", fonte="correio"):
    return ItemRSS(titulo=titulo, descricao=descricao, link=link,
                   data_publicacao=data, autor=None, fonte=fonte)


def _geocode_fixo(local):
    return Coordenada(latitude=-15.8173391, longitude=-48.1045766)


def _sem_filtro(item):
    """Bypass do filtro de relevância — usado nos testes de pipeline."""
    return True


# ---- extrair_regiao (puro) ----

def test_extrair_regiao_reconhece_ra_no_texto():
    assert ingestao.extrair_regiao("Roubo na Ceilândia ontem") == ("Ceilândia", "RA-009")


def test_extrair_regiao_sem_ra_retorna_none():
    assert ingestao.extrair_regiao("Notícia sem região nenhuma") is None


def test_extrair_regiao_ignora_acento():
    # texto sem acento deve casar com o nome acentuado da RA
    assert ingestao.extrair_regiao("roubo na ceilandia") == ("Ceilândia", "RA-009")


# ---- geocodificar_regiao (tabela estática + fallback) ----

def test_geocodificar_regiao_usa_tabela_estatica_sem_rede():
    # RA conhecida -> coordenada do centroide pré-computado, sem tocar a rede
    coord = ingestao.geocodificar_regiao("Ceilândia")
    assert coord is not None
    assert (coord.latitude, coord.longitude) == ingestao.COORDENADAS_RA["RA-009"]


def test_geocodificar_regiao_nome_fora_da_tabela_cai_no_fallback(monkeypatch):
    # nome não mapeado -> cai no Nominatim (aqui mockado, sem rede)
    chamado = {}

    def fake_nominatim(nome):
        chamado["nome"] = nome
        return None

    monkeypatch.setattr(ingestao.nominatim, "geocodificar", fake_nominatim)
    assert ingestao.geocodificar_regiao("Lugar Inexistente") is None
    assert chamado["nome"] == "Lugar Inexistente"


# ---- filtro de relevância (Camadas 1+2, puro) ----

def test_eh_cidades_df_pela_url():
    assert ingestao.eh_cidades_df(_item("x", link="https://cb.com/cidades-df/1.html")) is True
    assert ingestao.eh_cidades_df(_item("x", link="https://cb.com/politica/1.html")) is False


def test_eh_seguranca_por_palavra_chave():
    assert ingestao.eh_seguranca(_item("Roubo em série")) is True
    assert ingestao.eh_seguranca(_item("Festival de música")) is False


def test_eh_saude_descarta_escorpiao_mas_inclui_upa():
    # escorpião continua sendo saúde (filtrado)
    assert ingestao.eh_saude(_item("Menina picada por escorpião é internada")) is True
    # UPA agora NÃO é saúde — morte em UPA é de interesse de segurança/negligência
    assert ingestao.eh_saude(_item("Homem morre na antessala de UPA no DF")) is False
    # crime de rua não é marcado como saúde
    assert ingestao.eh_saude(_item("Homem é esfaqueado em ponto de ônibus")) is False


def test_eh_relevante_descarta_saude_mesmo_com_termo_seguranca():
    # "escorpião" é saúde -> descarta mesmo casando termo de segurança ("polícia")
    saude = _item("Polícia apura morte de menina picada por escorpião no DF",
                  link="https://g1.globo.com/df/x.ghtml", fonte="g1-df")
    assert ingestao.eh_seguranca(saude) is True
    assert ingestao.eh_relevante(saude) is False


def test_eh_relevante_exige_df_e_seguranca():
    df_seg = _item("Roubo", link="https://cb.com/cidades-df/1.html")
    df_sem_seg = _item("Obras na via", link="https://cb.com/cidades-df/2.html")
    seg_sem_df = _item("Roubo", link="https://cb.com/politica/3.html")
    assert ingestao.eh_relevante(df_seg) is True
    assert ingestao.eh_relevante(df_sem_seg) is False
    assert ingestao.eh_relevante(seg_sem_df) is False


def test_eh_relevante_g1_df_dispensa_editoria():
    # G1 DF já é feed exclusivo do DF: basta o termo de segurança, mesmo sem
    # "/cidades-df/" na URL (que só existe no Correio).
    g1_seg = _item("Roubo na Ceilândia", link="https://g1.globo.com/df/x.ghtml", fonte="g1-df")
    g1_sem_seg = _item("Festival cultural em Brasília", link="https://g1.globo.com/df/y.ghtml", fonte="g1-df")
    assert ingestao.eh_relevante(g1_seg) is True
    assert ingestao.eh_relevante(g1_sem_seg) is False


def test_ingerir_filtra_nao_relevantes():
    db = _db()
    itens = [
        _item("Roubo em Taguatinga", "assalto a pedestre", link="https://cb.com/cidades-df/1.html"),  # relevante
        _item("Obras na Ceilândia", "nova via inaugurada", link="https://cb.com/cidades-df/2.html"),  # df, sem segurança
        _item("Roubo em Taguatinga", "assalto", link="https://cb.com/politica/3.html"),               # segurança, não df
    ]
    res = ingestao.ingerir(db, itens=itens, geocodificar=_geocode_fixo,
                           gemini=GeminiClient(generate_fn=lambda t: "r"))  # filtro padrão (eh_relevante)
    assert res.processadas == 3
    assert res.filtradas == 2
    assert res.persistidas == 1
    assert db.query(Ocorrencia).count() == 1


# ---- pipeline (filtro bypassado para isolar a persistência) ----

def test_ingerir_persiste_ocorrencia_completa():
    db = _db()
    gemini = GeminiClient(generate_fn=lambda texto: "Resumo da ocorrência.")
    itens = [_item("Furto em Taguatinga", "Veículo levado na QNL")]

    res = ingestao.ingerir(db, itens=itens, geocodificar=_geocode_fixo, gemini=gemini, filtro=_sem_filtro)

    assert res.processadas == 1
    assert res.persistidas == 1
    o = db.query(Ocorrencia).one()
    assert o.regiao_administrativa == "RA-003"      # Taguatinga
    assert o.locais_pin_id is not None              # FK preenchida
    assert o.resumo_status == "COMPLETO"
    assert o.resumo_gemini == "Resumo da ocorrência."
    assert db.query(LocalPin).count() == 1


def test_ingerir_pula_noticia_sem_regiao():
    db = _db()
    itens = [_item("Notícia genérica sem região")]
    res = ingestao.ingerir(db, itens=itens, geocodificar=_geocode_fixo,
                           gemini=GeminiClient(generate_fn=lambda t: "x"), filtro=_sem_filtro)
    assert res.sem_regiao == 1
    assert res.persistidas == 0
    assert db.query(Ocorrencia).count() == 0


def test_ingerir_gemini_falha_persiste_com_status_erro():
    """ADR-001 Opção A: Gemini falhou -> persiste mesmo assim, resumo ERRO."""
    db = _db()

    def gemini_quebra(texto):
        raise RuntimeError("timeout/quota")

    gemini = GeminiClient(generate_fn=gemini_quebra)
    res = ingestao.ingerir(db, itens=[_item("Roubo na Ceilândia")], geocodificar=_geocode_fixo,
                           gemini=gemini, filtro=_sem_filtro)

    assert res.persistidas == 1
    o = db.query(Ocorrencia).one()
    assert o.resumo_status == "ERRO"
    assert o.resumo_gemini is None


def test_ingerir_reaproveita_pin_para_mesma_regiao():
    db = _db()
    gemini = GeminiClient(generate_fn=lambda texto: "r")
    itens = [
        _item("Roubo na Ceilândia A", link="https://x/1"),
        _item("Furto na Ceilândia B", link="https://x/2"),
    ]

    res = ingestao.ingerir(db, itens=itens, geocodificar=_geocode_fixo, gemini=gemini, filtro=_sem_filtro)

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
        filtro=_sem_filtro,
    )
    assert res.sem_regiao == 1
    assert db.query(Ocorrencia).count() == 0


def test_ingerir_evita_duplicacao_de_noticias():
    """Valida que notícias com a mesma URL não são duplicadas no banco."""
    db = _db()
    gemini = GeminiClient(generate_fn=lambda t: "r")
    
    # 1. Ingerir o item pela primeira vez (deve persistir)
    item = _item("Roubo no Gama", link="https://x/gama")
    res1 = ingestao.ingerir(db, itens=[item], geocodificar=_geocode_fixo, gemini=gemini, filtro=_sem_filtro)
    assert res1.persistidas == 1
    assert res1.duplicadas == 0
    assert db.query(Ocorrencia).count() == 1

    # 2. Ingerir o mesmo item de novo (deve ser considerado duplicado e pulado)
    res2 = ingestao.ingerir(db, itens=[item], geocodificar=_geocode_fixo, gemini=gemini, filtro=_sem_filtro)
    assert res2.persistidas == 0
    assert res2.duplicadas == 1
    assert db.query(Ocorrencia).count() == 1

