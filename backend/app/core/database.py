from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# A URL de conexão para o Docker rodando na sua máquina
SQLALCHEMY_DATABASE_URL = "postgresql://admin:123@localhost:5432/safestreets"

# conexao entre os comandos da database e o postgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)
# sessao criada para acessar o banco de dados quando um usuário acessar o site
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependência usada pelas rotas: abre uma sessão por requisição e fecha no fim.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()