"""Black-Scholes option pricing and Greeks utilities."""

from typing import Dict

import numpy as np
from scipy.stats import norm


def _validate_inputs(spot: float, strike: float, rate: float, vol: float, maturity: float):
    if spot <= 0 or strike <= 0:
        raise ValueError("Spot and strike must be positive.")
    if vol <= 0:
        raise ValueError("Volatility must be positive.")
    if maturity <= 0:
        raise ValueError("Maturity must be positive (in years).")
    return float(spot), float(strike), float(rate), float(vol), float(maturity)


def _d1_d2(spot: float, strike: float, rate: float, vol: float, maturity: float):
    d1 = (np.log(spot / strike) + (rate + 0.5 * vol**2) * maturity) / (vol * np.sqrt(maturity))
    d2 = d1 - vol * np.sqrt(maturity)
    return d1, d2


def black_scholes_price(
    spot: float,
    strike: float,
    rate: float,
    vol: float,
    maturity: float,
    option_type: str = "call",
) -> float:
    """
    Compute Black-Scholes option price.

    Args:
        spot: Current underlying price.
        strike: Option strike price.
        rate: Continuously compounded risk-free rate (annualized).
        vol: Implied volatility (annualized, in decimals).
        maturity: Time to expiration in years.
        option_type: "call" or "put".
    """
    spot, strike, rate, vol, maturity = _validate_inputs(spot, strike, rate, vol, maturity)
    option_type = option_type.lower()
    if option_type not in {"call", "put"}:
        raise ValueError("option_type must be 'call' or 'put'.")

    d1, d2 = _d1_d2(spot, strike, rate, vol, maturity)
    if option_type == "call":
        price = spot * norm.cdf(d1) - strike * np.exp(-rate * maturity) * norm.cdf(d2)
    else:
        price = strike * np.exp(-rate * maturity) * norm.cdf(-d2) - spot * norm.cdf(-d1)
    return float(price)


def black_scholes_greeks(
    spot: float,
    strike: float,
    rate: float,
    vol: float,
    maturity: float,
    option_type: str = "call",
) -> Dict[str, float]:
    """
    Compute primary Greeks (delta, gamma, vega, theta, rho) for Black-Scholes.

    Returns:
        Dict with keys: delta, gamma, vega, theta, rho.
        Theta is per year; vega is per 1 vol unit (not per vol point).
    """
    spot, strike, rate, vol, maturity = _validate_inputs(spot, strike, rate, vol, maturity)
    option_type = option_type.lower()
    if option_type not in {"call", "put"}:
        raise ValueError("option_type must be 'call' or 'put'.")

    d1, d2 = _d1_d2(spot, strike, rate, vol, maturity)
    pdf_d1 = norm.pdf(d1)

    if option_type == "call":
        delta = norm.cdf(d1)
        theta = (
            - (spot * pdf_d1 * vol) / (2 * np.sqrt(maturity))
            - rate * strike * np.exp(-rate * maturity) * norm.cdf(d2)
        )
        rho = strike * maturity * np.exp(-rate * maturity) * norm.cdf(d2)
    else:
        delta = norm.cdf(d1) - 1
        theta = (
            - (spot * pdf_d1 * vol) / (2 * np.sqrt(maturity))
            + rate * strike * np.exp(-rate * maturity) * norm.cdf(-d2)
        )
        rho = -strike * maturity * np.exp(-rate * maturity) * norm.cdf(-d2)

    gamma = pdf_d1 / (spot * vol * np.sqrt(maturity))
    vega = spot * pdf_d1 * np.sqrt(maturity)

    return {
        "delta": float(delta),
        "gamma": float(gamma),
        "vega": float(vega),
        "theta": float(theta),
        "rho": float(rho),
    }
