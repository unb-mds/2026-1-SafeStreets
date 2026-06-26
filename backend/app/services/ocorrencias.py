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


def listar(db: Session) -> list[OcorrenciaOut]:
    repo = OcorrenciaRepository(db)
    return [_to_out(o) for o in repo.listar()]


def buscar(db: Session, ocorrencia_id: int) -> OcorrenciaOut | None:
    repo = OcorrenciaRepository(db)
    o = repo.buscar_por_id(ocorrencia_id)
    return _to_out(o) if o else None
