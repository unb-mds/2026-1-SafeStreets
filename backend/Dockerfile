FROM python:3.11-slim

WORKDIR /app

# Instala dependências do sistema necessárias para o psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação
COPY . .

# Porta exposta pelo FastAPI
EXPOSE 8000

# Comando padrão (sobrescrito pelo docker-compose.yml no dev local).
# Aplica as migrations e sobe na porta que o host injeta ($PORT no Render),
# com fallback 8000 fora dele. Shell form para o ${PORT} expandir.
CMD sh -c "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
