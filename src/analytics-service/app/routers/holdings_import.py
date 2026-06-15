"""
Parse broker portfolio export files (Excel / CSV) into a normalised holdings list.
Currently handles:
  - Groww Excel export (columns: Scheme Name, AMC, Category, Sub-category,
                         Folio No., Source, Units, Invested Value, Current Value,
                         Returns, XIRR)
  - Generic CSV fallback
"""

import csv
import io
import re
from typing import Any

import openpyxl
from fastapi import APIRouter, HTTPException, UploadFile

from app.models.holdings_import import HoldingsImportResponse, ImportedHolding

router = APIRouter()

_DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")


def _to_float(val: Any) -> float | None:
    if val is None:
        return None
    s = str(val).replace(",", "").replace("%", "").strip()
    if not s or s in ("-", "—", "N/A", ""):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _detect_source(header_row: list[str]) -> str:
    joined = " ".join(header_row).lower()
    if "groww" in joined or "folio" in joined and "source" in joined:
        return "Groww"
    if "zerodha" in joined:
        return "Zerodha"
    return "Generic"


def _detect_date(text: str) -> str | None:
    m = _DATE_RE.search(text)
    return m.group(0) if m else None


def _col_index(headers: list[str], *candidates: str) -> int:
    """Return index of first matching header (case-insensitive partial match)."""
    lower = [h.lower().strip() for h in headers]
    for candidate in candidates:
        c = candidate.lower()
        for i, h in enumerate(lower):
            if c in h:
                return i
    return -1


def _parse_xlsx(content: bytes) -> HoldingsImportResponse:
    wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    ws = wb.active

    all_rows: list[list[Any]] = []
    full_text = ""
    for row in ws.iter_rows(values_only=True):
        all_rows.append(list(row))
        full_text += " ".join(str(c or "") for c in row) + "\n"

    as_of_date = _detect_date(full_text)

    # Find header row — look for "Scheme Name"
    header_idx = -1
    for i, row in enumerate(all_rows):
        cells = [str(c or "").strip() for c in row]
        if any("scheme name" in c.lower() for c in cells):
            header_idx = i
            break

    if header_idx < 0:
        raise ValueError("Could not find a 'Scheme Name' header row. Is this a Groww/broker export?")

    headers = [str(c or "").strip() for c in all_rows[header_idx]]
    source = _detect_source(headers)

    # Column mapping
    name_col    = _col_index(headers, "scheme name", "fund name", "name")
    amc_col     = _col_index(headers, "amc", "fund house", "mutual fund")
    cat_col     = _col_index(headers, "category")
    subcat_col  = _col_index(headers, "sub-category", "subcategory", "sub category")
    folio_col   = _col_index(headers, "folio")
    units_col   = _col_index(headers, "units")
    inv_col     = _col_index(headers, "invested value", "purchase value", "invested amount")
    curr_col    = _col_index(headers, "current value", "market value", "present value")
    xirr_col    = _col_index(headers, "xirr")

    if any(c < 0 for c in [name_col, units_col, inv_col, curr_col]):
        raise ValueError(
            f"Missing required columns. Found headers: {headers}. "
            "Need at least: Scheme Name, Units, Invested Value, Current Value."
        )

    holdings: list[ImportedHolding] = []
    total_invested = 0.0
    total_current = 0.0

    for row in all_rows[header_idx + 1:]:
        cells = [str(c or "").strip() if c is not None else "" for c in row]
        if not cells or not cells[name_col]:
            continue

        name = cells[name_col]
        # Skip summary / total rows
        if any(kw in name.lower() for kw in ["total", "grand total", "holdings as on", "summary"]):
            continue
        # Skip rows where units or value look like headers
        if name.lower() in ("scheme name", "fund name", "name"):
            continue

        units = _to_float(cells[units_col] if units_col < len(cells) else None)
        inv   = _to_float(cells[inv_col]   if inv_col   < len(cells) else None)
        curr  = _to_float(cells[curr_col]  if curr_col  < len(cells) else None)

        if units is None or inv is None or curr is None:
            continue
        if units <= 0:
            continue

        purchase_nav = round(inv / units, 4)
        current_nav  = round(curr / units, 4)

        xirr_raw = _to_float(cells[xirr_col] if xirr_col >= 0 and xirr_col < len(cells) else None)
        # Groww exports XIRR as "10.35%" → _to_float gives 10.35 → normalise to 0.1035
        xirr = round(xirr_raw / 100, 6) if xirr_raw is not None and abs(xirr_raw) < 500 else xirr_raw

        holdings.append(ImportedHolding(
            scheme_name=name,
            amc=cells[amc_col] if amc_col >= 0 and amc_col < len(cells) else None,
            category=cells[cat_col] if cat_col >= 0 and cat_col < len(cells) else None,
            sub_category=cells[subcat_col] if subcat_col >= 0 and subcat_col < len(cells) else None,
            folio=cells[folio_col] if folio_col >= 0 and folio_col < len(cells) else None,
            units=units,
            invested_value=inv,
            current_value=curr,
            purchase_nav=purchase_nav,
            current_nav=current_nav,
            xirr=xirr,
        ))
        total_invested += inv
        total_current  += curr

    wb.close()

    if not holdings:
        raise ValueError("No valid holdings rows found. Check the file format.")

    return HoldingsImportResponse(
        source=source,
        as_of_date=as_of_date,
        total_invested=round(total_invested, 2),
        total_current_value=round(total_current, 2),
        holdings=holdings,
    )


def _parse_csv(content: bytes) -> HoldingsImportResponse:
    text = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        raise ValueError("Empty CSV file.")

    headers = [f.strip() for f in reader.fieldnames]
    source = _detect_source(headers)
    as_of_date = _detect_date(text[:500])

    holdings: list[ImportedHolding] = []
    total_invested = 0.0
    total_current  = 0.0

    for row in reader:
        name = row.get("Scheme Name") or row.get("Fund Name") or row.get("Name") or ""
        name = name.strip()
        if not name or any(kw in name.lower() for kw in ["total", "grand total"]):
            continue

        units = _to_float(row.get("Units") or row.get("units"))
        inv   = _to_float(row.get("Invested Value") or row.get("Purchase Value") or row.get("Invested Amount"))
        curr  = _to_float(row.get("Current Value") or row.get("Market Value"))

        if units is None or inv is None or curr is None or units <= 0:
            continue

        xirr_raw = _to_float(row.get("XIRR") or row.get("xirr"))
        xirr = round(xirr_raw / 100, 6) if xirr_raw is not None and abs(xirr_raw) < 500 else xirr_raw

        holdings.append(ImportedHolding(
            scheme_name=name,
            amc=row.get("AMC", "").strip() or None,
            category=row.get("Category", "").strip() or None,
            sub_category=row.get("Sub-category", "").strip() or None,
            folio=row.get("Folio No.", "").strip() or None,
            units=units,
            invested_value=inv,
            current_value=curr,
            purchase_nav=round(inv / units, 4),
            current_nav=round(curr / units, 4),
            xirr=xirr,
        ))
        total_invested += inv
        total_current  += curr

    if not holdings:
        raise ValueError("No valid holdings rows found in CSV.")

    return HoldingsImportResponse(
        source=source,
        as_of_date=as_of_date,
        total_invested=round(total_invested, 2),
        total_current_value=round(total_current, 2),
        holdings=holdings,
    )


@router.post("/parse-holdings-export", response_model=HoldingsImportResponse)
async def parse_holdings_export(file: UploadFile) -> HoldingsImportResponse:
    filename = (file.filename or "").lower()
    if not (filename.endswith(".xlsx") or filename.endswith(".xls") or filename.endswith(".csv")):
        raise HTTPException(
            status_code=422,
            detail="Only Excel (.xlsx) or CSV (.csv) files are accepted.",
        )

    try:
        content = await file.read()
        if filename.endswith(".csv"):
            return _parse_csv(content)
        else:
            return _parse_xlsx(content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse file: {exc}",
        ) from exc
