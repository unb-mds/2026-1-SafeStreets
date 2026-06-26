"""Serviço de ingestão — conecta as integrações ao banco (RF12).

Pipeline por notícia:
    RSS (correio_rss) → extrair região do texto → geocodificar (nominatim)
    → buscar_ou_criar LocalPin → resumir (gemini) → persistir Ocorrencia.

Tudo é injetável para teste sem rede/chave: `itens`, `geocodificar` e `gemini`
podem ser passados; sem eles, usa as integrações reais. NÃO há classificação
de tipo de crime (fora do escopo, RF12).

Comportamento do resumo segue o ADR-001 (Opção A): se o Gemini falhar, a
ocorrência é persistida mesmo assim com `resumo_status="ERRO"` e resumo nulo.
"""
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timezone

from app.integrations import correio_rss, nominatim
from app.integrations.gemini import GeminiClient
from app.models.ocorrencia import Ocorrencia
from app.repositories.local_pin_repository import LocalPinRepository
from app.repositories.ocorrencia_repository import OcorrenciaRepository

# Subconjunto inicial das Regiões Administrativas do DF (nome -> código RA-XXX).
# Expandir conforme necessário; é a tabela de domínio do time.
REGIOES_DF: dict[str, str] = {
    "Plano Piloto": "RA-001",
    "Brasília": "RA-001",
    "Gama": "RA-002",
    "Taguatinga": "RA-003",
    "Brazlândia": "RA-004",
    "Sobradinho": "RA-005",
    "Planaltina": "RA-006",
    "Ceilândia": "RA-009",
    "Guará": "RA-010",
    "Samambaia": "RA-012",
    "Santa Maria": "RA-013",
    "Recanto das Emas": "RA-015",
    "Águas Claras": "RA-020",
}

# Nomes ordenados do mais longo para o mais curto: evita casar "Gama" dentro de
# um nome maior antes de tentar o nome específico.
_NOMES_ORDENADOS = sorted(REGIOES_DF, key=len, reverse=True)


def _normalizar(s: str | None) -> str:
    """Minúsculas + remove acentos — o matcher de região não pode depender de
    o texto da notícia vir acentuado ('Ceilandia' deve casar com 'Ceilândia')."""
    decomposto = unicodedata.normalize("NFKD", s or "")
    sem_acento = "".join(c for c in decomposto if not unicodedata.combining(c))
    return sem_acento.lower()


# Camada 2: termos que indicam notícia de segurança pública.
TERMOS_SEGURANCA: set[str] = {
    "roubo", "furto", "assalto", "homicídio", "assassinato", "latrocínio",
    "tráfico", "drogas", "crime", "polícia", "tiroteio", "estupro",
    "violência", "preso", "apreensão", "arma", "morto", "baleado",
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


def eh_relevante(item) -> bool:
    """Notícia de segurança urbana do DF = editoria cidades-df E termo de
    segurança. É o filtro padrão da ingestão."""
    return eh_cidades_df(item) and eh_seguranca(item)


@dataclass
class ResultadoIngestao:
    processadas: int = 0
    persistidas: int = 0
    filtradas: int = 0      # descartadas pelo filtro de relevância (não é DF/segurança)
    sem_regiao: int = 0
    erros: int = 0


def extrair_regiao(texto: str) -> tuple[str, str] | None:
    """Procura no texto o nome de uma RA do DF. Heurística por palavra-chave.
    Retorna (nome, codigo) ou None se nenhuma região for reconhecida."""
    t = _normalizar(texto)
    for nome in _NOMES_ORDENADOS:
        if _normalizar(nome) in t:
            return nome, REGIOES_DF[nome]
    return None


def _parse_data(valor: str | None) -> datetime:
    """pubDate do Correio é 'YYYY-MM-DD HH:MM:SS'. Sem data válida -> agora."""
    if valor:
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                return datetime.strptime(valor, fmt).replace(tzinfo=timezone.utc)
            except ValueError:
                continue
    return datetime.now(timezone.utc)


def ingerir(
    db,
    *,
    itens: list[correio_rss.ItemRSS] | None = None,
    geocodificar=None,
    gemini: GeminiClient | None = None,
    filtro=None,
) -> ResultadoIngestao:
    """Executa o pipeline de ingestão e persiste as ocorrências.

    `itens`, `geocodificar`, `gemini` e `filtro` são injetáveis (testes sem
    rede/chave). `filtro(item) -> bool` decide o que é relevante; o padrão é
    `eh_relevante` (editoria cidades-df + termo de segurança).
    """
    itens = itens if itens is not None else correio_rss.buscar_itens()
    geocode = geocodificar or nominatim.geocodificar
    gemini = gemini or GeminiClient()
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

            resumo = gemini.resumir(texto)  # ADR-001 A: falha -> status ERRO

            ocorrencia = Ocorrencia(
                locais_pin_id=pin.id,
                titulo_noticia=item.titulo,
                descricao_detalhada=item.descricao or None,
                fonte_url=item.link or None,
                latitude=coord.latitude,
                longitude=coord.longitude,
                regiao_administrativa=codigo_ra,
                resumo_gemini=resumo.resumo,
                resumo_status=resumo.status,
                data_ocorrencia=_parse_data(item.data_publicacao),
            )
            oc_repo.criar(ocorrencia)
            res.persistidas += 1
        except Exception:  # noqa: BLE001 — uma notícia ruim não derruba o lote
            res.erros += 1

    return res
