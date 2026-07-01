"""Serviço de ingestão — conecta as integrações ao banco (RF12).

Pipeline por notícia:
    RSS (correio_rss) → extrair região do texto → geocodificar (nominatim)
    → buscar_ou_criar LocalPin → persistir Ocorrencia com `resumo_status="PENDENTE"`.

O **resumo por IA NÃO é gerado aqui**: fica *sob demanda* (gerado ao abrir a
ocorrência em `GET /ocorrencias/{id}` e cacheado no banco). Isso evita disparar
dezenas de chamadas ao Gemini em rajada no lote (que estoura o rate limit do
tier gratuito) — a chamada acontece só quando o usuário realmente vê a notícia.

`itens`, `geocodificar` e `filtro` são injetáveis para teste sem rede. NÃO há
classificação de tipo de crime (fora do escopo, RF12).
"""
import re
import unicodedata
from dataclasses import dataclass
from datetime import UTC, datetime

from app.integrations import correio_rss, nominatim
from app.models.ocorrencia import Ocorrencia
from app.repositories.local_pin_repository import LocalPinRepository
from app.repositories.ocorrencia_repository import OcorrenciaRepository

# As 35 Regiões Administrativas do DF (nome -> código RA-XXX). Inclui aliases
# (ex.: "Brasília"->Plano Piloto, "Estrutural"->SCIA) para casar como a notícia
# escreve. É a tabela de domínio do time.
REGIOES_DF: dict[str, str] = {
    "Plano Piloto": "RA-001",
    "Brasília": "RA-001",
    "Gama": "RA-002",
    "Taguatinga": "RA-003",
    "Brazlândia": "RA-004",
    "Sobradinho": "RA-005",
    "Planaltina": "RA-006",
    "Paranoá": "RA-007",
    "Núcleo Bandeirante": "RA-008",
    "Ceilândia": "RA-009",
    "Guará": "RA-010",
    "Cruzeiro": "RA-011",
    "Samambaia": "RA-012",
    "Santa Maria": "RA-013",
    "São Sebastião": "RA-014",
    "Recanto das Emas": "RA-015",
    "Lago Sul": "RA-016",
    "Riacho Fundo": "RA-017",
    "Lago Norte": "RA-018",
    "Candangolândia": "RA-019",
    "Águas Claras": "RA-020",
    "Riacho Fundo II": "RA-021",
    "Sudoeste": "RA-022",
    "Octogonal": "RA-022",
    "Varjão": "RA-023",
    "Park Way": "RA-024",
    "SCIA": "RA-025",
    "Estrutural": "RA-025",
    "Sobradinho II": "RA-026",
    "Jardim Botânico": "RA-027",
    "Itapoã": "RA-028",
    "SIA": "RA-029",
    "Vicente Pires": "RA-030",
    "Fercal": "RA-031",
    "Sol Nascente": "RA-032",
    "Pôr do Sol": "RA-032",
    "Arniqueira": "RA-033",
    "Arapoanga": "RA-034",
    "Água Quente": "RA-035",
}

# Nomes ordenados do mais longo para o mais curto: garante que "Riacho Fundo II"
# seja tentado antes de "Riacho Fundo", e "Sobradinho II" antes de "Sobradinho".
_NOMES_ORDENADOS = sorted(REGIOES_DF, key=len, reverse=True)

# Centroide aproximado (lat, lon) de cada RA. Como o conjunto de RAs é fixo,
# guardamos as coordenadas aqui em vez de consultar o Nominatim a cada notícia
# no disparo — o geocode vira um lookup instantâneo (sem rede, sem rate-limit).
# O Nominatim fica só como fallback para um nome que não esteja nesta tabela.
COORDENADAS_RA: dict[str, tuple[float, float]] = {
    "RA-001": (-15.7939, -47.8828),  # Plano Piloto / Brasília
    "RA-002": (-16.0149, -48.0640),  # Gama
    "RA-003": (-15.8311, -48.0552),  # Taguatinga
    "RA-004": (-15.6794, -48.2010),  # Brazlândia
    "RA-005": (-15.6535, -47.7896),  # Sobradinho
    "RA-006": (-15.6173, -47.6478),  # Planaltina
    "RA-007": (-15.7625, -47.7779),  # Paranoá
    "RA-008": (-15.8697, -47.9706),  # Núcleo Bandeirante
    "RA-009": (-15.8159, -48.1102),  # Ceilândia
    "RA-010": (-15.8197, -47.9817),  # Guará
    "RA-011": (-15.7918, -47.9326),  # Cruzeiro
    "RA-012": (-15.8767, -48.0939),  # Samambaia
    "RA-013": (-16.0089, -48.0153),  # Santa Maria
    "RA-014": (-15.9050, -47.7790),  # São Sebastião
    "RA-015": (-15.9026, -48.0658),  # Recanto das Emas
    "RA-016": (-15.8419, -47.8700),  # Lago Sul
    "RA-017": (-15.8869, -48.0094),  # Riacho Fundo
    "RA-018": (-15.7375, -47.8336),  # Lago Norte
    "RA-019": (-15.8531, -47.9543),  # Candangolândia
    "RA-020": (-15.8344, -48.0260),  # Águas Claras
    "RA-021": (-15.9056, -48.0419),  # Riacho Fundo II
    "RA-022": (-15.7951, -47.9249),  # Sudoeste / Octogonal
    "RA-023": (-15.7113, -47.8773),  # Varjão
    "RA-024": (-15.8819, -47.9714),  # Park Way
    "RA-025": (-15.7800, -47.9969),  # SCIA / Estrutural
    "RA-026": (-15.6519, -47.8305),  # Sobradinho II
    "RA-027": (-15.8731, -47.8033),  # Jardim Botânico
    "RA-028": (-15.7472, -47.7669),  # Itapoã
    "RA-029": (-15.8033, -47.9558),  # SIA
    "RA-030": (-15.8030, -48.0290),  # Vicente Pires
    "RA-031": (-15.5800, -47.8700),  # Fercal
    "RA-032": (-15.8089, -48.1478),  # Sol Nascente / Pôr do Sol
    "RA-033": (-15.8553, -48.0339),  # Arniqueira
    "RA-034": (-15.6000, -47.6300),  # Arapoanga
    "RA-035": (-15.9300, -48.1200),  # Água Quente
}


def _normalizar(s: str | None) -> str:
    """Minúsculas + remove acentos — o matcher de região não pode depender de
    o texto da notícia vir acentuado ('Ceilandia' deve casar com 'Ceilândia')."""
    decomposto = unicodedata.normalize("NFKD", s or "")
    sem_acento = "".join(c for c in decomposto if not unicodedata.combining(c))
    return sem_acento.lower()


# Camada 2: termos que indicam notícia de segurança urbana — crime E também
# incidentes não-criminais (defesa civil/emergência), para encher o mapa.
TERMOS_SEGURANCA: set[str] = {
    # crime / violência
    "roubo", "furto", "assalto", "homicídio", "assassinato", "latrocínio",
    "tráfico", "drogas", "crime", "polícia", "tiroteio", "estupro",
    "violência", "preso", "apreensão", "arma", "morto", "baleado",
    # incidentes urbanos NÃO-criminais (defesa civil/emergência):
    # acidentes de trânsito
    "acidente", "colisão", "capotamento", "capotou", "engavetamento",
    "tombou", "batida", "atropelado", "atropelada", "atropelamento",
    # fogo / explosão
    "incêndio", "incendiou", "chamas", "explosão", "explodiu", "queimada",
    # resgate / desastre / defesa civil
    "resgate", "resgatado", "soterrado", "desabamento", "desabou",
    "afogamento", "afogado", "afogou", "alagamento", "enchente",
    "deslizamento", "bombeiros",
}


# Termos de SAÚDE pública — notícia de saúde que vaza por casar "morto/morte"
# (ex.: criança picada por escorpião, surto de dengue). Não é segurança urbana;
# descarta. Lista enxuta e claramente médica para não derrubar crime real.
# Ficam de FORA de propósito: "hospital"/"internado" (vítima de tiro vai pro
# hospital) e "UPA" (morte por falta de atendimento em UPA é de interesse de
# segurança/negligência — fica no mapa). Checado só no TÍTULO — a descrição do
# G1 traz links relacionados que poluiriam o sinal.
TERMOS_SAUDE: set[str] = {
    "escorpião", "dengue", "covid", "coronavírus", "vírus", "vacina",
    "vacinação", "surto", "epidemia", "sarampo", "h1n1", "leito de uti",
    "vigilância sanitária",
}


# Termos de POLÍTICA / institucional — notícia da arena político-judicial
# (cortes, autoridades, presos VIP, escândalo do BRB, política local do DF) que
# vaza por casar "preso/arma/crime", mas não é ocorrência de segurança urbana
# mapeável. Termos de alta precisão (nomes próprios / siglas) para não derrubar
# crime de rua. Checado só no TÍTULO, com fronteira de palavra.
TERMOS_POLITICA: set[str] = {
    # cortes e autoridades / saga da arma de Bolsonaro
    "bolsonaro", "pgr", "stf", "tcu", "fux", "delação",
    # presos VIP do escândalo do BRB. NÃO incluir "descontos irregulares":
    # fraude é crime e deve passar; aqui só sai a arena político-judicial.
    "papudinha", "vorcaro",
    # política / governo local do DF
    "celina leão", "câmara legislativa", "nota legal",
}


# Termos de ESPORTE / CULTURA / entretenimento — agenda esportiva e cultural,
# fora do escopo de segurança urbana. Alta precisão para não casar crime
# (ex.: não usar "jogo" -> jogo do bicho, nem "estádio" -> tiroteio em estádio).
# Checado só no TÍTULO, com fronteira de palavra.
TERMOS_ESPORTE_CULTURA: set[str] = {
    # esporte
    "copa do mundo", "futebol", "campeonato", "brasileirão", "olimpíadas",
    # cultura / entretenimento
    "festival", "show", "turnê", "atrações", "cantor", "cantora",
    "espetáculo", "concerto", "exposição",
}


def eh_cidades_df(item) -> bool:
    """Camada 1 — editoria pela URL. O link do Correio carrega a editoria
    ('/cidades-df/...'); é o sinal mais confiável de notícia do DF, mais que
    procurar palavra no texto."""
    return "/cidades-df/" in (item.link or "")


def eh_seguranca(item) -> bool:
    """Camada 2 — termo de segurança pública no título/descrição."""
    texto = _normalizar(f"{item.titulo} {item.descricao}")
    return any(_normalizar(termo) in texto for termo in TERMOS_SEGURANCA)


def _casa_no_titulo(item, termos: set[str]) -> bool:
    """True se algum termo casa como palavra inteira no título (sem acento).
    Fronteira de palavra (\\b) evita nome curto casar dentro de outra palavra
    (ex.: 'upa' não pode casar em 'ocupada')."""
    titulo = _normalizar(item.titulo)
    return any(
        re.search(r"\b" + re.escape(_normalizar(termo)) + r"\b", titulo)
        for termo in termos
    )


def eh_saude(item) -> bool:
    """Termo de saúde pública no TÍTULO — fora do escopo de segurança urbana."""
    return _casa_no_titulo(item, TERMOS_SAUDE)


def eh_politica(item) -> bool:
    """Termo político-institucional no TÍTULO — fora do escopo de segurança urbana."""
    return _casa_no_titulo(item, TERMOS_POLITICA)


def eh_esporte_cultura(item) -> bool:
    """Termo de esporte/cultura no TÍTULO — fora do escopo de segurança urbana."""
    return _casa_no_titulo(item, TERMOS_ESPORTE_CULTURA)


def eh_relevante(item) -> bool:
    """Filtro padrão da ingestão, por origem do item:

    - Descarta notícia de saúde, política/institucional e esporte/cultura,
      mesmo casando termo de segurança. Fraude (crime) continua passando.
    - Correio `/feed/` é o feed geral (Brasil) -> exige editoria cidades-df
      (URL) E termo de segurança.
    - G1 DF (e demais fontes DF-only) já são exclusivas do Distrito Federal
      -> basta o termo de segurança; não há editoria na URL para checar.
    """
    if not eh_seguranca(item):
        return False
    if eh_saude(item) or eh_politica(item) or eh_esporte_cultura(item):
        return False
    if getattr(item, "fonte", "correio") == "correio":
        return eh_cidades_df(item)
    return True


@dataclass
class ResultadoIngestao:
    processadas: int = 0
    persistidas: int = 0
    filtradas: int = 0      # descartadas pelo filtro de relevância (não é DF/segurança)
    sem_regiao: int = 0
    duplicadas: int = 0     # notícias já persistidas anteriormente no banco
    erros: int = 0


def extrair_regiao(texto: str) -> tuple[str, str] | None:
    """Procura no texto o nome de uma RA do DF. Heurística por palavra-chave.
    Retorna (nome, codigo) ou None se nenhuma região for reconhecida."""
    t = _normalizar(texto)
    for nome in _NOMES_ORDENADOS:
        # fronteira de palavra: nomes/siglas curtos (ex.: "SIA", "Gama") não
        # podem casar dentro de outra palavra ("agência", "programa").
        if re.search(r"\b" + re.escape(_normalizar(nome)) + r"\b", t):
            return nome, REGIOES_DF[nome]
    return None


def geocodificar_regiao(nome: str) -> nominatim.Coordenada | None:
    """Geocoder padrão da ingestão: usa o centroide pré-computado da RA
    (COORDENADAS_RA) — lookup instantâneo, sem rede. Só consulta o Nominatim se
    o nome não estiver na tabela estática (fallback). É o que torna o disparo
    rápido e imune ao rate-limit do Nominatim."""
    codigo = REGIOES_DF.get(nome)
    if codigo and codigo in COORDENADAS_RA:
        lat, lon = COORDENADAS_RA[codigo]
        return nominatim.Coordenada(latitude=lat, longitude=lon)
    return nominatim.geocodificar(nome)


def _parse_data(valor: str | None) -> datetime:
    """pubDate do Correio é 'YYYY-MM-DD HH:MM:SS'. Sem data válida -> agora."""
    if valor:
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                return datetime.strptime(valor, fmt).replace(tzinfo=UTC)
            except ValueError:
                continue
    return datetime.now(UTC)


def ingerir(
    db,
    *,
    itens: list[correio_rss.ItemRSS] | None = None,
    geocodificar=None,
    filtro=None,
) -> ResultadoIngestao:
    """Executa o pipeline de ingestão e persiste as ocorrências.

    O resumo por IA NÃO é gerado aqui — a ocorrência nasce com
    `resumo_status="PENDENTE"` e é resumida sob demanda em `GET /ocorrencias/{id}`.

    `itens`, `geocodificar` e `filtro` são injetáveis (testes sem rede).
    `filtro(item) -> bool` decide o que é relevante; o padrão é `eh_relevante`
    (editoria cidades-df + termo de segurança).
    """
    itens = itens if itens is not None else correio_rss.buscar_todos()
    geocode = geocodificar or geocodificar_regiao
    aplicar_filtro = filtro if filtro is not None else eh_relevante

    pin_repo = LocalPinRepository(db)
    oc_repo = OcorrenciaRepository(db)
    res = ResultadoIngestao()

    for item in itens:
        res.processadas += 1

        # Camadas 1+2: só notícia de segurança urbana do DF segue no pipeline.
        if not aplicar_filtro(item):
            res.filtradas += 1
            continue

        # Evita a duplicação: se a URL do link já existe no banco, ignora o item.
        if item.link and oc_repo.buscar_por_url(item.link):
            res.duplicadas += 1
            continue

        texto = f"{item.titulo} {item.descricao}".strip()
        regiao = extrair_regiao(texto)
        if not regiao:
            res.sem_regiao += 1
            continue
        nome_regiao, codigo_ra = regiao

        try:
            coord = geocode(nome_regiao)
            if not coord:
                res.sem_regiao += 1
                continue

            pin = pin_repo.buscar_ou_criar(
                lat=coord.latitude,
                lon=coord.longitude,
                regiao=codigo_ra,
                nome=nome_regiao,
            )

            # Resumo fica PENDENTE: gerado sob demanda ao abrir a ocorrência
            # (GET /ocorrencias/{id}), não no lote — evita rajada no Gemini.
            ocorrencia = Ocorrencia(
                locais_pin_id=pin.id,
                titulo_noticia=item.titulo,
                descricao_detalhada=item.descricao or None,
                fonte_url=item.link or None,
                latitude=coord.latitude,
                longitude=coord.longitude,
                regiao_administrativa=codigo_ra,
                resumo_gemini=None,
                resumo_status="PENDENTE",
                data_ocorrencia=_parse_data(item.data_publicacao),
            )
            oc_repo.criar(ocorrencia)
            res.persistidas += 1
        except Exception:  # noqa: BLE001 — uma notícia ruim não derruba o lote
            res.erros += 1

    return res
