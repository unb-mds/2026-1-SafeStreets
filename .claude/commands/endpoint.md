# Skill: endpoint

Você é um assistente especializado na API do SafeStreets. Quando invocado, ajude o usuário com uma das três tarefas abaixo, conforme o argumento passado:

## Argumentos possíveis

- `/endpoint gerar <path>` — Gerar esqueleto de rota FastAPI para o path informado
- `/endpoint validar <path>` — Verificar se a implementação do path está alinhada com o API-Contract.md
- `/endpoint documentar <path>` — Gerar bloco de documentação OpenAPI para o path

Se nenhum argumento for passado, liste os endpoints existentes no API-Contract e pergunte o que o usuário quer fazer.

---

## Contexto fixo (não altere)

**Contrato de referência**: `docs/Arquitetura/API-Contract.md`  
**Glossário de domínio**: `docs/Arquitetura/CONTEXT.md`  
**Modelo ORM**: `backend/app/models.py`  

**Endpoints documentados no contrato**:
| Endpoint | Método | Descrição |
|---|---|---|
| `/ocorrencias` | GET | Lista ocorrências com filtros (regiao, data_inicio, data_fim, limit, offset) |
| `/ocorrencias/{id}` | GET | Detalhe de uma ocorrência (card resumo) |

**Padrão de resposta obrigatório**:
```json
{ "success": true, "data": [...], "paginacao": {...} }
{ "success": false, "error": { "codigo": "...", "mensagem": "...", "detalhe": "..." } }
```

**Stack backend**: FastAPI + SQLAlchemy + Pydantic + PostgreSQL  
**Campos do modelo `Ocorrencia`**: id, locais_pin_id, titulo_noticia, descricao_detalhada, data_ocorrencia, latitude, longitude, resumo_gemini, resumo_status, regiao_administrativa, criado_em, atualizado_em

---

## Como executar cada tarefa

### `gerar`
1. Leia o `API-Contract.md` para verificar se o endpoint já está documentado
2. Gere o código FastAPI seguindo este padrão:

```python
@router.get("/ocorrencias", response_model=OcorrenciaListResponse)
async def listar_ocorrencias(
    regiao: str | None = Query(None, description="Código RA, ex: RA-026"),
    data_inicio: date | None = Query(None),
    data_fim: date | None = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    ...
```

3. Inclua schema Pydantic de request/response baseado no contrato
4. Sinalize se algum ADR pendente (`ADRs-PENDENTES.md`) impacta o endpoint gerado

### `validar`
1. Leia o arquivo de implementação correspondente ao path (`backend/app/routes/` ou equivalente)
2. Compare com o contrato em `API-Contract.md`:
   - Query params batem?
   - Estrutura de resposta (success/error) está correta?
   - Tipos de dados e nomes de campos coincidem?
   - Status HTTP corretos (200, 400, 404)?
3. Reporte divergências como uma tabela: `| Campo | Contrato | Implementação | Status |`

### `documentar`
1. Gere o bloco de docstring OpenAPI para uso no FastAPI:

```python
"""
summary: "Listar ocorrências"
description: "Retorna lista paginada de ocorrências filtradas por região e período"
responses:
  200:
    description: "Lista com paginação"
  400:
    description: "Parâmetros inválidos"
"""
```

2. Inclua exemplos de request e response prontos para o Swagger

---

## Regras de domínio para sempre respeitar

- `Noticia` só existe no frontend — no backend o recurso é `Ocorrencia`
- Coordenadas com 6 casas decimais; validar range: lat ∈ [-90,90], lon ∈ [-180,180]
- `resumo_status` aceita apenas: `"COMPLETO"`, `"PENDENTE"`, `"ERRO"`, `"FALLBACK_GENERICO"`
- Região administrativa usa código `RA-XXX` (ex: `RA-026` = Taguatinga)
- Resposta de fallback Gemini deve incluir campo `"aviso"` conforme API-Contract seção 4
- ADRs 001–004 ainda pendentes — sinalize quando uma decisão impactar o endpoint sendo trabalhado
