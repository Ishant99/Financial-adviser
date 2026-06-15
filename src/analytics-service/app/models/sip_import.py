from pydantic import BaseModel, Field


class ImportedSip(BaseModel):
    fund_name: str
    fund_code: str          # AMFI / ISIN code; fallback to empty string
    monthly_amount: float
    sip_date: int           # 1-28
    start_date: str         # ISO YYYY-MM-DD
    benchmark_index: str = "Nifty 500"
    status: str = "Active"  # Active | Paused


class SipImportResponse(BaseModel):
    source: str
    sips: list[ImportedSip] = Field(default_factory=list)
