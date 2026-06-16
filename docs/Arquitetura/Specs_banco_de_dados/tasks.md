# Tasks — Banco de Dados: SafeStreets

> Referências: `spec.md`, `plan.md`, `DATABASE.md`, `docs/arquitetura/API-Contract.md`
> `[P]` = pode rodar em paralelo (não depende de outra task em andamento).
> Antes de cada mudança, o agente revisita `spec.md` e `plan.md`.

---

## Fase 0 — Setup e dependências

- [x] T001 [P] Adicionar `alembic` ao `backend/requirements.txt`
  → arquivo: `backend/requirements.txt`

- [x] T002 [P] Instalar dependências: `pip install alembic`
  → ambiente: venv do backend

---

## Fase 1 — Conexão com o banco

- [x] T003 Reescrever `backend/app/core/database.py`:
  - Substituir URL hardcoded por `os.getenv("DATABASE_URL", "postgresql://admin:123@localhost:5432/safestreets")`
  - Adicionar `pool_pre_ping=True`, `pool_size=10`, `max_overflow=20`
  - Adicionar função `get_db()` (Dependency Injection para FastAPI)
  → arquivo: `backend/app/core/database.py`
  (depende: T001, T002)

---

## Fase 2 — Models

- [x] T004 Criar `backend/app/models/local_pin.py` com a classe `LocalPin`:
  - Tabela: `locais_pin`
  - Colunas: conforme `plan.md § Tabela: locais_pin`
  - CheckConstraints: latitude e longitude
  - Relationships: `ocorrencias`, `historico_consultas`
  - Índices: `idx_locais_pin_coords`, `idx_locais_pin_regiao`
  → arquivo: `backend/app/models/local_pin.py`
  (depende: T003)

- [x] T005 Reescrever `backend/app/models/ocorrencia.py` com a classe `Ocorrencia`:
  - Tabela: `ocorrencias_criminais` (renomear de `ocorrencias`)
  - Colunas: conforme `plan.md § Tabela: ocorrencias_criminais` (13 colunas no total)
  - FK: `locais_pin_id` → `locais_pin.id` CASCADE
  - CheckConstraints: `resumo_status`, `risco_nivel`
  - Relationship: `local_pin`
  - Índices: incluindo índice parcial em `resumo_status = 'PENDENTE'`
  → arquivo: `backend/app/models/ocorrencia.py`
  (depende: T004)

- [x] T006 Criar `backend/app/models/historico_consulta.py` com a classe `HistoricoConsulta`:
  - Tabela: `historico_consultas`
  - Colunas: conforme `plan.md § Tabela: historico_consultas`
  - FK: `locais_pin_id` → `locais_pin.id` CASCADE
  - Relationship: `local_pin`
  - Índices: `idx_historico_ttl`, `idx_historico_pin`
  → arquivo: `backend/app/models/historico_consulta.py`
  (depende: T004)

- [x] T007 Criar `backend/app/models/__init__.py` importando todos os models:
  ```python
  from app.models.local_pin import LocalPin
  from app.models.ocorrencia import Ocorrencia
  from app.models.historico_consulta import HistoricoConsulta
  ```
  → arquivo: `backend/app/models/__init__.py`
  (depende: T004, T005, T006)

---

## Fase 3 — Migrations

- [x] T008 Inicializar Alembic dentro de `backend/`:
  ```bash
  cd backend
  alembic init alembic
  ```
  → cria: `backend/alembic/`, `backend/alembic.ini`
  (depende: T001, T002)

- [x] T009 Editar `backend/alembic/env.py` para importar os models e apontar para `Base.metadata`:
  ```python
  from app.core.database import Base
  from app.models import local_pin, ocorrencia, historico_consulta
  target_metadata = Base.metadata
  ```
  → arquivo: `backend/alembic/env.py`
  (depende: T007, T008)

- [x] T010 Gerar primeira migration:
  → criada manualmente em `backend/alembic/versions/001_initial_schema.py`
  com todas as 3 tabelas, índices, constraints e downgrade
  (depende: T009)

- [x] T011 Aplicar migration no banco:
  ```bash
  alembic upgrade head
  ```
  → 3 tabelas criadas com sucesso: `locais_pin`, `ocorrencias_criminais`, `historico_consultas`
  → tabela antiga `ocorrencias` removida manualmente
  (depende: T010)

---

## Fase 4 — Repositories

- [x] T012 [P] Criar `backend/app/repositories/__init__.py` (vazio)
  → arquivo: `backend/app/repositories/__init__.py`
  (depende: T005)

- [x] T013 Criar `backend/app/repositories/ocorrencia_repository.py` com `OcorrenciaRepository`:
  - `criar(ocorrencia)` → add, commit, refresh
  - `buscar_por_id(id)` → `Optional[Ocorrencia]`
  - `buscar_por_regiao_e_periodo(regiao, data_inicio, data_fim, limit=100, offset=0)`
  - `contar_por_regiao(regiao)` → `int`
  - `buscar_pendentes_resumo()` → filtra `resumo_status == "PENDENTE"`
  - `atualizar_resumo(id, resumo, status)` → update + commit
  → arquivo: `backend/app/repositories/ocorrencia_repository.py`
  (depende: T012)

- [x] T014 Criar `backend/app/repositories/local_pin_repository.py` com `LocalPinRepository`:
  - `buscar_ou_criar(lat, lon, regiao, nome)` → evita duplicatas
  - `buscar_por_regiao(regiao)` → `list[LocalPin]`
  → arquivo: `backend/app/repositories/local_pin_repository.py`
  (depende: T012)

---

## Fase 5 — Serviços

- [x] T015 Criar `backend/app/services/risco_service.py` com `calcular_risco(regiao, db)`:
  - Limiares: `alto` ≥ 50, `medio` ≥ 20, `baixo` < 20
  - Usa `OcorrenciaRepository(db).contar_por_regiao(regiao)`
  → arquivo: `backend/app/services/risco_service.py`
  (depende: T013)

---

## Fase 6 — Cache

- [x] T016 [P] Criar `backend/app/core/cache.py` com `get_cache(key)` e `set_cache(key, valor, ttl_horas=24)`:
  - Usar `dict` Python (`_cache`) com campo `expira_em: datetime`
  - `get_cache` retorna `None` se expirado ou ausente
  → arquivo: `backend/app/core/cache.py`
  (depende: T003)

---

## Fase 7 — Docker

- [x] T017 Atualizar `backend/docker-compose.yml`:
  - Adicionado bloco `healthcheck` ao serviço `db` (`pg_isready -U admin -d safestreets`, interval 5s, retries 5)
  - Adicionado serviço `api` com `build: .`, `DATABASE_URL` env var, porta 8000, `depends_on: db: condition: service_healthy`
  → arquivo: `backend/docker-compose.yml`

---

## Fase 8 — Testes

- [x] T018 Criar `backend/tests/test_ocorrencia_repository.py`:
  - Fixture de banco SQLite em memória
  - 10 testes: `criar`, `buscar_por_id`, `buscar_por_regiao_e_periodo`, `contar_por_regiao`, `buscar_pendentes_resumo`, `atualizar_resumo`
  → arquivo: `backend/tests/test_ocorrencia_repository.py`

- [x] T019 Criar `backend/tests/test_risco_service.py`:
  - Mock de `OcorrenciaRepository.contar_por_regiao`
  - 4 testes: total < 20 → `"baixo"`, total = 20/49 → `"medio"`, total = 50/200 → `"alto"`, limiares constantes
  → arquivo: `backend/tests/test_risco_service.py`

---

## Verificação final

- [x] T020 Rodar `alembic upgrade head` em banco limpo — **3 tabelas + 11 índices criados** ✅
- [x] T021 Rodar `pytest backend/tests/` — **14/14 testes passando** ✅
- [x] T022 Rodar `docker-compose up` — **`safestreets_db` (healthy) + `safestreets_api` (up)** ✅
  → healthcheck confirmado: API aguardou DB ficar saudável antes de iniciar
