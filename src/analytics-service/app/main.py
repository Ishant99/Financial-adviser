from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import bank_statement, cas, health, holdings_import, plan, recommendations, simulation, sip_import, xirr

app = FastAPI(
    title="FinAdvisor Analytics Service",
    version="0.1.0",
    description="Python analytics service: CAS parsing, XIRR computation, Monte Carlo simulation",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://api:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(cas.router)
app.include_router(recommendations.router)
app.include_router(simulation.router)
app.include_router(xirr.router)
app.include_router(plan.router)
app.include_router(bank_statement.router)
app.include_router(holdings_import.router)
app.include_router(sip_import.router)
