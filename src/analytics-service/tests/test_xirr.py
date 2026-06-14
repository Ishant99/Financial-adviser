from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.xirr import xirr

client = TestClient(app)


# ── Unit tests ──────────────────────────────────────────────────────────────

def test_simple_annual_return():
    """₹1L invested, ₹1.12L back in exactly 1 year → XIRR ≈ 12%."""
    cashflows = [(date(2023, 1, 1), -100_000.0), (date(2024, 1, 1), 112_000.0)]
    result = xirr(cashflows)
    assert abs(result - 0.12) < 0.01


def test_monthly_sip_xirr():
    """₹10K/month for 12 months → ₹1.32L at end, should give positive XIRR."""
    cashflows = [(date(2023, m, 1), -10_000.0) for m in range(1, 13)]
    cashflows.append((date(2024, 1, 1), 132_000.0))
    result = xirr(cashflows)
    assert result > 0


def test_zero_growth_xirr():
    """Same amount out and in → XIRR ≈ 0."""
    cashflows = [(date(2023, 1, 1), -100_000.0), (date(2024, 1, 1), 100_000.0)]
    result = xirr(cashflows)
    assert abs(result) < 0.01


def test_negative_return():
    """₹1L invested, only ₹90K returned → negative XIRR."""
    cashflows = [(date(2023, 1, 1), -100_000.0), (date(2024, 1, 1), 90_000.0)]
    result = xirr(cashflows)
    assert result < 0


def test_single_cashflow_returns_zero():
    result = xirr([(date(2023, 1, 1), -100_000.0)])
    assert result == 0.0


# ── API tests ────────────────────────────────────────────────────────────────

def test_api_compute_xirr():
    payload = {
        "cashflows": [
            {"date": "2023-01-01", "amount": -100000.0},
            {"date": "2024-01-01", "amount": 112000.0},
        ]
    }
    response = client.post("/xirr/compute", json=payload)
    assert response.status_code == 200
    assert abs(response.json()["xirr"] - 0.12) < 0.01


def test_api_too_few_cashflows():
    response = client.post("/xirr/compute", json={"cashflows": [{"date": "2023-01-01", "amount": -1000.0}]})
    assert response.status_code == 422
