from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

_PAYLOAD = {
    "total_value": 500000.0,
    "monthly_sip_total": 15000.0,
    "currency": "INR",
    "holdings": [
        {
            "name": "Parag Parikh Flexi Cap",
            "type": "MutualFund",
            "value": 300000.0,
            "units": 1200.5,
            "purchase_nav": 220.0,
            "current_nav": 249.9,
            "gain_loss_pct": 13.59,
        }
    ],
    "goals": [
        {
            "name": "Retirement",
            "target_amount": 10000000.0,
            "target_date": "2045-01-01",
            "status": "Active",
            "probability_of_success": 72.0,
        }
    ],
}

_MOCK_TOOL_RESPONSE = MagicMock(
    content=[
        MagicMock(
            type="tool_use",
            name="add_recommendation",
            input={
                "type": "Win",
                "severity": "Info",
                "category": "SIP Health",
                "title": "SIPs on track",
                "body": "Monthly SIP of ₹15,000 is running without gaps.",
            },
        )
    ]
)


def test_generate_returns_recommendations():
    with patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test-key"}):
        with patch("anthropic.Anthropic") as mock_cls:
            mock_cls.return_value.messages.create.return_value = _MOCK_TOOL_RESPONSE
            response = client.post("/recommendations/generate", json=_PAYLOAD)

    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) == 1
    rec = data["recommendations"][0]
    assert rec["type"] == "Win"
    assert rec["severity"] == "Info"
    assert rec["category"] == "SIP Health"


def test_generate_no_api_key_returns_503():
    with patch.dict("os.environ", {}, clear=True):
        # Ensure ANTHROPIC_API_KEY is not set
        import os
        os.environ.pop("ANTHROPIC_API_KEY", None)
        response = client.post("/recommendations/generate", json=_PAYLOAD)

    assert response.status_code == 503
    assert "ANTHROPIC_API_KEY" in response.json()["detail"]


def test_generate_empty_holdings():
    with patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test-key"}):
        with patch("anthropic.Anthropic") as mock_cls:
            mock_cls.return_value.messages.create.return_value = MagicMock(content=[])
            response = client.post(
                "/recommendations/generate",
                json={"total_value": 0.0, "monthly_sip_total": 0.0},
            )

    assert response.status_code == 200
    assert response.json()["recommendations"] == []


def test_generate_anthropic_error_returns_502():
    import anthropic as _anthropic

    with patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test-key"}):
        with patch("anthropic.Anthropic") as mock_cls:
            mock_cls.return_value.messages.create.side_effect = _anthropic.APIError(
                message="Rate limited",
                request=MagicMock(),
                body=None,
            )
            response = client.post("/recommendations/generate", json=_PAYLOAD)

    assert response.status_code == 502
    assert "Anthropic API error" in response.json()["detail"]
