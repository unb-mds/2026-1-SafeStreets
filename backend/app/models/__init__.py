# Importa todos os models para garantir que o Alembic os detecte
# e para que os relacionamentos do SQLAlchemy funcionem corretamente.
from app.models.local_pin import LocalPin
from app.models.ocorrencia import Ocorrencia
from app.models.historico_consulta import HistoricoConsulta

__all__ = ["LocalPin", "Ocorrencia", "HistoricoConsulta"]
