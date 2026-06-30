from datetime import date, datetime, time

from sqlalchemy.orm import Session

from app.models import Ocorrencia
from app.repositories.ocorrencia_repository import OcorrenciaRepository
from app.schemas.ocorrencia import OcorrenciaOut

# Mapeamento de risco do banco (minúsculo) para o frontend (capitalizado)
_RISCO_MAP: dict[str, str] = {
    "baixo": "Baixo",
    "medio": "Médio",
    "alto":  "Alto",
}


def _to_out(o: Ocorrencia) -> OcorrenciaOut:
    # Formata data como "DD/MM/YYYY" para exibição direta no frontend
    data_str: str | None = None
    if o.data_ocorrencia:
        data_str = o.data_ocorrencia.strftime("%d/%m/%Y")

    # Nome completo da RA vem do LocalPin relacionado (ex: "Ceilândia")
    regiao_nome: str | None = None
    if o.local_pin and o.local_pin.nome_regiao:
        regiao_nome = o.local_pin.nome_regiao

    return OcorrenciaOut(
        id=o.id,
        titulo=o.titulo_noticia,
        latitude=float(o.latitude),
        longitude=float(o.longitude),
        ra=o.regiao_administrativa,
        regiao=regiao_nome,
        risco=_RISCO_MAP.get(o.risco_nivel or "", None),
        resumo=o.resumo_gemini,
        resumo_status=o.resumo_status,
        data=data_str,
        descricao_detalhada=o.descricao_detalhada,
        fonte_url=o.fonte_url,
    )


def listar(
    db: Session,
    regiao: str | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
) -> list[OcorrenciaOut]:
    repo = OcorrenciaRepository(db)
    if regiao is None and data_inicio is None and data_fim is None:
        ocorrencias = repo.listar()
    else:
        inicio = (
            datetime.combine(data_inicio, time.min)
            if data_inicio is not None
            else datetime.min
        )
        fim = (
            datetime.combine(data_fim, time.max)
            if data_fim is not None
            else datetime.max
        )
        ocorrencias = repo.buscar_por_regiao_e_periodo(regiao, inicio, fim)
    return [_to_out(o) for o in ocorrencias]


def buscar(db: Session, ocorrencia_id: int) -> OcorrenciaOut | None:
    repo = OcorrenciaRepository(db)
    o = repo.buscar_por_id(ocorrencia_id)
    return _to_out(o) if o else None
