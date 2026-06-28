from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from app.core.database import get_db
from app.services import ingestao

router = APIRouter(prefix="/admin", tags=["Admin"])

_DB_OFF = "Banco de dados indisponível. Suba o Postgres com 'docker compose up -d'."

# Endpoint administrativo/interno: dispara o pipeline de ingestão sob demanda.
# Ainda sem autenticação (RNF07 / auth é trabalho futuro) — proteger depois.


@router.post("/ingerir")
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
