# Spec Técnica: Endpoints /ocorrencias

> Referências: [API-Contract.md](../Arquitetura/API-Contract.md) · [CONTEXT.md](../Arquitetura/CONTEXT.md) · [ADRs-PENDENTES.md](../Arquitetura/ADRs-PENDENTES.md)

---

## 1. Objetivo

Implementar os dois endpoints de ocorrências no backend FastAPI, alinhados ao contrato definido em `API-Contract.md`, partindo do estado atual do projeto onde o modelo `Ocorrencia` está incompleto e não existe router dedicado.

---

## 2. Estado atual vs. estado esperado

| Artefato | Estado atual | Estado esperado |
|---|---|---|
| `backend/app/models.py` | 4 campos (id, titulo_noticia, lat, lon) | Todos os campos do contrato |
| `backend/app/schemas.py` | Não existe | Schemas Pydantic de response |
| `backend/app/services/ocorrencias.py` | Não existe | Queries com filtros |
| `backend/app/routers/ocorrencias.py` | Não existe | GET /ocorrencias e /{id} |
| `backend/app/main.py` | Só router health | Inclui router ocorrencias |

---

## 3. Modelo ORM expandido

**Arquivo**: `backend/app/models.py`

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class Ocorrencia(Base):
    __tablename__ = "ocorrencias_criminais"

    id                   = Column(Integer, primary_key=True, index=True)
    locais_pin_id        = Column(Integer, nullable=True)
    titulo_noticia       = Column(String, nullable=False, index=True)
    descricao_detalhada  = Column(String, nullable=True)
    data_ocorrencia      = Column(DateTime(timezone=True), nullable=False)
    latitude             = Column(Float, nullable=False)
    longitude            = Column(Float, nullable=False)
    resumo_gemini        = Column(String, nullable=True)
    resumo_status        = Column(String, default="PENDENTE")  # COMPLETO | PENDENTE | ERRO | FALLBACK_GENERICO
    regiao_administrativa = Column(String, nullable=False, index=True)
    criado_em            = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em        = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

> ⚠️ ADR-001 pendente: o valor padrão de `resumo_status` e o campo `resumo_gemini` em caso de falha do Gemini ainda não foi decidido. Usar `"PENDENTE"` como stub até resolução.

---

## 4. Schemas Pydantic

**Arquivo**: `backend/app/schemas.py`

```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
import re

class MarcadorSchema(BaseModel):
    id: str
    coordenadas: list[float]  # [latitude, longitude]
    risco: str                # "alto" | "medio" | "baixo"

class OcorrenciaResponse(BaseModel):
    id: int
    titulo: str
    descricao: Optional[str]
    data_ocorrencia: datetime
    latitude: float
    longitude: float
    resumo: Optional[str]
    resumo_status: str
    regiao_administrativa: str
    marcador: MarcadorSchema

    model_config = {"from_attributes": True}

    @field_validator("regiao_administrativa")
    @classmethod
    def validar_ra(cls, v: str) -> str:
        if not re.match(r"^RA-\d{3}$", v):
            raise ValueError("Formato inválido. Use RA-XXX (ex: RA-026)")
        return v

class PaginacaoSchema(BaseModel):
    total: int
    limit: int
    offset: int
    proxima_pagina: Optional[str]

class OcorrenciaListResponse(BaseModel):
    success: bool = True
    data: list[OcorrenciaResponse]
    paginacao: PaginacaoSchema

class OcorrenciaDetailResponse(BaseModel):
    success: bool = True
    data: OcorrenciaResponse

class ErrorDetail(BaseModel):
    codigo: str
    mensagem: str
    detalhe: str

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
```

---

## 5. Camada de serviço

**Arquivo**: `backend/app/services/ocorrencias.py`

Responsabilidades:
- Aplicar filtros opcionais (`regiao`, `data_inicio`, `data_fim`)
- Calcular `proxima_pagina` para paginação
- Mapear ORM → Schema

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date
from typing import Optional
from app.models import Ocorrencia
from app.schemas import OcorrenciaResponse, PaginacaoSchema

async def listar_ocorrencias(
    db: AsyncSession,
    regiao: Optional[str],
    data_inicio: Optional[date],
    data_fim: Optional[date],
    limit: int,
    offset: int,
) -> tuple[list[Ocorrencia], int]:
    query = select(Ocorrencia)
    if regiao:
        query = query.where(Ocorrencia.regiao_administrativa == regiao)
    if data_inicio:
        query = query.where(Ocorrencia.data_ocorrencia >= data_inicio)
    if data_fim:
        query = query.where(Ocorrencia.data_ocorrencia <= data_fim)

    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    result = await db.execute(query.offset(offset).limit(limit))
    return result.scalars().all(), total

async def buscar_ocorrencia(db: AsyncSession, id: int) -> Optional[Ocorrencia]:
    result = await db.execute(select(Ocorrencia).where(Ocorrencia.id == id))
    return result.scalar_one_or_none()
```

---

## 6. Router

**Arquivo**: `backend/app/routers/ocorrencias.py`

```python
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from typing import Optional
from app.database import get_db
from app.schemas import OcorrenciaListResponse, OcorrenciaDetailResponse, ErrorResponse
from app.services import ocorrencias as service

router = APIRouter(prefix="/ocorrencias", tags=["Ocorrências"])

@router.get("", response_model=OcorrenciaListResponse)
async def listar_ocorrencias(
    regiao: Optional[str] = Query(None, description="Código RA, ex: RA-026"),
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    if data_inicio and data_fim and data_inicio > data_fim:
        raise HTTPException(status_code=400, detail={
            "success": False,
            "error": {
                "codigo": "INVALID_DATE_RANGE",
                "mensagem": "data_inicio deve ser anterior a data_fim",
                "detalhe": f"data_inicio={data_inicio}, data_fim={data_fim}",
            }
        })

    items, total = await service.listar_ocorrencias(db, regiao, data_inicio, data_fim, limit, offset)
    proxima = f"?offset={offset + limit}" if offset + limit < total else None

    return {
        "success": True,
        "data": items,
        "paginacao": {"total": total, "limit": limit, "offset": offset, "proxima_pagina": proxima},
    }

@router.get("/{id}", response_model=OcorrenciaDetailResponse)
async def detalhar_ocorrencia(id: int, db: AsyncSession = Depends(get_db)):
    ocorrencia = await service.buscar_ocorrencia(db, id)
    if not ocorrencia:
        raise HTTPException(status_code=404, detail={
            "success": False,
            "error": {
                "codigo": "NOT_FOUND",
                "mensagem": "Ocorrência não encontrada",
                "detalhe": f"id={id}",
            }
        })
    return {"success": True, "data": ocorrencia}
```

---

## 7. Registro em main.py

```python
from app.routers import health, ocorrencias

app.include_router(ocorrencias.router)
```

---

## 8. Critérios de aceite

- [ ] `GET /ocorrencias` retorna 200 com envelope `{success, data, paginacao}`
- [ ] `GET /ocorrencias?regiao=RA-026` filtra por região corretamente
- [ ] `GET /ocorrencias?data_inicio=X&data_fim=Y` com X > Y retorna 400 com `INVALID_DATE_RANGE`
- [ ] `GET /ocorrencias/{id}` retorna 200 para id existente
- [ ] `GET /ocorrencias/9999` retorna 404 com envelope de erro padrão
- [ ] `limit` não aceita valor > 500
- [ ] Swagger em `/docs` exibe os dois endpoints sem configuração adicional

---

## 9. Decisões pendentes (não implementar sem resolução)

| ADR | Impacto nesta spec |
|---|---|
| ADR-001 | Valor retornado em `resumo_gemini` e `resumo_status` quando Gemini falha |
| ADR-002 | TTL da camada de cache que envolverá o serviço |
| ADR-003 | Se adicionar Redis ou manter in-memory no serviço |
| ADR-004 | Como versionar quando `OcorrenciaResponse` mudar |
