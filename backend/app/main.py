import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import admin, health, ocorrencias

app = FastAPI(
    title="SafeStreets API",
    description="API para o projeto SafeStreets."
)

# CORS: origens liberadas vêm da env CORS_ORIGINS (lista separada por vírgula,
# ex.: "https://safestreets.vercel.app"). O dev local (localhost:3000 e :3001,
# usada pelo Next.js quando a 3000 está ocupada) fica sempre liberado.
# CORS_ORIGIN_REGEX (opcional) cobre os previews dinâmicos da Vercel,
# ex.: r"https://.*\.vercel\.app".
_origins_env = os.getenv("CORS_ORIGINS", "")
_extra_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]
allow_origins = list(
    {"http://localhost:3000", "http://localhost:3001", *_extra_origins}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX") or None,
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