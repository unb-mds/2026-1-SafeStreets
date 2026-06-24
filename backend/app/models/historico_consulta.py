from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class HistoricoConsulta(Base):
    __tablename__ = "historico_consultas"

    id                           = Column(Integer, primary_key=True, index=True)
    locais_pin_id                = Column(
        Integer, ForeignKey("locais_pin.id", ondelete="CASCADE")
    )

    timestamp_ultima_atualizacao = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    ttl_expiracao                = Column(DateTime(timezone=True), nullable=False)
    raio_geografico              = Column(String(100))           # ex: "bbox:-15.8,-48.1,-15.7,-47.9"
    total_ocorrencias_cached     = Column(Integer, default=0)
    criado_em                    = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamento
    local_pin = relationship("LocalPin", back_populates="historico_consultas")
