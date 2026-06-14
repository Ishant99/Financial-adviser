"""Pure-Python XIRR using Newton-Raphson. No scipy dependency."""

from datetime import date


def xirr(cashflows: list[tuple[date, float]], guess: float = 0.1, tol: float = 1e-6, max_iter: int = 200) -> float:
    """
    Compute the Internal Rate of Return for irregular cashflows (XIRR).

    Args:
        cashflows: List of (date, amount) where negative = outflow, positive = inflow.
        guess: Initial rate guess (default 10%).
        tol: Convergence tolerance.
        max_iter: Maximum Newton-Raphson iterations.

    Returns:
        Annualised rate (e.g. 0.12 = 12%). Returns 0.0 if computation fails.
    """
    if not cashflows or len(cashflows) < 2:
        return 0.0

    # Sort by date
    cashflows = sorted(cashflows, key=lambda cf: cf[0])
    t0 = cashflows[0][0]
    years = [(d - t0).days / 365.25 for d, _ in cashflows]
    amounts = [a for _, a in cashflows]

    def npv(r: float) -> float:
        if r <= -1:
            r = -0.9999
        return sum(a / (1.0 + r) ** t for a, t in zip(amounts, years))

    def dnpv(r: float) -> float:
        if r <= -1:
            r = -0.9999
        return sum(-a * t / (1.0 + r) ** (t + 1) for a, t in zip(amounts, years))

    r = guess
    for _ in range(max_iter):
        f = npv(r)
        df = dnpv(r)
        if abs(df) < 1e-15:
            break
        r_new = r - f / df
        # Clamp to prevent divergence
        r_new = max(-0.9999, min(r_new, 100.0))
        if abs(r_new - r) < tol:
            return r_new
        r = r_new

    return r
