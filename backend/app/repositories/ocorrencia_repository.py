from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ocorrencia import Ocorrencia


class OcorrenciaRepository:

    def __init__(self, db: Session):
        self.db = db

    def criar(self, ocorrencia: Ocorrencia) -> Ocorrencia:
        """Persiste uma nova ocorrência e retorna com id populado."""
        self.db.add(ocorrencia)
        self.db.commit()
        self.db.refresh(ocorrencia)
        return ocorrencia

    def buscar_por_id(self, ocorrencia_id: int) -> Ocorrencia | None:
        """Retorna uma ocorrência pelo id ou None."""
        return (
            self.db.query(Ocorrencia)
            .filter(Ocorrencia.id == ocorrencia_id)
            .first()
        )

    def buscar_por_url(self, fonte_url: str) -> Ocorrencia | None:
        """Busca uma ocorrência pela URL de origem."""
        return (
            self.db.query(Ocorrencia)
            .filter(Ocorrencia.fonte_url == fonte_url)
            .first()
        )

    def listar(self, limit: int = 100, offset: int = 0) -> list[Ocorrencia]:
        """Lista ocorrências, mais recentes primeiro."""
        return (
            self.db.query(Ocorrencia)
            .order_by(Ocorrencia.data_ocorrencia.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    def buscar_por_regiao_e_periodo(
        self,
        regiao: str,
        data_inicio: datetime,
        data_fim: datetime,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Ocorrencia]:
        """Filtra ocorrências por região administrativa e janela de tempo."""
        return (
            self.db.query(Ocorrencia)
            .filter(
                Ocorrencia.regiao_administrativa == regiao,
                Ocorrencia.data_ocorrencia >= data_inicio,
                Ocorrencia.data_ocorrencia <= data_fim,
            )
            .order_by(Ocorrencia.data_ocorrencia.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    def contar_por_regiao(self, regiao: str) -> int:
        """Conta o total de ocorrências em uma RA. Usado pelo risco_service."""
        return (
            self.db.query(func.count(Ocorrencia.id))
            .filter(Ocorrencia.regiao_administrativa == regiao)
            .scalar()
        )

    def buscar_pendentes_resumo(self) -> list[Ocorrencia]:
        """Retorna ocorrências com resumo ainda não gerado pelo Gemini."""
        return (
            self.db.query(Ocorrencia)
            .filter(Ocorrencia.resumo_status == "PENDENTE")
            .all()
        )

    def atualizar_resumo(self, ocorrencia_id: int, resumo: str, status: str) -> None:
        """Atualiza o resumo gerado pela IA e o status correspondente."""
        self.db.query(Ocorrencia).filter(Ocorrencia.id == ocorrencia_id).update(
            {"resumo_gemini": resumo, "resumo_status": status}
        )
        self.db.commit()
