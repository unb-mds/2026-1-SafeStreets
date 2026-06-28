from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, ocorrencias, admin

app = FastAPI(
    title="SafeStreets API",
    description="API para o projeto SafeStreets."
)

# CORS: permite que o frontend (Next.js dev em localhost:3000) consuma a API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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