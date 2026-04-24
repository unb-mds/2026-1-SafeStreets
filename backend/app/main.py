from fastapi import FastAPI
from app.routers import health

app = FastAPI(title="SafeStreets API", description="API para o projeto SafeStreets", version="1.0.0")

app.include_router(health.router)

