import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Lê da variável de ambiente; fallback para desenvolvimento local
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:123@localhost:5432/safestreets"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # testa conexão antes de usar (evita conexões mortas)
    pool_size=10,         # conexões simultâneas no pool
    max_overflow=20,      # conexões extras em pico
    echo=False,           # True apenas em debug/dev
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency Injection para rotas FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()