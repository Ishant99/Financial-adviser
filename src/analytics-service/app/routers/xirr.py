from datetime import date

from fastapi import APIRouter, HTTPException

from app.models.xirr import XirrRequest, XirrResponse
from app.services.xirr import xirr as compute_xirr

router = APIRouter(prefix="/xirr", tags=["xirr"])


@router.post("/compute", response_model=XirrResponse)
async def compute(req: XirrRequest) -> XirrResponse:
    if len(req.cashflows) < 2:
        raise HTTPException(status_code=422, detail="At least 2 cashflows required to compute XIRR.")

    try:
        cashflows = [(date.fromisoformat(cf.date), cf.amount) for cf in req.cashflows]
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=f"Invalid date format: {exc}") from exc

    rate = compute_xirr(cashflows)
    return XirrResponse(xirr=round(rate, 6))
