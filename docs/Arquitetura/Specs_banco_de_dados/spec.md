# Spec — Banco de Dados: SafeStreets

> O **quê** e o **porquê**. Sem detalhes de implementação (isso vai no `plan.md`).
> Referências: `DATABASE.md`, `docs/arquitetura/API-Contract.md`, `docs/arquitetura/definir-fluxo-de-dados.md`

---

## Problema

O backend possui apenas uma tabela (`ocorrencias`) com 4 campos básicos (`id`, `titulo_noticia`, `latitude`, `longitude`) e credenciais de banco hardcoded no código. Esse estado impossibilita:

- Armazenar ocorrências criminais com todos os dados exigidos pelo contrato de API
- Relacionar ocorrências a pontos geográficos reutilizáveis (pins no mapa)
- Rastrear quando uma região foi consultada pela última vez (cache com TTL)
- Calcular dinamicamente o indicador de risco por Região Administrativa
- Versionar o schema do banco com segurança (sem Alembic, qualquer mudança é manual e irreversível)
- Rodar a aplicação em diferentes ambientes (dev, staging, Docker) sem alterar o código

---

## Objetivos desta entrega

- [ ] Substituir a tabela `ocorrencias` por `ocorrencias_criminais` com o schema completo do contrato de API
- [ ] Criar a tabela `locais_pin` para representar pontos geográficos únicos (centroides de RA)
- [ ] Criar a tabela `historico_consultas` para implementar o cache espacial com TTL de 24h
- [ ] Mover a URL de conexão para variável de ambiente `DATABASE_URL`
- [ ] Inicializar o Alembic e gerar a primeira migration com as 3 tabelas
- [ ] Implementar o Repository Pattern para todo acesso ao banco
- [ ] Implementar o cálculo dinâmico de risco por contagem de ocorrências na RA
- [ ] Adicionar healthcheck ao Docker Compose e subir o serviço de API junto ao banco

---

## Requisitos cobertos

- **RNF-DB-01 — Schema completo:** `ocorrencias_criminais` deve ter todos os campos definidos no contrato de API (`resumo_gemini`, `risco_nivel`, `resumo_status`, `fonte_url`, `locais_pin_id`, etc.)
- **RNF-DB-02 — Isolamento de ambiente:** credenciais nunca devem ser hardcoded; usar `os.getenv("DATABASE_URL")`
- **RNF-DB-03 — Migrations versionadas:** toda mudança de schema deve ser registrada via Alembic
- **RNF-DB-04 — Cache espacial:** `historico_consultas` deve evitar consultas repetidas ao feed RSS enquanto TTL não expirar (padrão 24h)
- **RNF-DB-05 — Indicador de risco:** risco por RA é calculado pela contagem de ocorrências, não armazenado como classificação manual
- **RNF-DB-06 — Separação de responsabilidades:** nenhuma query SQLAlchemy diretamente em routes ou services — tudo via Repository

---

## Critérios de aceitação

### Schema
- **Dado** que o backend inicia, **então** as tabelas `locais_pin`, `ocorrencias_criminais` e `historico_consultas` devem existir no PostgreSQL com todos os campos, constraints e índices definidos no `plan.md`.
- **Dado** que um campo obrigatório está ausente em `ocorrencias_criminais` (ex: `locais_pin_id`), **então** o banco deve rejeitar o INSERT com erro de constraint.

### Variável de ambiente
- **Dado** que `DATABASE_URL` está definida no ambiente, **então** o backend deve usá-la.
- **Dado** que `DATABASE_URL` não está definida, **então** o backend deve usar o fallback `postgresql://admin:123@localhost:5432/safestreets`.

### Migrations
- **Dado** que `alembic upgrade head` é executado em um banco vazio, **então** as 3 tabelas devem ser criadas sem erro.
- **Dado** que `alembic upgrade head` é executado novamente, **então** nenhuma operação deve ocorrer (idempotente).

### Cache
- **Dado** que uma região foi consultada e o `ttl_expiracao` ainda não venceu, **então** o sistema não deve refazer o fetch ao feed RSS.
- **Dado** que o `ttl_expiracao` de uma região expirou, **então** o sistema deve refazer o fetch e atualizar `historico_consultas`.

### Indicador de risco
- **Dado** que uma RA tem ≥ 50 ocorrências, **então** `calcular_risco()` deve retornar `"alto"`.
- **Dado** que uma RA tem entre 20 e 49 ocorrências, **então** deve retornar `"medio"`.
- **Dado** que uma RA tem < 20 ocorrências, **então** deve retornar `"baixo"`.

### Docker
- **Dado** que `docker-compose up` é executado, **então** o serviço `api` deve aguardar o `db` estar saudável (healthcheck) antes de iniciar.

---

## Fora de escopo (NÃO fazer agora)

- Integração real com Redis (cache de produção — aguardando ADR-003)
- TTL variável por Região Administrativa (aguardando ADR-002)
- Autenticação / autorização no banco
- Particionamento ou sharding de tabelas
- Full-text search (PostgreSQL `tsvector`)
- Pipeline ETL real (ingestão de RSS, geocoding, Gemini) — o banco é preparado para receber, mas a ingestão é escopo separado
