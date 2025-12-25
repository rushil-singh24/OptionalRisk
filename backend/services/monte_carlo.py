"""
Monte Carlo simulation for options portfolio.

This module simulates stock price paths using Geometric Brownian Motion (GBM)
and computes portfolio outcomes under these simulated paths.
"""

import numpy as np
from models import black_scholes  # import your pricing functions


def simulate_stock_price(S0, T, r, sigma, steps=252, n_simulations=10000, seed=None):
    """
    Simulate stock price paths using GBM.
    
    Parameters:
    S0 : float : initial stock price
    T : float : time horizon in years
    r : float : risk-free rate
    sigma : float : volatility
    steps : int : number of time steps
    n_simulations : int : number of simulation paths
    seed : int : random seed for reproducibility
    
    Returns:
    np.ndarray : simulated price paths (n_simulations x steps)
    """
    if seed is not None:
        np.random.seed(seed)

    dt = T / steps
    # Standard normal random numbers
    Z = np.random.standard_normal((n_simulations, steps))
    # Initialize price paths
    S = np.zeros_like(Z)
    S[:, 0] = S0

    # Simulate paths
    for t in range(1, steps):
        S[:, t] = S[:, t - 1] * np.exp((r - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * Z[:, t])

    return S


def simulate_portfolio(portfolio_positions, S0, T, r, sigma, steps=252, n_simulations=10000):
    """
    Simulate portfolio outcomes at horizon T.
    
    Parameters:
    portfolio_positions : list of dict
        Each dict contains:
        {
            "type": "call" or "put",
            "side": "long" or "short",
            "quantity": int,
            "strike": float,
            "time_to_expiry": float,
            "volatility": float
        }
    S0 : float : current stock price
    T : float : simulation horizon in years
    r : float : risk-free rate
    sigma : float : volatility
    steps : int : number of time steps
    n_simulations : int : number of simulation paths
    
    Returns:
    dict : {
        "portfolio_values": np.ndarray of final portfolio values,
        "mean": float,
        "std": float,
        "VaR_5": float,       # 5th percentile
        "VaR_1": float        # 1st percentile
    }
    """
    # Simulate stock paths
    S_paths = simulate_stock_price(S0, T, r, sigma, steps, n_simulations)
    
    # Portfolio values at the end of the horizon
    final_prices = S_paths[:, -1]
    portfolio_values = np.zeros(n_simulations)
    
    # Calculate net P&L for each position
    for pos in portfolio_positions:
        option_type = pos["type"]
        side = pos["side"]
        qty = pos["quantity"]
        K = pos["strike"]
        time_to_expiry = pos["time_to_expiry"]
        vol = pos.get("volatility", sigma)
        
        # Calculate intrinsic value at expiration
        if option_type == "call":
            payoff = np.maximum(final_prices - K, 0)
        else:  # put
            payoff = np.maximum(K - final_prices, 0)
        
        # Calculate initial premium (t=0 option price)
        premium = black_scholes.black_scholes_price(S0, K, r, vol, time_to_expiry, option_type)
        
        # Net P&L = (Expiration Payoff - Initial Premium) * Quantity * Side
        if side == "short":
            # Short: Receive premium, pay out intrinsic value
            # P&L = Premium received - Payoff paid = +(premium - payoff)
            net_pl_per_contract = premium - payoff
        else:
            # Long: Pay premium, receive intrinsic value
            # P&L = Payoff received - Premium paid = +(payoff - premium)
            net_pl_per_contract = payoff - premium
        
        portfolio_values += qty * net_pl_per_contract

    # Compute basic risk statistics
    mean = np.mean(portfolio_values)
    std = np.std(portfolio_values)
    VaR_5 = np.percentile(portfolio_values, 5)
    VaR_1 = np.percentile(portfolio_values, 1)

    return {
        "portfolio_values": portfolio_values,
        "mean": mean,
        "std": std,
        "VaR_5": VaR_5,
        "VaR_1": VaR_1
    }


if __name__ == "__main__":
    # Quick test
    test_positions = [
        {"type": "call", "side": "long", "quantity": 1, "strike": 100, "time_to_expiry": 0.5, "volatility": 0.25},
        {"type": "put", "side": "short", "quantity": 1, "strike": 95, "time_to_expiry": 0.5, "volatility": 0.25}
    ]
    
    results = simulate_portfolio(test_positions, S0=100, T=0.5, r=0.03, sigma=0.25, n_simulations=5000)
    print(f"Mean portfolio value: {results['mean']:.2f}")
    print(f"Std portfolio value: {results['std']:.2f}")
    print(f"5% VaR: {results['VaR_5']:.2f}")
