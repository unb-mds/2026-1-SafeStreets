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

    # Relacionamentos
    ocorrencias         = relationship("Ocorrencia", back_populates="local_pin")
    historico_consultas = relationship("HistoricoConsulta", back_populates="local_pin")

    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90 AND 90",    name="chk_latitude"),
        CheckConstraint("longitude BETWEEN -180 AND 180", name="chk_longitude"),
    )
