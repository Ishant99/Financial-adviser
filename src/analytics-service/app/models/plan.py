from pydantic import BaseModel, Field


class MonthlyPlanContext(BaseModel):
    total_income: float
    total_expenses: float
    total_sip: float
    net_worth: float
    active_goal_count: int
    top_expense_categories: list[dict] = Field(default_factory=list)  # [{category, amount}]
    goals: list[dict] = Field(default_factory=list)                   # [{name, target, probability}]


class MonthlyPlanSection(BaseModel):
    title: str
    amount: float | None = None
    narrative: str


class MonthlyPlanResponse(BaseModel):
    surplus: float
    sections: list[MonthlyPlanSection]
    overall_narrative: str
