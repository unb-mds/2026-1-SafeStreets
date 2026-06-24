# Plano Técnico — Banco de Dados: SafeStreets

> Blueprint técnico derivado de `spec.md`. Descreve o **como** de cada decisão.
> Antes de implementar qualquer task, releia `spec.md` e este arquivo.

---

## Stack e decisões técnicas

| Componente        | Tecnologia                           | Justificativa                                               |
|-------------------|--------------------------------------|-------------------------------------------------------------|
| SGBD              | PostgreSQL 15 (Alpine)               | Já usado no Docker Compose atual                            |
| ORM               | SQLAlchemy                           | Já instalado no `requirements.txt`                          |
| Migrations        | Alembic                              | Padrão de mercado para projetos SQLAlchemy, gera SQL automaticamente dos models |
| Validação         | Pydantic (via FastAPI)               | Validação ocorre antes de qualquer escrita no banco         |
| Cache (dev)       | In-memory dict Python com TTL        | Zero dependência, suficiente para desenvolvimento e testes  |
| Cache (prod)      | Redis                                | Pendente ADR-003 — não implementar agora                    |
| Conexão           | `os.getenv("DATABASE_URL")`          | Permite rodar em qualquer ambiente sem alterar código       |
| Pool              | `pool_pre_ping=True`, size=10, overflow=20 | Evita conexões mortas e suporta carga razoável         |

---

## Estrutura de arquivos (estado alvo)

```
backend/
├── app/
│   ├── core/
│   │   ├── database.py              ← MODIFICAR (env var + pool config + get_db)
│   │   └── cache.py                 ← CRIAR (in-memory com TTL)
│   ├── models/
│   │   ├── __init__.py              ← CRIAR (importa todos os models para o Alembic)
│   │   ├── local_pin.py             ← CRIAR (tabela locais_pin)
│   │   ├── ocorrencia.py            ← MODIFICAR (expandir para schema completo)
│   │   └── historico_consulta.py   ← CRIAR (tabela historico_consultas)
│   ├── repositories/
│   │   ├── __init__.py              ← CRIAR (vazio)
│   │   ├── ocorrencia_repository.py ← CRIAR
│   │   └── local_pin_repository.py  ← CRIAR
│   └── services/
│       └── risco_service.py         ← CRIAR
├── alembic/                         ← CRIAR via `alembic init`
│   ├── versions/                    ← gerada automaticamente
│   └── env.py                       ← MODIFICAR após init
├── tests/
│   └── test_main.py                 ← já existe; adicionar testes de repo e risco
├── docker-compose.yml               ← MODIFICAR (healthcheck + serviço api)
└── requirements.txt                 ← MODIFICAR (adicionar alembic)
```

---

## Modelo relacional

```
[locais_pin] 1 ──── 0..* [ocorrencias_criminais]
      │
      │ 1
      └──────── 0..* [historico_consultas]
```

Ambas as FKs usam `ON DELETE CASCADE`: remover um `local_pin` remove todas as ocorrências e consultas associadas.

---

## Tabela: `locais_pin`

Ponto geográfico único ou centroide de uma Região Administrativa.

### Colunas

| Coluna                  | Tipo         | Nullable | Default     | Notas                               |
|-------------------------|--------------|----------|-------------|-------------------------------------|
| `id`                    | SERIAL       | ❌        | auto        | PK                                  |
| `latitude`              | NUMERIC(9,6) | ❌        | —           | CHECK BETWEEN -90 AND 90            |
| `longitude`             | NUMERIC(9,6) | ❌        | —           | CHECK BETWEEN -180 AND 180          |
| `regiao_administrativa` | VARCHAR(10)  | ❌        | —           | ex: "RA-026" — indexado             |
| `nome_regiao`           | VARCHAR(100) | ✅        | NULL        | ex: "Taguatinga"                    |
| `tipo_localizacao`      | VARCHAR(20)  | ✅        | 'centroide' | 'centroide' ou 'preciso'            |
| `criado_em`             | TIMESTAMPTZ  | ✅        | NOW()       |                                     |

### Índices
- `idx_locais_pin_coords` → `(latitude, longitude)` — busca por bounding box
- `idx_locais_pin_regiao` → `(regiao_administrativa)`

### Model SQLAlchemy

```python
# backend/app/models/local_pin.py
from sqlalchemy import Column, Integer, String, Numeric, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class LocalPin(Base):
    __tablename__ = "locais_pin"

    id                    = Column(Integer, primary_key=True, index=True)
    latitude              = Column(Numeric(9, 6), nullable=False)
    longitude             = Column(Numeric(9, 6), nullable=False)
    regiao_administrativa = Column(String(10), nullable=False, index=True)
    nome_regiao           = Column(String(100))
    tipo_localizacao      = Column(String(20), default="centroide")
    criado_em             = Column(DateTime(timezone=True), server_default=func.now())

    ocorrencias         = relationship("Ocorrencia", back_populates="local_pin")
    historico_consultas = relationship("HistoricoConsulta", back_populates="local_pin")

    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90 AND 90",    name="chk_latitude"),
        CheckConstraint("longitude BETWEEN -180 AND 180", name="chk_longitude"),
    )
```

---

## Tabela: `ocorrencias_criminais`

Tabela central. Cada linha é uma ocorrência processada pelo pipeline ETL.

> ⚠️ O model atual (`ocorrencia.py`) usa `__tablename__ = "ocorrencias"` e só tem 4 campos. Ele será completamente reescrito.

### Colunas

| Coluna                  | Tipo          | Nullable | Default    | Notas                                                        |
|-------------------------|---------------|----------|------------|--------------------------------------------------------------|
| `id`                    | SERIAL        | ❌        | auto       | PK                                                           |
| `locais_pin_id`         | INTEGER       | ❌        | —          | FK → `locais_pin.id` CASCADE                                 |
| `titulo_noticia`        | VARCHAR(500)  | ❌        | —          | indexado                                                     |
| `descricao_detalhada`   | TEXT          | ✅        | NULL       |                                                              |
| `fonte_url`             | VARCHAR(2048) | ✅        | NULL       | URL original (Correio Braziliense)                           |
| `latitude`              | NUMERIC(9,6)  | ❌        | —          | Redundante ao `locais_pin` — evita JOIN em queries rápidas   |
| `longitude`             | NUMERIC(9,6)  | ❌        | —          | Idem                                                         |
| `regiao_administrativa` | VARCHAR(10)   | ❌        | —          | indexado                                                     |
| `resumo_gemini`         | TEXT          | ✅        | NULL       | Gerado pelo Gemini API                                       |
| `resumo_status`         | VARCHAR(20)   | ✅        | 'PENDENTE' | CHECK: 'COMPLETO', 'PENDENTE', 'ERRO', 'FALLBACK_GENERICO'   |
| `risco_nivel`           | VARCHAR(10)   | ✅        | 'baixo'    | CHECK: 'baixo', 'medio', 'alto' — calculado por `risco_service` |
| `data_ocorrencia`       | TIMESTAMPTZ   | ❌        | —          |                                                              |
| `criado_em`             | TIMESTAMPTZ   | ✅        | NOW()      |                                                              |
| `atualizado_em`         | TIMESTAMPTZ   | ✅        | NOW()      | `onupdate=func.now()` no ORM                                 |

### Índices
- `idx_ocorrencias_pin`    → `(locais_pin_id)`
- `idx_ocorrencias_regiao` → `(regiao_administrativa)`
- `idx_ocorrencias_data`   → `(data_ocorrencia DESC)`
- `idx_ocorrencias_status` → `(resumo_status)` WHERE `resumo_status = 'PENDENTE'` — índice parcial

### Model SQLAlchemy

```python
# backend/app/models/ocorrencia.py
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Ocorrencia(Base):
    __tablename__ = "ocorrencias_criminais"

    id                    = Column(Integer, primary_key=True, index=True)
    locais_pin_id         = Column(Integer, ForeignKey("locais_pin.id", ondelete="CASCADE"), nullable=False)
    titulo_noticia        = Column(String(500), nullable=False, index=True)
    descricao_detalhada   = Column(Text)
    fonte_url             = Column(String(2048))
    latitude              = Column(Numeric(9, 6), nullable=False)
    longitude             = Column(Numeric(9, 6), nullable=False)
    regiao_administrativa = Column(String(10), nullable=False, index=True)
    resumo_gemini         = Column(Text)
    resumo_status         = Column(String(20), default="PENDENTE")
    risco_nivel           = Column(String(10), default="baixo")
    data_ocorrencia       = Column(DateTime(timezone=True), nullable=False)
    criado_em             = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em         = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    local_pin = relationship("LocalPin", back_populates="ocorrencias")

    __table_args__ = (
        CheckConstraint(
            "resumo_status IN ('COMPLETO', 'PENDENTE', 'ERRO', 'FALLBACK_GENERICO')",
            name="chk_resumo_status"
        ),
        CheckConstraint(
            "risco_nivel IN ('baixo', 'medio', 'alto')",
            name="chk_risco_nivel"
        ),
    )
```

---

## Tabela: `historico_consultas`

Cache espacial com TTL. Registra quando cada região foi consultada e quando o cache expira.

### Colunas

| Coluna                          | Tipo        | Nullable | Default | Notas                                     |
|---------------------------------|-------------|----------|---------|-------------------------------------------|
| `id`                            | SERIAL      | ❌        | auto    | PK                                        |
| `locais_pin_id`                 | INTEGER     | ✅        | NULL    | FK → `locais_pin.id` CASCADE              |
| `timestamp_ultima_atualizacao`  | TIMESTAMPTZ | ❌        | NOW()   |                                           |
| `ttl_expiracao`                 | TIMESTAMPTZ | ❌        | —       | `timestamp + 24h` (padrão — ver ADR-002)  |
| `raio_geografico`               | VARCHAR(100)| ✅        | NULL    | ex: "bbox:-15.8,-48.1,-15.7,-47.9"        |
| `total_ocorrencias_cached`      | INTEGER     | ✅        | 0       |                                           |
| `criado_em`                     | TIMESTAMPTZ | ✅        | NOW()   |                                           |

### Índices
- `idx_historico_ttl` → `(ttl_expiracao)` — queries de expiração
- `idx_historico_pin` → `(locais_pin_id)`

### Model SQLAlchemy

```python
# backend/app/models/historico_consulta.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class HistoricoConsulta(Base):
    __tablename__ = "historico_consultas"

    id                           = Column(Integer, primary_key=True, index=True)
    locais_pin_id                = Column(Integer, ForeignKey("locais_pin.id", ondelete="CASCADE"))
    timestamp_ultima_atualizacao = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ttl_expiracao                = Column(DateTime(timezone=True), nullable=False)
    raio_geografico              = Column(String(100))
    total_ocorrencias_cached     = Column(Integer, default=0)
    criado_em                    = Column(DateTime(timezone=True), server_default=func.now())

    local_pin = relationship("LocalPin", back_populates="historico_consultas")
```

---

## Configuração de conexão (alvo)

```python
# backend/app/core/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:123@localhost:5432/safestreets"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## Alembic — inicialização e fluxo

```bash
# 1. Dentro de /backend:
alembic init alembic

# 2. Editar alembic/env.py:
#    from app.core.database import Base
#    from app.models import local_pin, ocorrencia, historico_consulta
#    target_metadata = Base.metadata

# 3. Gerar primeira migration:
alembic revision --autogenerate -m "cria tabelas locais_pin, ocorrencias_criminais e historico_consultas"

# 4. Aplicar:
alembic upgrade head

# Mudanças futuras sempre seguem o padrão:
alembic revision --autogenerate -m "descricao"
alembic upgrade head
```

---

## Repository Pattern

### OcorrenciaRepository

Métodos obrigatórios:
- `criar(ocorrencia)` → salva e retorna com `id` populado
- `buscar_por_id(id)` → `Optional[Ocorrencia]`
- `buscar_por_regiao_e_periodo(regiao, data_inicio, data_fim, limit, offset)` → `list[Ocorrencia]`
- `contar_por_regiao(regiao)` → `int` — usado pelo `risco_service`
- `buscar_pendentes_resumo()` → ocorrências com `resumo_status == "PENDENTE"`
- `atualizar_resumo(id, resumo, status)` → atualiza campos de IA

### LocalPinRepository

Métodos obrigatórios:
- `buscar_ou_criar(lat, lon, regiao, nome)` → evita duplicatas de ponto geográfico
- `buscar_por_regiao(regiao)` → `list[LocalPin]`

---

## Serviço de risco

Lógica de negócio — não pertence ao Repository.

```python
# backend/app/services/risco_service.py
LIMIARES_RISCO = {"alto": 50, "medio": 20}

def calcular_risco(regiao: str, db: Session) -> str:
    total = OcorrenciaRepository(db).contar_por_regiao(regiao)
    if total >= LIMIARES_RISCO["alto"]:   return "alto"
    if total >= LIMIARES_RISCO["medio"]:  return "medio"
    return "baixo"
```

---

## Cache in-memory (dev)

```python
# backend/app/core/cache.py
from datetime import datetime, timedelta

_cache: dict = {}

def get_cache(key: str):
    entry = _cache.get(key)
    if entry and entry["expira_em"] > datetime.utcnow():
        return entry["valor"]
    return None

def set_cache(key: str, valor, ttl_horas: int = 24):
    _cache[key] = {
        "valor": valor,
        "expira_em": datetime.utcnow() + timedelta(hours=ttl_horas),
    }
```

---

## Docker Compose (alvo)

Adicionar ao `docker-compose.yml` atual:

```yaml
services:
  db:
    # ... existente ...
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d safestreets"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: .
    container_name: safestreets_api
    environment:
      DATABASE_URL: postgresql://admin:123@db:5432/safestreets
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Testes

- `tests/test_ocorrencia_repository.py` — testar `criar`, `buscar_por_regiao_e_periodo`, `contar_por_regiao`, `buscar_pendentes_resumo`, `atualizar_resumo`
- `tests/test_risco_service.py` — testar os 3 limiares (< 20, 20–49, ≥ 50) com mock do repository

> Usar banco de teste em memória (SQLite) ou banco PostgreSQL de teste via fixture.

---

## Decisões em aberto (ADRs)

| ADR     | Questão                                      | Impacto                                    |
|---------|----------------------------------------------|--------------------------------------------|
| ADR-002 | TTL variável por RA?                         | Coluna `ttl_expiracao` em `historico_consultas` |
| ADR-003 | Redis em produção?                           | Troca de `cache.py` por `cache_redis.py`   |
| ADR-004 | Schema versioning com Alembic?               | Estratégia de rollback e migrations        |
