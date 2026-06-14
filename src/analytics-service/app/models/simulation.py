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
    # Single market-factor correlation between asset classes (0 = independent, 1 = fully correlated).
    # Default 0.3 is a pragmatic approximation for Indian multi-asset portfolios.
    market_correlation: float = Field(default=0.3, ge=0.0, le=1.0)


class GoalSimulationResponse(BaseModel):
    probability_of_success: float  # 0–100
    p10_corpus: float
    p50_corpus: float
    p90_corpus: float
