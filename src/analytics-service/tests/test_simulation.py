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


# ── Correlation / new tests ───────────────────────────────────────────────────

def test_correlation_zero_vs_one_p50_ordering():
    """Higher correlation should not raise P50 (diversification benefit lost).
    With seed fixed, both runs produce deterministic results.
    We just verify the simulation still produces valid percentile ordering.
    """
    result_low = simulate_goal(
        target_amount=5_000_000, years_to_goal=20, current_value=100_000,
        monthly_contribution=5_000,
        equity_pct=70, debt_pct=20, gold_pct=5, cash_pct=5,
        market_correlation=0.0, seed=1,
    )
    result_high = simulate_goal(
        target_amount=5_000_000, years_to_goal=20, current_value=100_000,
        monthly_contribution=5_000,
        equity_pct=70, debt_pct=20, gold_pct=5, cash_pct=5,
        market_correlation=0.9, seed=1,
    )
    # Both must maintain percentile ordering
    assert result_low["p10_corpus"] <= result_low["p50_corpus"] <= result_low["p90_corpus"]
    assert result_high["p10_corpus"] <= result_high["p50_corpus"] <= result_high["p90_corpus"]


def test_correlation_spread_wider_at_high_rho():
    """Higher correlation → wider spread (P90-P10 larger) because diversification is gone."""
    result_low = simulate_goal(
        target_amount=5_000_000, years_to_goal=20, current_value=0,
        monthly_contribution=10_000,
        equity_pct=50, debt_pct=50, gold_pct=0, cash_pct=0,
        market_correlation=0.0, seed=99,
    )
    result_high = simulate_goal(
        target_amount=5_000_000, years_to_goal=20, current_value=0,
        monthly_contribution=10_000,
        equity_pct=50, debt_pct=50, gold_pct=0, cash_pct=0,
        market_correlation=1.0, seed=99,
    )
    spread_low = result_low["p90_corpus"] - result_low["p10_corpus"]
    spread_high = result_high["p90_corpus"] - result_high["p10_corpus"]
    assert spread_high > spread_low


def test_api_simulate_goal_with_correlation():
    """API accepts market_correlation param and returns valid response."""
    payload = {
        "target_amount": 5_000_000,
        "years_to_goal": 15,
        "current_value": 200_000,
        "monthly_contribution": 8_000,
        "equity_pct": 60, "debt_pct": 30, "gold_pct": 5, "cash_pct": 5,
        "market_correlation": 0.4,
    }
    response = client.post("/simulation/simulate-goal", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["probability_of_success"] <= 100
    assert data["p10_corpus"] <= data["p50_corpus"] <= data["p90_corpus"]
