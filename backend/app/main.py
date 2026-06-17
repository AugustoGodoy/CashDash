from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import cotacoes

# Instância principal do FastAPI com metadados para o Swagger UI gerado automaticamente
app = FastAPI(
    title="Cash Dash API",
    description="API de cotações de moedas integrada à Frankfurter (dados do Banco Central Europeu)",
    version="1.0.0",
)

# CORS liberado para o frontend React (em dev roda em localhost:5173 via Vite,
# em produção o Nginx faz o proxy — mas mantemos aqui como boa prática)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Registra o router de cotações sob o prefixo /api/v1
app.include_router(cotacoes.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health_check():
    """Endpoint de health check usado pelo Docker para verificar se o serviço está vivo."""
    return {"status": "ok"}
