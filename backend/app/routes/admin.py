import os

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import ingestao

router = APIRouter(prefix="/admin", tags=["Admin"])

_DB_OFF = "Banco de dados indisponível. Suba o Postgres com 'docker compose up -d'."

# Token de proteção da ingestão. Se INGEST_TOKEN estiver setado (produção), o
# disparo exige o header 'X-Ingest-Token' correspondente; sem a env (dev local),
# o endpoint segue aberto — não atrapalha o docker-compose nem os testes.
_INGEST_TOKEN = os.getenv("INGEST_TOKEN")


def verificar_token(x_ingest_token: str | None = Header(default=None)) -> None:
    if _INGEST_TOKEN and x_ingest_token != _INGEST_TOKEN:
        raise HTTPException(status_code=401, detail="Token de ingestão inválido.")


@router.post("/ingerir", dependencies=[Depends(verificar_token)])
def disparar_ingestao(db: Session = Depends(get_db)):
    """Dispara a ingestão (RSS → filtro → geocode → Gemini → persiste).

    Síncrono: a resposta só volta quando o lote termina. Para o feed atual
    (~20 itens) leva alguns segundos; em volumes maiores, considerar
    BackgroundTasks/fila.
    """
    try:
        resultado = ingestao.ingerir(db)
    except OperationalError:
        raise HTTPException(status_code=503, detail=_DB_OFF)
    return {
        "success": True,
        "data": {
            "processadas": resultado.processadas,
            "persistidas": resultado.persistidas,
            "filtradas": resultado.filtradas,
            "sem_regiao": resultado.sem_regiao,
            "duplicadas": resultado.duplicadas,
            "erros": resultado.erros,
        },
    }
