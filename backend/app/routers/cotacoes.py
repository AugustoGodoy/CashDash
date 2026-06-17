from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(tags=["cotacoes"])

# URL base da Frankfurter API — gratuita, sem autenticação, dados do BCE
# Novo domínio: api.frankfurter.dev (o antigo api.frankfurter.app foi descontinuado)
# A v1 da API continua disponível em /v1/latest e /v1/{data_inicio}..{data_fim}
FRANKFURTER_BASE = "https://api.frankfurter.dev/v1"

# Moedas exibidas no dashboard (BRL incluído para comparação com o Real)
MOEDAS_PADRAO = ["USD", "EUR", "GBP", "JPY", "CAD", "CHF", "BRL"]


@router.get("/cotacoes")
async def get_cotacoes():
    """
    Retorna as cotações das principais moedas usando EUR como base.
    EUR é a base padrão da Frankfurter, o que evita conversão extra e
    garante maior precisão nos dados retornados pela API.
    """
    moedas_str = ",".join(m for m in MOEDAS_PADRAO if m != "EUR")

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                f"{FRANKFURTER_BASE}/latest",
                params={"from": "EUR", "to": moedas_str},
            )
            response.raise_for_status()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Timeout ao consultar a API de câmbio")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"Erro na API externa: {e.response.status_code}")

    data = response.json()

    # Normaliza a resposta para um formato consistente para o frontend
    cotacoes = [
        {"moeda": moeda, "taxa": taxa, "base": "EUR"}
        for moeda, taxa in data["rates"].items()
    ]
    # Adiciona a própria base com taxa 1.0 para completar o card no dashboard
    cotacoes.insert(0, {"moeda": "EUR", "taxa": 1.0, "base": "EUR"})

    return {
        "base": data["base"],
        "data": data["date"],
        "cotacoes": cotacoes,
    }


@router.get("/cotacoes/{base}")
async def get_cotacoes_por_base(base: str):
    """
    Retorna cotações a partir de uma moeda base escolhida pelo usuário.
    Valida se a moeda é suportada antes de chamar a API externa.
    """
    base = base.upper()
    if base not in MOEDAS_PADRAO:
        raise HTTPException(
            status_code=400,
            detail=f"Moeda '{base}' não suportada. Disponíveis: {MOEDAS_PADRAO}",
        )

    destinos = ",".join(m for m in MOEDAS_PADRAO if m != base)

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                f"{FRANKFURTER_BASE}/latest",
                params={"from": base, "to": destinos},
            )
            response.raise_for_status()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Timeout ao consultar a API de câmbio")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"Erro na API externa: {e.response.status_code}")

    data = response.json()

    cotacoes = [
        {"moeda": moeda, "taxa": taxa, "base": base}
        for moeda, taxa in data["rates"].items()
    ]
    cotacoes.insert(0, {"moeda": base, "taxa": 1.0, "base": base})

    return {
        "base": data["base"],
        "data": data["date"],
        "cotacoes": cotacoes,
    }


@router.get("/historico/{base}")
async def get_historico(base: str):
    """
    Retorna o histórico dos últimos 7 dias para a moeda base informada.
    Usado pelo gráfico de tendência no frontend.
    """
    from datetime import date, timedelta

    base = base.upper()
    if base not in MOEDAS_PADRAO:
        raise HTTPException(
            status_code=400,
            detail=f"Moeda '{base}' não suportada. Disponíveis: {MOEDAS_PADRAO}",
        )

    data_fim = date.today()
    data_inicio = data_fim - timedelta(days=7)

    destinos = ",".join(m for m in MOEDAS_PADRAO if m != base)

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                f"{FRANKFURTER_BASE}/{data_inicio}..{data_fim}",
                params={"from": base, "to": destinos},
            )
            response.raise_for_status()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Timeout ao consultar a API de câmbio")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"Erro na API externa: {e.response.status_code}")

    data = response.json()

    return {
        "base": data["base"],
        "inicio": str(data_inicio),
        "fim": str(data_fim),
        "historico": data["rates"],
    }
