import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.monte_carlo import simulate_goal

client = TestClient(app)

# ── Unit tests for simulate_goal ─────────────────────────────────────────────

def test_high_probability_long_horizon():
    """₹1L monthly SIP for 30 years targeting ₹10Cr should have high probability."""
    result = simulate_goal(
        target_amount=10_000_000,
        years_to_goal=30,
        current_value=0,
        monthly_contribution=10_000,
        equity_pct=80, debt_pct=15, gold_pct=5, cash_pct=0,
        seed=42,
    )
    assert result["probability_of_success"] > 50


def test_impossible_goal_low_probability():
    """₹10L target in 1 year with ₹1K/month starting from 0 should be near 0%."""
    result = simulate_goal(
        target_amount=10_000_000,
        years_to_goal=1,
        current_value=0,
        monthly_contribution=1_000,
        equity_pct=60, debt_pct=30, gold_pct=5, cash_pct=5,
        seed=42,
    )
    assert result["probability_of_success"] < 5


def test_percentile_ordering():
    """P10 <= P50 <= P90 always holds."""
    result = simulate_goal(
        target_amount=5_000_000,
        years_to_goal=15,
        current_value=100_000,
        monthly_contribution=5_000,
        equity_pct=70, debt_pct=20, gold_pct=5, cash_pct=5,
        seed=0,
    )
    assert result["p10_corpus"] <= result["p50_corpus"] <= result["p90_corpus"]


def test_corpus_non_negative():
    """Final corpus must be >= 0 even with extreme parameters."""
    result = simulate_goal(
        target_amount=1_000_000,
        years_to_goal=0.1,  # very short — 1–2 months
        current_value=0,
        monthly_contribution=500,
        equity_pct=100, debt_pct=0, gold_pct=0, cash_pct=0,
        seed=7,
    )
    assert result["p10_corpus"] >= 0


# ── API endpoint tests ────────────────────────────────────────────────────────

def test_api_simulate_goal_returns_200():
    payload = {
        "target_amount": 5_000_000,
        "years_to_goal": 20,
        "current_value": 200_000,
        "monthly_contribution": 10_000,
        "equity_pct": 70, "debt_pct": 20, "gold_pct": 5, "cash_pct": 5,
    }
    response = client.post("/simulation/simulate-goal", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["probability_of_success"] <= 100
    assert data["p10_corpus"] >= 0
    assert data["p50_corpus"] >= data["p10_corpus"]
    assert data["p90_corpus"] >= data["p50_corpus"]


def test_api_simulate_goal_invalid_pct():
    """equity_pct > 100 should fail validation."""
    payload = {
        "target_amount": 1_000_000,
        "years_to_goal": 10,
        "current_value": 0,
        "monthly_contribution": 5_000,
        "equity_pct": 150, "debt_pct": 0, "gold_pct": 0, "cash_pct": 0,
    }
    response = client.post("/simulation/simulate-goal", json=payload)
    assert response.status_code == 422
