from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, ocorrencias, admin

app = FastAPI(
    title="SafeStreets API",
    description="API para o projeto SafeStreets."
)

# CORS: permite que o frontend (Next.js dev em localhost:3000 ou 3001) consuma a API.
# A porta 3001 é usada automaticamente pelo Next.js quando a 3000 está ocupada.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui os routers
app.include_router(health.router)
app.include_router(ocorrencias.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "Bem-vindo ao Backend do SafeStreets!"}