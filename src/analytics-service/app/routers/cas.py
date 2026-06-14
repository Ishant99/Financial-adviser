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

            holdings.append(
                CasHolding(
                    fund_name=scheme.get("scheme") or "",
                    fund_code=isin or folio_number,
                    units=close_units,
                    nav=nav_val,
                    value=current_value,
                    folio=folio_number,
                    isin=isin,
                )
            )

    total_value = sum(h.value for h in holdings)

    return CasParseResponse(
        investor_name=investor_name,
        statement_date=statement_date,
        total_value=total_value,
        holdings=holdings,
    )
