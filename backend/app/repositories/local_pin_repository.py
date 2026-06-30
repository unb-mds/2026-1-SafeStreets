from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.local_pin import LocalPin


class LocalPinRepository:

    def __init__(self, db: Session):
        self.db = db

    def buscar_ou_criar(
        self,
        lat: float,
        lon: float,
        regiao: str,
        nome: str | None = None,
        tipo: str = "centroide",
    ) -> LocalPin:
        """
        Retorna o LocalPin existente para as coordenadas e região informadas
        ou cria um novo, evitando duplicatas.
        """
        existente = (
            self.db.query(LocalPin)
            .filter(
                LocalPin.regiao_administrativa == regiao,
                LocalPin.latitude == Decimal(str(lat)),
                LocalPin.longitude == Decimal(str(lon)),
            )
            .first()
        )
        if existente:
            return existente

        novo = LocalPin(
            latitude=lat,
            longitude=lon,
            regiao_administrativa=regiao,
            nome_regiao=nome,
            tipo_localizacao=tipo,
        )
        self.db.add(novo)
        self.db.commit()
        self.db.refresh(novo)
        return novo

    def buscar_por_regiao(self, regiao: str) -> list[LocalPin]:
        """Retorna todos os pins de uma Região Administrativa."""
        return (
            self.db.query(LocalPin)
            .filter(LocalPin.regiao_administrativa == regiao)
            .all()
        )

    def buscar_por_id(self, pin_id: int) -> LocalPin | None:
        """Retorna um LocalPin pelo id ou None."""
        return self.db.query(LocalPin).filter(LocalPin.id == pin_id).first()
