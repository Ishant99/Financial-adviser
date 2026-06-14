from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import cas, health, plan, recommendations, simulation, xirr

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
