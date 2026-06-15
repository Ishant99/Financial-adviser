import io
import re

import pdfplumber
from fastapi import APIRouter, Form, HTTPException, UploadFile

from app.models.bank_statement import BankStatementParseResponse, BankTransaction

router = APIRouter()

# DD-MM-YYYY
_DATE_RE = re.compile(r"^\d{2}-\d{2}-\d{4}$")

# Keyword → category mapping (checked in order)
_CATEGORY_RULES: list[tuple[re.Pattern, str]] = [
    (re.compile(r"SWIGGY|ZOMATO|BLINKIT|DUNZO|DOMINOS|BURGER|MCDONALD|KFC|PIZZA", re.I), "Food"),
    (re.compile(r"UBER|OLA|RAPIDO|IRCTC|MAKEMYTRIP|GOIBIBO|REDBUS|YATRA", re.I), "Transport"),
    (re.compile(r"SALARY|PAYROLL|STIPEND|WAGES", re.I), "Income"),
    (re.compile(r"\bEMI\b|LOAN|HOUSING.*LOAN|HOME.*LOAN|CAR.*LOAN|PERSONAL.*LOAN", re.I), "EMI"),
    (re.compile(r"ELECTRICITY|BESCOM|MSEDCL|BSES|TATAPOWER|ADANI.*ELEC|TORRENT.*POWER", re.I), "Utilities"),
    (re.compile(r"AMAZON|FLIPKART|MYNTRA|NYKAA|MEESHO|AJIO|SNAPDEAL", re.I), "Shopping"),
    (re.compile(r"NETFLIX|SPOTIFY|HOTSTAR|PRIME\s*VIDEO|YOUTUBE|DISNEY", re.I), "Entertainment"),
    (re.compile(r"HOSPITAL|PHARMACY|MEDPLUS|APOLLO|FORTIS|NETMEDS|1MG|HEALTHKART", re.I), "Healthcare"),
    # Investments — note "MUTUAL FU" matches the truncated "MUTUAL FU/HDFC BANK" seen in
    # UPI narrations, and "/P2V/" is the UPI "verified merchant" marker banks use for MF/SIP.
    (re.compile(r"MUTUAL\s*FU|\bSIP\b|ELSS|ZERODHA|GROWW|KUVERA|\bCOIN\b|\bNAVI\b|PAYTM.*MONEY|/P2V/", re.I), "Investment"),
    (re.compile(r"ATM|CASH.*WITHDRAWAL|CASH.*WDL", re.I), "Cash"),
    (re.compile(r"INTEREST|INT\.?\s*CR|CREDIT.*INT", re.I), "Interest"),
    (re.compile(r"CREDIT BALANCE REFUND|REFUND", re.I), "Refund"),
    # Money movement (NOT spending): person/self UPI transfers (P2A) and bank transfers.
    # NOTE: P2M (pay-to-merchant) is deliberately NOT here — those are real purchases and
    # fall through to "Other" so they count as spending.
    (re.compile(r"/P2A/|\bNEFT\b|\bRTGS\b|\bIMPS\b|FUND\s*TRANSFER|ACCOUNT\s*TRANSFER", re.I), "Transfer"),
]


def _categorise(description: str) -> str:
    for pattern, category in _CATEGORY_RULES:
        if pattern.search(description):
            return category
    return "Other"


def _parse_amount(s: str | None) -> float | None:
    if not s or not s.strip():
        return None
    cleaned = s.replace(",", "").strip()
    try:
        v = float(cleaned)
        return v if v > 0 else None
    except ValueError:
        return None


def _to_iso(ddmmyyyy: str) -> str | None:
    """DD-MM-YYYY → YYYY-MM-DD"""
    s = ddmmyyyy.strip()
    if not _DATE_RE.match(s):
        return None
    d, m, y = s.split("-")
    return f"{y}-{m}-{d}"


def _detect_bank(text: str) -> str:
    text_lower = text.lower()
    if "axis" in text_lower:
        return "Axis Bank"
    if "hdfc" in text_lower:
        return "HDFC Bank"
    if "icici" in text_lower:
        return "ICICI Bank"
    if "sbi" in text_lower or "state bank" in text_lower:
        return "SBI"
    if "kotak" in text_lower:
        return "Kotak Bank"
    if "yes bank" in text_lower:
        return "Yes Bank"
    if "pnb" in text_lower or "punjab national" in text_lower:
        return "PNB"
    return "Bank"


def _extract_account_number(text: str) -> str | None:
    # "Statement of Axis Account No: 923010060220238" or "A/c No. 12345678"
    m = re.search(r"(?:account\s*no[.:]?\s*|a/c\s*no[.:]?\s*)(\d[\d\s]{6,20})", text, re.I)
    if m:
        return m.group(1).replace(" ", "")
    return None


def _extract_period(text: str) -> tuple[str | None, str | None]:
    # "From: 15-03-2026  To: 15-06-2026"
    m = re.search(r"from[:\s]+(\d{2}-\d{2}-\d{4}).*?to[:\s]+(\d{2}-\d{2}-\d{4})", text, re.I | re.S)
    if m:
        return _to_iso(m.group(1)), _to_iso(m.group(2))
    return None, None


def _extract_opening_balance(text: str) -> float | None:
    m = re.search(r"opening\s+balance[\s\S]{0,60}?([\d,]+\.\d{2})", text, re.I)
    if m:
        return _parse_amount(m.group(1))
    return None


def _parse_rows(rows: list[list[str | None]]) -> list[BankTransaction]:
    """
    Expected column order (Axis Bank):
      0: Tran Date  1: Chq No  2: Particulars  3: Debit  4: Credit  5: Balance  6: Init Br
    We auto-detect the date column by scanning headers.
    """
    if not rows:
        return []

    # Find header row
    header_idx = None
    date_col = debit_col = credit_col = bal_col = desc_col = -1

    for i, row in enumerate(rows):
        cells = [str(c or "").lower().strip() for c in row]
        if any("tran" in c and "date" in c for c in cells) or any(c == "date" for c in cells):
            header_idx = i
            for j, c in enumerate(cells):
                if "date" in c:
                    date_col = j
                elif "debit" in c:
                    debit_col = j
                elif "credit" in c:
                    credit_col = j
                elif "balance" in c:
                    bal_col = j
                elif "particular" in c or "description" in c or "narration" in c:
                    desc_col = j
            break

    # Fallback to Axis Bank column order if header not found
    if header_idx is None or date_col < 0:
        date_col, desc_col, debit_col, credit_col, bal_col = 0, 2, 3, 4, 5

    data_rows = rows[(header_idx + 1) if header_idx is not None else 0:]

    txns: list[BankTransaction] = []
    pending_desc: list[str] = []
    pending_row: list[str | None] | None = None

    def flush(row: list[str | None], extra_desc: list[str]) -> None:
        date_str = _to_iso(str(row[date_col] or "").strip())
        if not date_str:
            return
        raw_desc = str(row[desc_col] or "").strip() if desc_col >= 0 and desc_col < len(row) else ""
        full_desc = " ".join(filter(None, [raw_desc] + extra_desc)).strip()
        debit = _parse_amount(str(row[debit_col] or "") if debit_col >= 0 and debit_col < len(row) else "")
        credit = _parse_amount(str(row[credit_col] or "") if credit_col >= 0 and credit_col < len(row) else "")
        balance = _parse_amount(str(row[bal_col] or "") if bal_col >= 0 and bal_col < len(row) else "")
        if debit is None and credit is None:
            return
        # Skip "OPENING BALANCE" rows
        if "opening balance" in full_desc.lower():
            return
        txns.append(BankTransaction(
            date=date_str,
            description=full_desc[:200],
            debit=debit,
            credit=credit,
            balance=balance,
            category=_categorise(full_desc),
        ))

    for row in data_rows:
        cells = [str(c or "").strip() for c in row]
        date_raw = cells[date_col] if date_col < len(cells) else ""
        if _DATE_RE.match(date_raw):
            if pending_row is not None:
                flush(pending_row, pending_desc)
            pending_row = row  # type: ignore[assignment]
            pending_desc = []
        else:
            # Continuation row — append description text
            extra = cells[desc_col] if desc_col < len(cells) else ""
            if extra and pending_row is not None:
                pending_desc.append(extra)

    if pending_row is not None:
        flush(pending_row, pending_desc)

    return txns


@router.post("/parse-bank-statement", response_model=BankStatementParseResponse)
async def parse_bank_statement(
    file: UploadFile,
    password: str = Form(default=""),
) -> BankStatementParseResponse:
    if not (file.filename or "").lower().endswith(".pdf"):
        if (file.content_type or "") not in ("application/pdf", "application/octet-stream"):
            raise HTTPException(status_code=422, detail="Only PDF files are accepted.")

    try:
        contents = await file.read()
        file_obj = io.BytesIO(contents)
        open_kwargs: dict = {}
        if password:
            open_kwargs["password"] = password

        all_transactions: list[BankTransaction] = []
        full_text = ""

        with pdfplumber.open(file_obj, **open_kwargs) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                full_text += page_text + "\n"
                tables = page.extract_tables()
                for table in tables:
                    all_transactions.extend(_parse_rows(table))  # type: ignore[arg-type]

    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse bank statement PDF: {exc}",
        ) from exc

    if not all_transactions:
        raise HTTPException(
            status_code=422,
            detail="No transactions found in this PDF. Make sure it is a bank statement with a transaction table.",
        )

    bank_name = _detect_bank(full_text)
    account_number = _extract_account_number(full_text)
    period_from, period_to = _extract_period(full_text)
    opening_balance = _extract_opening_balance(full_text)

    return BankStatementParseResponse(
        bank_name=bank_name,
        account_number=account_number,
        period_from=period_from,
        period_to=period_to,
        opening_balance=opening_balance,
        transactions=all_transactions,
    )
