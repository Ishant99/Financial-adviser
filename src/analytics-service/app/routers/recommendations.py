import os

import anthropic
from fastapi import APIRouter, HTTPException

from app.models.recommendations import (
    GeneratedRecommendation,
    GenerateRecommendationsRequest,
    GenerateRecommendationsResponse,
)

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

_TOOL = {
    "name": "add_recommendation",
    "description": "Add a specific financial recommendation for the investor.",
    "input_schema": {
        "type": "object",
        "properties": {
            "type": {
                "type": "string",
                "enum": ["Action", "Watch", "Win"],
                "description": "Action=requires user action, Watch=monitor, Win=positive highlight",
            },
            "severity": {
                "type": "string",
                "enum": ["ActNow", "Watch", "Info"],
                "description": "ActNow=urgent, Watch=monitor, Info=informational/positive",
            },
            "category": {
                "type": "string",
                "description": "Short label e.g. 'Emergency Fund', 'Asset Allocation', 'Goal Progress'",
            },
            "title": {"type": "string", "description": "Concise title, max 80 chars"},
            "body": {
                "type": "string",
                "description": "2-3 sentence explanation. Use only figures already in the portfolio data.",
            },
        },
        "required": ["type", "severity", "category", "title", "body"],
    },
}

_SYSTEM_PROMPT = """You are a personal financial advisor for Indian retail investors.
Analyse the portfolio data provided and generate 3–5 specific, actionable recommendations.

Rules:
- ONLY use figures that appear in the portfolio data. Do NOT invent or estimate any numbers.
- Write in plain English. Avoid jargon.
- For each recommendation call the add_recommendation tool exactly once.
- Cover a mix of areas: emergency fund, asset allocation, SIP health, goal progress, top performers.
- Severity guide: ActNow = something needs fixing now; Watch = monitor; Info = good news or FYI."""


def _build_portfolio_prompt(req: GenerateRecommendationsRequest) -> str:
    fmt = lambda n: f"₹{n:,.0f}"  # noqa: E731

    lines = [
        f"Portfolio total value: {fmt(req.total_value)}",
        f"Monthly SIP commitment: {fmt(req.monthly_sip_total)}",
        "",
        "Holdings:",
    ]
    for h in req.holdings:
        direction = "gain" if h.gain_loss_pct >= 0 else "loss"
        lines.append(
            f"  - {h.name} ({h.type}): {fmt(h.value)}, "
            f"{h.units:.2f} units @ NAV {fmt(h.current_nav)}, "
            f"{abs(h.gain_loss_pct):.1f}% {direction} vs purchase NAV {fmt(h.purchase_nav)}"
        )

    lines += ["", "Goals:"]
    for g in req.goals:
        prob = f", {g.probability_of_success:.0f}% probability" if g.probability_of_success is not None else ""
        lines.append(
            f"  - {g.name}: target {fmt(g.target_amount)} by {g.target_date}"
            f" [{g.status}{prob}]"
        )

    return "\n".join(lines)


@router.post("/generate", response_model=GenerateRecommendationsResponse)
async def generate_recommendations(
    req: GenerateRecommendationsRequest,
) -> GenerateRecommendationsResponse:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY is not configured. Set it in the environment to enable AI recommendations.",
        )

    client = anthropic.Anthropic(api_key=api_key)

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            system=_SYSTEM_PROMPT,
            tools=[_TOOL],  # type: ignore[list-item]
            tool_choice={"type": "any"},
            messages=[{"role": "user", "content": _build_portfolio_prompt(req)}],
        )
    except anthropic.APIError as exc:
        raise HTTPException(status_code=502, detail=f"Anthropic API error: {exc}") from exc

    recommendations: list[GeneratedRecommendation] = []
    for block in response.content:
        if block.type == "tool_use" and block.name == "add_recommendation":
            inp = block.input
            recommendations.append(
                GeneratedRecommendation(
                    type=inp["type"],
                    severity=inp["severity"],
                    category=inp["category"],
                    title=inp["title"],
                    body=inp["body"],
                )
            )

    return GenerateRecommendationsResponse(recommendations=recommendations)
