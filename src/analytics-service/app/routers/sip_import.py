"""
Parse SIP bulk-import files (Excel / CSV).

Supported formats
-----------------
Groww SIP Instalment Report (.xlsx):
  Scheme Name | ISIN/AMFI Code | Instalment Amount | SIP Date | Start Date | Status

CAMS SIP Outstanding (.xlsx/.csv):
  Scheme Name | AMFI Code | Amount | SIP Date | Start Date | Status

Generic CSV / Excel (minimum required columns):
  Fund Name (or Scheme Name), Monthly Amount (or Amount/SIP Amount),
  SIP Date, Start Date
"""

import csv
import io
import re
from datetime import datetime
from typing import Any

import openpyxl
from fastapi import APIRouter, HTTPException, UploadFile

from app.models.sip_import import ImportedSip, SipImportResponse

router = APIRouter()

# ── helpers ──────────────────────────────────────────────────────────────────

def _to_float(val: Any) -> float | None:
    if val is None:
        return None
    s = str(val).replace(",", "").replace("₹", "").replace("INR", "").strip()
    try:
        return float(s) if s else None
    except ValueError:
        return None


def _to_int(val: Any, lo: int = 1, hi: int = 28) -> int | None:
    f = _to_float(val)
    if f is None:
        return None
    i = int(f)
    return i if lo <= i <= hi else None


_DATE_FMTS = ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%d-%b-%Y", "%d %b %Y", "%b %d, %Y"]


def _parse_date(val: Any) -> str | None:
    """Return ISO YYYY-MM-DD or None."""
    if val is None:
        return None
    if isinstance(val, (datetime,)):
        return val.strftime("%Y-%m-%d")
    s = str(val).strip()
    for fmt in _DATE_FMTS:
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    # Try extracting a date-like substring
    m = re.search(r"\d{4}-\d{2}-\d{2}", s)
    if m:
        return m.group(0)
    return None


def _col(headers: list[str], *candidates: str) -> int:
    lower = [h.lower().strip() for h in headers]
    for c in candidates:
        c_l = c.lower()
        for i, h in enumerate(lower):
            if c_l in h:
                return i
    return -1


def _detect_source(headers: list[str]) -> str:
    joined = " ".join(headers).lower()
    if "instalment" in joined or "groww" in joined:
        return "Groww"
    if "cams" in joined or "outstanding" in joined:
        return "CAMS"
    if "kfintech" in joined or "karvy" in joined:
        return "KFintech"
    return "Generic"


def _build_sip(name: str, code: str, amount: float, sip_date: int,
               start_date: str, status: str) -> ImportedSip:
    # Normalise status
    status_norm = "Active"
    if status and any(w in status.lower() for w in ["pause", "inactive", "stopped", "cancel"]):
        status_norm = "Paused"

    return ImportedSip(
        fund_name=name.strip(),
        fund_code=code.strip() if code else "",
        monthly_amount=amount,
        sip_date=max(1, min(28, sip_date)),
        start_date=start_date,
        benchmark_index="Nifty 500",
        status=status_norm,
    )


# ── Excel parser ─────────────────────────────────────────────────────────────

def _parse_xlsx(content: bytes) -> SipImportResponse:
    wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    ws = wb.active

    all_rows: list[list[Any]] = [list(r) for r in ws.iter_rows(values_only=True)]
    wb.close()

    # Find header row by looking for "scheme" or "fund name"
    header_idx = -1
    for i, row in enumerate(all_rows):
        cells = [str(c or "").lower().strip() for c in row]
        if any("scheme" in c or "fund name" in c for c in cells):
            header_idx = i
            break

    if header_idx < 0:
        raise ValueError(
            "Could not find a header row with 'Scheme Name' or 'Fund Name'. "
            "Is this a Groww / CAMS SIP report?"
        )

    headers = [str(c or "").strip() for c in all_rows[header_idx]]
    source = _detect_source(headers)

    name_col    = _col(headers, "scheme name", "fund name", "scheme", "fund")
    code_col    = _col(headers, "amfi", "isin", "fund code", "scheme code")
    amount_col  = _col(headers, "instalment amount", "sip amount", "amount", "monthly amount")
    date_col    = _col(headers, "sip date", "instalment date", "date of sip", "debit date")
    start_col   = _col(headers, "start date", "sip start", "commencement")
    status_col  = _col(headers, "status")

    if any(c < 0 for c in [name_col, amount_col]):
        raise ValueError(
            f"Missing required columns. Found: {headers}. "
            "Need at least: Scheme Name, SIP Amount / Instalment Amount."
        )

    sips: list[ImportedSip] = []

    for row in all_rows[header_idx + 1:]:
        cells = [str(c or "").strip() if c is not None else "" for c in row]
        if not cells or not cells[name_col]:
            continue
        name = cells[name_col]
        if any(kw in name.lower() for kw in ["total", "grand total", "scheme name"]):
            continue

        amount = _to_float(cells[amount_col] if amount_col < len(cells) else "")
        if amount is None or amount <= 0:
            continue

        sip_day  = _to_int(cells[date_col] if date_col >= 0 and date_col < len(cells) else "") or 1
        start    = _parse_date(cells[start_col] if start_col >= 0 and start_col < len(cells) else "") or "2020-01-01"
        code     = cells[code_col] if code_col >= 0 and code_col < len(cells) else ""
        status   = cells[status_col] if status_col >= 0 and status_col < len(cells) else "Active"

        sips.append(_build_sip(name, code, amount, sip_day, start, status))

    if not sips:
        raise ValueError("No valid SIP rows found in the file.")

    return SipImportResponse(source=source, sips=sips)


# ── CSV parser ────────────────────────────────────────────────────────────────

def _parse_csv(content: bytes) -> SipImportResponse:
    text = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("Empty CSV.")

    source = _detect_source(list(reader.fieldnames))
    sips: list[ImportedSip] = []

    for row in reader:
        name = (row.get("Scheme Name") or row.get("Fund Name") or row.get("scheme") or "").strip()
        if not name:
            continue

        amount = _to_float(
            row.get("Instalment Amount") or row.get("SIP Amount") or
            row.get("Amount") or row.get("Monthly Amount")
        )
        if amount is None or amount <= 0:
            continue

        sip_day = _to_int(row.get("SIP Date") or row.get("Instalment Date") or row.get("Debit Date")) or 1
        start   = _parse_date(row.get("Start Date") or row.get("SIP Start") or row.get("Commencement")) or "2020-01-01"
        code    = (row.get("AMFI") or row.get("ISIN") or row.get("Fund Code") or "").strip()
        status  = (row.get("Status") or "Active").strip()

        sips.append(_build_sip(name, code, amount, sip_day, start, status))

    if not sips:
        raise ValueError("No valid SIP rows found in CSV.")

    return SipImportResponse(source=source, sips=sips)


# ── endpoint ──────────────────────────────────────────────────────────────────

@router.post("/parse-sip-export", response_model=SipImportResponse)
async def parse_sip_export(file: UploadFile) -> SipImportResponse:
    fname = (file.filename or "").lower()
    if not any(fname.endswith(ext) for ext in (".xlsx", ".xls", ".csv")):
        raise HTTPException(status_code=422, detail="Only Excel (.xlsx) or CSV (.csv) files are accepted.")
    try:
        content = await file.read()
        return _parse_csv(content) if fname.endswith(".csv") else _parse_xlsx(content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Failed to parse SIP file: {exc}") from exc
