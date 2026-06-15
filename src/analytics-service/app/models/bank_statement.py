from pydantic import BaseModel, Field


class BankTransaction(BaseModel):
    date: str           # ISO YYYY-MM-DD
    description: str
    debit: float | None = None
    credit: float | None = None
    balance: float | None = None
    category: str


class BankStatementParseResponse(BaseModel):
    bank_name: str
    account_number: str | None = None
    period_from: str | None = None
    period_to: str | None = None
    opening_balance: float | None = None
    transactions: list[BankTransaction] = Field(default_factory=list)
