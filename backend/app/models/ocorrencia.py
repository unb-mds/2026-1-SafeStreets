from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base

# classe inicial basica para teste
class Ocorrencia(Base):
    __tablename__ = "ocorrencias"

# atributos da tabela ocorrencias
    id = Column(Integer, primary_key=True, index=True)
    titulo_noticia = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)