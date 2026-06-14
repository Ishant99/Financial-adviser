from pydantic import BaseModel


class CashFlow(BaseModel):
    date: str   # ISO date string YYYY-MM-DD
    amount: float  # negative = outflow, positive = inflow


class XirrRequest(BaseModel):
    cashflows: list[CashFlow]


class XirrResponse(BaseModel):
    xirr: float  # annualised rate, e.g. 0.123 = 12.3%
