import io
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


def _mock_cas_data() -> dict:
    return {
        "investor_info": {"name": "Ishant Goyal", "email": "test@example.com"},
        "statement_period": {"from": "2024-01-01", "to": "2024-12-31"},
        "folios": [
            {
                "folio": "9876543210",
                "PAN": "ABCDE1234F",
                "KYC": "OK",
                "schemes": [
                    {
                        "scheme": "Mirae Asset Large Cap Fund - Direct Growth",
                        "isin": "INF769K01DK7",
                        "close_units": 150.0,
                        "nav": 45.67,
                        "valuation": {"date": "2024-12-31", "nav": 45.67, "value": 6850.50},
                    },
                    {
                        "scheme": "PPFAS Flexi Cap Fund - Direct Growth",
                        "isin": "INF879O01019",
                        "close_units": 0.0,  # closed position — should be excluded
                        "nav": 80.0,
                        "valuation": {"date": "2024-12-31", "nav": 80.0, "value": 0.0},
                    },
                ],
            }
        ],
    }


@patch("app.routers.cas.casparser.read_cas_pdf")
def test_parse_cas_happy_path(mock_parse):
    mock_parse.return_value = _mock_cas_data()

    pdf_bytes = b"%PDF-1.4 dummy"
    response = client.post(
        "/parse-cas",
        files={"file": ("cas.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"password": ""},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["investor_name"] == "Ishant Goyal"
    assert body["statement_date"] == "2024-12-31"
    assert len(body["holdings"]) == 1  # zero-unit position filtered out
    holding = body["holdings"][0]
    assert holding["fund_name"] == "Mirae Asset Large Cap Fund - Direct Growth"
    assert holding["isin"] == "INF769K01DK7"
    assert holding["units"] == pytest.approx(150.0)
    assert body["total_value"] == pytest.approx(6850.50)


@patch("app.routers.cas.casparser.read_cas_pdf")
def test_parse_cas_wrong_password(mock_parse):
    mock_parse.side_effect = Exception("Incorrect password")

    response = client.post(
        "/parse-cas",
        files={"file": ("cas.pdf", io.BytesIO(b"%PDF"), "application/pdf")},
        data={"password": "wrongpass"},
    )

    assert response.status_code == 422
    assert "Incorrect password" in response.json()["detail"]


def test_parse_cas_invalid_file_type():
    response = client.post(
        "/parse-cas",
        files={"file": ("statement.xlsx", io.BytesIO(b"PK\x03\x04"), "application/vnd.ms-excel")},
        data={"password": ""},
    )
    assert response.status_code == 422
    assert "PDF" in response.json()["detail"]


@patch("app.routers.cas.casparser.read_cas_pdf")
def test_parse_cas_empty_portfolio(mock_parse):
    mock_parse.return_value = {
        "investor_info": {"name": "New Investor"},
        "statement_period": {"from": "2024-01-01", "to": "2024-12-31"},
        "folios": [],
    }

    response = client.post(
        "/parse-cas",
        files={"file": ("cas.pdf", io.BytesIO(b"%PDF"), "application/pdf")},
        data={"password": ""},
    )
    assert response.status_code == 200
    assert response.json()["holdings"] == []
    assert response.json()["total_value"] == 0.0
