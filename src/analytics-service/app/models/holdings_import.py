from pydantic import BaseModel, Field


class ImportedHolding(BaseModel):
    scheme_name: str
    amc: str | None = None
    category: str | None = None          # "Equity", "Hybrid", "Debt", etc.
    sub_category: str | None = None
    folio: str | None = None
    units: float
    invested_value: float
    current_value: float
    purchase_nav: float                   # invested_value / units
    current_nav: float                    # current_value / units
    xirr: float | None = None            # decimal (e.g. 0.1035 for 10.35%)


class HoldingsImportResponse(BaseModel):
    source: str                          # "Groww", "Zerodha", "Generic", …
    as_of_date: str | None = None        # ISO date if detected
    total_invested: float
    total_current_value: float
    holdings: list[ImportedHolding] = Field(default_factory=list)
