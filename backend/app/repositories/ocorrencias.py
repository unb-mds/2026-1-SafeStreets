from sqlalchemy.orm import Session
from app.models import Ocorrencia


def list_all(db: Session) -> list[Ocorrencia]:
    return db.query(Ocorrencia).all()


def get_by_id(db: Session, ocorrencia_id: int) -> Ocorrencia | None:
    return db.query(Ocorrencia).filter(Ocorrencia.id == ocorrencia_id).first()


def create(db: Session, titulo_noticia: str, latitude: float, longitude: float) -> Ocorrencia:
    ocorrencia = Ocorrencia(
        titulo_noticia=titulo_noticia,
        latitude=latitude,
        longitude=longitude,
    )
    db.add(ocorrencia)
    db.commit()
    db.refresh(ocorrencia)
    return ocorrencia
