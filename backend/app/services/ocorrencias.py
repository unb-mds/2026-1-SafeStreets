from datetime import date, datetime, time

from sqlalchemy.orm import Session
from app.models import Ocorrencia
from app.repositories.ocorrencia_repository import OcorrenciaRepository
from app.schemas.ocorrencia import OcorrenciaOut


def _to_out(o: Ocorrencia) -> OcorrenciaOut:
    # No banco o campo é titulo_noticia; o frontend consome como "titulo".
    return OcorrenciaOut(
        id=o.id,
        titulo=o.titulo_noticia,
        latitude=float(o.latitude),
        longitude=float(o.longitude),
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
