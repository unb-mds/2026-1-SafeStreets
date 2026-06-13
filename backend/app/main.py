from fastapi import FastAPI
from app.routes import health

app = FastAPI(
    title="SafeStreets API",
    description="API para o projeto SafeStreets."
)

# Inclui o router health
app.include_router(health.router)

@app.get("/")
async def root():
    return {"message": "Bem-vindo ao Backend do SafeStreets!"}