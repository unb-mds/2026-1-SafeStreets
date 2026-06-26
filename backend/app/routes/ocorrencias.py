from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from app.core.database import get_db
from app.schemas.ocorrencia import (
    OcorrenciaListResponse,
    OcorrenciaDetailResponse,
)
from app.services import ocorrencias as service

router = APIRouter(prefix="/ocorrencias", tags=["Ocorrências"])

_DB_OFF = "Banco de dados indisponível. Suba o Postgres com 'docker compose up -d'."

# Nota: não há POST aqui de propósito. Ocorrências nascem do pipeline de
# ingestão (RSS → enriquecimento → persistência), não de requisições de
# cliente — o sistema não coleta dados de cidadão (ver CONTEXT.md).


@router.get("", response_model=OcorrenciaListResponse)
def listar_ocorrencias(db: Session = Depends(get_db)):
    try:
        return {"success": True, "data": service.listar(db)}
    except OperationalError:
        raise HTTPException(status_code=503, detail=_DB_OFF)


@router.get("/{ocorrencia_id}", response_model=OcorrenciaDetailResponse)
def detalhar_ocorrencia(ocorrencia_id: int, db: Session = Depends(get_db)):
    try:
        out = service.buscar(db, ocorrencia_id)
    except OperationalError:
        raise HTTPException(status_code=503, detail=_DB_OFF)
    if not out:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
    return {"success": True, "data": out}
