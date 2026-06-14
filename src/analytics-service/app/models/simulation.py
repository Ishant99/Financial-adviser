from pydantic import BaseModel, Field


class GoalSimulationRequest(BaseModel):
    target_amount: float
    years_to_goal: float
    current_value: float = 0.0
    monthly_contribution: float = 0.0
    equity_pct: float = Field(ge=0, le=100)
    debt_pct: float = Field(ge=0, le=100)
    gold_pct: float = Field(ge=0, le=100)
    cash_pct: float = Field(ge=0, le=100)


class GoalSimulationResponse(BaseModel):
    probability_of_success: float  # 0–100
    p10_corpus: float
    p50_corpus: float
    p90_corpus: float
