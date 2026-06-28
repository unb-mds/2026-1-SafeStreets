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
    regiao: str | None = None
    risco: str | None = None
    resumo: str | None = None
    data: datetime | None = None


class OcorrenciaListResponse(BaseModel):
    success: bool = True
    data: list[OcorrenciaOut]


class OcorrenciaDetailResponse(BaseModel):
    success: bool = True
    data: OcorrenciaOut
