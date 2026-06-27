from fastapi import FastAPI
from app.routes import health, ocorrencias, admin

app = FastAPI(
    title="SafeStreets API",
    description="API para o projeto SafeStreets."
)

# Inclui os routers
app.include_router(health.router)
app.include_router(ocorrencias.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "Bem-vindo ao Backend do SafeStreets!"}