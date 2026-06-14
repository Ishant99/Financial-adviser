import numpy as np

N_SIMS = 10_000

# Historical annual parameters for Indian asset classes
_PARAMS = {
    "equity": {"mean": 0.12, "std": 0.18},
    "debt":   {"mean": 0.07, "std": 0.04},
    "gold":   {"mean": 0.08, "std": 0.15},
    "cash":   {"mean": 0.04, "std": 0.005},
}


def simulate_goal(
    target_amount: float,
    years_to_goal: float,
    current_value: float,
    monthly_contribution: float,
    equity_pct: float,
    debt_pct: float,
    gold_pct: float,
    cash_pct: float,
    market_correlation: float = 0.3,
    n_sims: int = N_SIMS,
    seed: int | None = None,
) -> dict:
    """Run Monte Carlo simulation and return probability + corpus percentiles.

    market_correlation (0–1) is a single-factor correlation between asset classes.
    At 0 assets are independent (overestimates diversification); at 1 they move
    together. Default 0.3 is a pragmatic approximation for Indian multi-asset
    portfolios. Implemented via a two-factor decomposition:
        r_i = sqrt(rho) * Z_market + sqrt(1-rho) * Z_idiosyncratic
    where Z ~ N(0, std_i), giving Corr(r_i, r_j) = rho for all i≠j.
    """
    rng = np.random.default_rng(seed)
    months = max(1, int(round(years_to_goal * 12)))
    n_assets = 4

    weights = np.array([equity_pct, debt_pct, gold_pct, cash_pct]) / 100.0
    annual_means = np.array([
        _PARAMS["equity"]["mean"], _PARAMS["debt"]["mean"],
        _PARAMS["gold"]["mean"],   _PARAMS["cash"]["mean"],
    ])
    annual_stds = np.array([
        _PARAMS["equity"]["std"], _PARAMS["debt"]["std"],
        _PARAMS["gold"]["std"],   _PARAMS["cash"]["std"],
    ])

    # Convert to monthly parameters
    monthly_means = annual_means / 12
    monthly_stds = annual_stds / np.sqrt(12)

    rho = float(np.clip(market_correlation, 0.0, 1.0))

    # Generate correlated monthly returns for each asset using two-factor model.
    # Z_market: shape (n_sims, months) — shared factor driving co-movement.
    # Z_idio:   shape (n_sims, months, n_assets) — asset-specific shocks.
    z_market = rng.standard_normal(size=(n_sims, months))
    z_idio = rng.standard_normal(size=(n_sims, months, n_assets))

    # asset returns: (n_sims, months, n_assets)
    asset_returns = (
        np.sqrt(rho) * z_market[:, :, np.newaxis] * monthly_stds[np.newaxis, np.newaxis, :]
        + np.sqrt(1.0 - rho) * z_idio * monthly_stds[np.newaxis, np.newaxis, :]
        + monthly_means[np.newaxis, np.newaxis, :]
    )

    # Blended portfolio return per (sim, month): dot with weights
    monthly_returns = np.einsum("smk,k->sm", asset_returns, weights)

    # Simulate corpus month by month (vectorised across all paths)
    corpus = np.full(n_sims, float(current_value))
    for m in range(months):
        corpus = corpus * (1.0 + monthly_returns[:, m]) + float(monthly_contribution)
    corpus = np.maximum(corpus, 0.0)

    probability = float(np.mean(corpus >= float(target_amount)))

    return {
        "probability_of_success": round(probability * 100.0, 1),
        "p10_corpus": round(float(np.percentile(corpus, 10)), 2),
        "p50_corpus": round(float(np.percentile(corpus, 50)), 2),
        "p90_corpus": round(float(np.percentile(corpus, 90)), 2),
    }
