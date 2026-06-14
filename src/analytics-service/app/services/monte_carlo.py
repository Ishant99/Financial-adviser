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
    n_sims: int = N_SIMS,
    seed: int | None = None,
) -> dict:
    """Run Monte Carlo simulation and return probability + corpus percentiles."""
    rng = np.random.default_rng(seed)
    months = max(1, int(round(years_to_goal * 12)))

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

    # Blended portfolio monthly parameters (simplified — no correlation matrix)
    port_mean = float(np.dot(weights, monthly_means))
    port_std = float(np.sqrt(np.dot(weights**2, monthly_stds**2)))

    # Generate all monthly returns at once: shape (n_sims, months)
    monthly_returns = rng.normal(port_mean, port_std, size=(n_sims, months))

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
