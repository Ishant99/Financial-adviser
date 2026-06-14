from fastapi import APIRouter

from app.models.simulation import GoalSimulationRequest, GoalSimulationResponse
from app.services.monte_carlo import simulate_goal

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/simulate-goal", response_model=GoalSimulationResponse)
async def simulate_goal_endpoint(req: GoalSimulationRequest) -> GoalSimulationResponse:
    result = simulate_goal(
        target_amount=req.target_amount,
        years_to_goal=req.years_to_goal,
        current_value=req.current_value,
        monthly_contribution=req.monthly_contribution,
        equity_pct=req.equity_pct,
        debt_pct=req.debt_pct,
        gold_pct=req.gold_pct,
        cash_pct=req.cash_pct,
    )
    return GoalSimulationResponse(**result)
