from sqlalchemy.orm import Session
from app.models import Ocorrencia
from app.repositories import ocorrencias as repo
from app.schemas.ocorrencia import OcorrenciaCreate, OcorrenciaOut


def _to_out(o: Ocorrencia) -> OcorrenciaOut:
    # No banco o campo é titulo_noticia; o frontend consome como "titulo".
    return OcorrenciaOut(
        id=o.id,
        titulo=o.titulo_noticia,
        latitude=o.latitude,
        longitude=o.longitude,
    )


def listar(db: Session) -> list[OcorrenciaOut]:
    return [_to_out(o) for o in repo.list_all(db)]


def buscar(db: Session, ocorrencia_id: int) -> OcorrenciaOut | None:
    o = repo.get_by_id(db, ocorrencia_id)
    return _to_out(o) if o else None


def criar(db: Session, payload: OcorrenciaCreate) -> OcorrenciaOut:
    o = repo.create(db, payload.titulo_noticia, payload.latitude, payload.longitude)
    return _to_out(o)
