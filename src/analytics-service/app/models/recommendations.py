from pydantic import BaseModel, Field


class HoldingContext(BaseModel):
    name: str
    type: str
    value: float
    units: float
    purchase_nav: float
    current_nav: float
    gain_loss_pct: float


class GoalContext(BaseModel):
    name: str
    target_amount: float
    target_date: str
    status: str
    probability_of_success: float | None = None


class GenerateRecommendationsRequest(BaseModel):
    total_value: float
    monthly_sip_total: float
    currency: str = "INR"
    holdings: list[HoldingContext] = Field(default_factory=list)
    goals: list[GoalContext] = Field(default_factory=list)


class GeneratedRecommendation(BaseModel):
    type: str  # "Action" | "Watch" | "Win"
    severity: str  # "ActNow" | "Watch" | "Info"
    category: str
    title: str
    body: str


class GenerateRecommendationsResponse(BaseModel):
    recommendations: list[GeneratedRecommendation]
