from sqlalchemy.orm import Session

from app.repositories.ocorrencia_repository import OcorrenciaRepository

# Limiares de contagem de ocorrências por Região Administrativa
LIMIARES_RISCO = {
    "alto":  50,   # >= 50 ocorrências → alto
    "medio": 20,   # >= 20 ocorrências → médio
                   # <  20 ocorrências → baixo
}


def calcular_risco(regiao: str, db: Session) -> str:
    """
    Calcula o indicador de risco de uma Região Administrativa
    a partir da contagem de ocorrências registradas.

    Retorna: 'alto' | 'medio' | 'baixo'
    """
    repo = OcorrenciaRepository(db)
    total = repo.contar_por_regiao(regiao)

    if total >= LIMIARES_RISCO["alto"]:
        return "alto"
    elif total >= LIMIARES_RISCO["medio"]:
        return "medio"
    return "baixo"
