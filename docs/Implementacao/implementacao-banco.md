# Issue: Implementação do Banco de Dados com PostgreSQL + FastAPI 

## Descrição
Configuração e implementação da infraestrutura de banco de dados do projeto SafeStreets utilizando PostgreSQL em ambiente isolado (Docker). A integração com o backend foi estabelecida utilizando SQLAlchemy (ORM) e o driver Psycopg2, garantindo a persistência e manipulação estruturada dos dados de ocorrências que serão consumidos pelo FastAPI.

## Objetivos
- [x] Configurar ambiente PostgreSQL padronizado para a equipe
- [x] Integrar banco de dados com backend Python
- [x] Definir modelos de tabelas iniciais usando ORM
- [ ] Preparar estrutura para futuras migrations (Ex: Alembic - *Próximo passo*)

## Tarefas
- [x] Configurar infraestrutura via contêiner (`docker-compose.yml` com a imagem `postgres:15-alpine` e volume persistente).
- [x] Criar ambiente virtual (`.venv`) e mapear dependências no `requirements.txt`:
  - `fastapi`
  - `sqlalchemy`
  - `psycopg2-binary` (Driver de comunicação)
- [x] Configurar o motor de conexão e credenciais com o banco (`database.py`).
- [x] Criar sessão de comunicação do banco (`SessionLocal`).
- [x] Definir modelos iniciais com SQLAlchemy (`models.py` -> Tabela `Ocorrencia` contendo título, latitude e longitude).
- [x] Criar script de teste e povoamento inicial (`teste.py`) para validar a geração das tabelas via `Base.metadata.create_all`.
- [x] Validar persistência inserindo dados simulados e acessando via Client SGBD.
- [ ] Criar endpoint no FastAPI (ex: `GET /ocorrencias`) para expor os dados salvos.

## Tecnologias Envolvidas
- PostgreSQL 15
- Docker / Docker Compose
- Python / FastAPI
- SQLAlchemy
- Psycopg2

## Observações
- A escolha pelo Docker garante que todos os membros da equipe subam o banco de dados localmente sem conflitos de versão ou problemas de sistema operacional.
- O padrão de organização modular já está sendo seguido (separação entre conexão e modelagem).
- **Atenção:** As credenciais atuais de desenvolvimento estão temporariamente fixadas no código para facilitar o setup inicial da equipe. Devemos migrar esses dados sensíveis para um arquivo `.env` antes do deploy em produção.

### Responsável
Jorge e Edson

### Prazo
- 02/05/2026
