from sqlalchemy import (
    Column, Integer, String, Text, Numeric,
    DateTime, ForeignKey, CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Ocorrencia(Base):
    __tablename__ = "ocorrencias_criminais"

    id                    = Column(Integer, primary_key=True, index=True)
    locais_pin_id         = Column(
        Integer, ForeignKey("locais_pin.id", ondelete="CASCADE"), nullable=False
    )

    # Conteúdo da notícia
    titulo_noticia        = Column(String(500), nullable=False, index=True)
    descricao_detalhada   = Column(Text)
    fonte_url             = Column(String(2048))

    # Dados geográficos (redundantes para queries rápidas sem JOIN)
    latitude              = Column(Numeric(9, 6), nullable=False)
    longitude             = Column(Numeric(9, 6), nullable=False)
    regiao_administrativa = Column(String(10), nullable=False, index=True)

    # Resumo gerado pela IA
    resumo_gemini         = Column(Text)
    resumo_status         = Column(String(20), default="PENDENTE")

    # Indicador de risco calculado pelo risco_service
    risco_nivel           = Column(String(10), default="baixo")

    # Timestamps
    data_ocorrencia       = Column(DateTime(timezone=True), nullable=False)
    criado_em             = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em         = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relacionamento
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