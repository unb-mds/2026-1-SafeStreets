from datetime import datetime

from pydantic import BaseModel, field_validator


class OcorrenciaCreate(BaseModel):
    titulo_noticia: str
    latitude: float
    longitude: float

    @field_validator("latitude")
    @classmethod
    def _validar_latitude(cls, v: float) -> float:
        if not -90 <= v <= 90:
            raise ValueError("latitude fora do range [-90, 90]")
        return v

    @field_validator("longitude")
    @classmethod
    def _validar_longitude(cls, v: float) -> float:
        if not -180 <= v <= 180:
            raise ValueError("longitude fora do range [-180, 180]")
        return v


class OcorrenciaOut(BaseModel):
    id: int
    titulo: str
    latitude: float
    longitude: float

    # Campos geográficos separados: código RA e nome completo da região
    ra: str | None = None          # ex: "RA-009"
    regiao: str | None = None      # ex: "Ceilândia"

    # Risco capitalizado para o frontend: "Baixo" | "Médio" | "Alto"
    risco: str | None = None

    # Resumo e seu status (ADR-001: COMPLETO | PENDENTE | ERRO | FALLBACK_GENERICO)
    resumo: str | None = None
    resumo_status: str | None = None

    # Data formatada como string "DD/MM/YYYY" para exibição direta
    data: str | None = None

    # Conteúdo completo da notícia e link original (RF02)
    descricao_detalhada: str | None = None
    fonte_url: str | None = None


class OcorrenciaListResponse(BaseModel):
    success: bool = True
    data: list[OcorrenciaOut]


class OcorrenciaDetailResponse(BaseModel):
    success: bool = True
    data: OcorrenciaOut
