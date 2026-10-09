from sqlalchemy.orm import Session

from app.repositories.ocorrencia_repository import OcorrenciaRepository

# Limiares de contagem de ocorrências por Região Administrativa. Ajustados ao
# volume real da base (dezenas de ocorrências no total, poucas por RA) — os
# valores antigos (50/20) eram altos demais e deixavam TODAS as RAs em "baixo".
LIMIARES_RISCO = {
    "alto":  15,   # >= 15 ocorrências na RA → alto
    "medio": 10,    # >= 10 ocorrências na RA → médio
                   # <  10 ocorrências na RA → baixo
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
