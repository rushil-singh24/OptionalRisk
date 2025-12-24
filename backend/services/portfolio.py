"""
Portfolio service module.

Functions:
- Compute portfolio value using Black-Scholes
- Aggregate Greeks for all positions
"""

from models import black_scholes

def compute_position_value(pos, S, r):
    """
    Compute value and Greeks of a single option position.

    Parameters:
    pos : dict : {
        "type": "call" or "put",
        "side": "long" or "short",
        "quantity": int,
        "strike": float,
        "time_to_expiry": float,
        "volatility": float
    }
    S : float : current stock price
    r : float : risk-free rate

    Returns:
    dict : {
        "value": float,
        "delta": float,
        "gamma": float,
        "theta": float,
        "vega": float,
        "rho": float
    }
    """
    option_type = pos["type"]
    side = pos["side"]
    qty = pos["quantity"]
    K = pos["strike"]
    T = pos["time_to_expiry"]
    sigma = pos["volatility"]

    # Calculate Black-Scholes price using the correct function
    value = black_scholes.black_scholes_price(S, K, r, sigma, T, option_type)

    # Calculate Greeks using the correct function
    greeks = black_scholes.black_scholes_greeks(S, K, r, sigma, T, option_type)

    # Apply quantity multiplier
    value *= qty
    delta = greeks["delta"] * qty
    gamma = greeks["gamma"] * qty
    theta = greeks["theta"] * qty
    vega = greeks["vega"] * qty
    rho = greeks["rho"] * qty

    # Adjust for short positions (invert signs)
    if side == "short":
        value *= -1
        delta *= -1
        gamma *= -1
        theta *= -1
        vega *= -1
        rho *= -1

    return {
        "value": value,
        "delta": delta,
        "gamma": gamma,
        "theta": theta,
        "vega": vega,
        "rho": rho
    }


def compute_portfolio(portfolio_positions, S, r):
    """
    Compute total portfolio value and aggregate Greeks.

    Parameters:
    portfolio_positions : list of dicts (each is a position)
    S : float : current stock price
    r : float : risk-free rate

    Returns:
    dict : {
        "total_value": float,
        "total_delta": float,
        "total_gamma": float,
        "total_theta": float,
        "total_vega": float,
        "total_rho": float,
        "positions": list of dicts with individual position results
    }
    """
    total_value = 0
    total_delta = 0
    total_gamma = 0
    total_theta = 0
    total_vega = 0
    total_rho = 0

    positions_results = []

    for pos in portfolio_positions:
        result = compute_position_value(pos, S, r)
        positions_results.append(result)

        total_value += result["value"]
        total_delta += result["delta"]
        total_gamma += result["gamma"]
        total_theta += result["theta"]
        total_vega += result["vega"]
        total_rho += result["rho"]

    return {
        "total_value": total_value,
        "total_delta": total_delta,
        "total_gamma": total_gamma,
        "total_theta": total_theta,
        "total_vega": total_vega,
        "total_rho": total_rho,
        "positions": positions_results
    }


if __name__ == "__main__":
    # Quick test
    test_portfolio = [
        {"type": "call", "side": "long", "quantity": 2, "strike": 105, "time_to_expiry": 0.5, "volatility": 0.25},
        {"type": "put", "side": "short", "quantity": 1, "strike": 95, "time_to_expiry": 0.25, "volatility": 0.3}
    ]
    S0 = 100
    r = 0.03

    result = compute_portfolio(test_portfolio, S0, r)
    print("Total portfolio value:", result["total_value"])
    print("Total delta:", result["total_delta"])
