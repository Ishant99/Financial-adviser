import io

import casparser
from fastapi import APIRouter, Form, HTTPException, UploadFile

from app.models.cas import CasHolding, CasParseResponse

router = APIRouter()


@router.post("/parse-cas", response_model=CasParseResponse)
async def parse_cas(
    file: UploadFile,
    password: str = Form(default=""),
) -> CasParseResponse:
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        # Allow octet-stream for clients that don't set the correct MIME type
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(
                status_code=422,
                detail="Only PDF files are accepted. Please upload a CAS PDF from CAMS or Karvy.",
            )

    try:
        contents = await file.read()
        file_obj = io.BytesIO(contents)
        data = casparser.read_cas_pdf(file_obj, password=password)
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse CAS PDF: {exc}. Ensure this is a valid CAMS/Karvy CAS file.",
        ) from exc

    investor_name: str = ""
    try:
        investor_info = data.get("investor_info") or {}
        investor_name = investor_info.get("name") or ""
    except Exception:
        pass

    statement_date: str = ""
    try:
        period = data.get("statement_period") or {}
        statement_date = str(period.get("to") or "")
    except Exception:
        pass

    holdings: list[CasHolding] = []
    for folio in data.get("folios") or []:
        folio_number = str(folio.get("folio") or "")
        for scheme in folio.get("schemes") or []:
            close_units = float(scheme.get("close_units") or 0)
            if close_units <= 0:
                continue  # skip closed / zero-unit positions

            valuation = scheme.get("valuation") or {}
            current_value = float(valuation.get("value") or 0)
            nav_val = float(valuation.get("nav") or scheme.get("nav") or 0)
            isin = scheme.get("isin") or None

            # Walk transactions to find the earliest purchase date.
            # casparser exposes transactions as a list under scheme["transactions"];
            # each entry has a "date" (datetime or date str) and "transaction_type".
            earliest_purchase_date: str | None = None
            try:
                for txn in scheme.get("transactions") or []:
                    txn_type = str(txn.get("transaction_type") or "").lower()
                    # Only consider inflow transactions (purchases/SIP/NFO etc.)
                    if "purchase" not in txn_type and "sip" not in txn_type and "nfo" not in txn_type:
                        continue
                    raw_date = txn.get("date")
                    if not raw_date:
                        continue
                    date_str = str(raw_date)[:10]  # keep YYYY-MM-DD portion
                    if earliest_purchase_date is None or date_str < earliest_purchase_date:
                        earliest_purchase_date = date_str
            except Exception:
                pass  # non-critical; silently skip if transaction data is malformed

            holdings.append(
                CasHolding(
                    fund_name=scheme.get("scheme") or "",
                    fund_code=isin or folio_number,
                    units=close_units,
                    nav=nav_val,
                    value=current_value,
                    folio=folio_number,
                    isin=isin,
                    earliest_purchase_date=earliest_purchase_date,
                )
            )

    total_value = sum(h.value for h in holdings)

    return CasParseResponse(
        investor_name=investor_name,
        statement_date=statement_date,
        total_value=total_value,
        holdings=holdings,
    )
