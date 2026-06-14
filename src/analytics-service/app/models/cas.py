from pydantic import BaseModel, Field


class CasHolding(BaseModel):
    fund_name: str
    fund_code: str  # ISIN (or AMFI code fallback)
    units: float
    nav: float
    value: float
    folio: str
    isin: str | None = None
    # ISO date (YYYY-MM-DD) of the earliest purchase transaction found in the CAS statement.
    # Null when the statement does not include transaction history for this fund.
    earliest_purchase_date: str | None = None


class CasParseResponse(BaseModel):
    investor_name: str
    statement_date: str  # ISO date string, end of statement period
    total_value: float
    holdings: list[CasHolding] = Field(default_factory=list)
