# Option(al) Risk

A modern web application for analyzing options portfolios using Black-Scholes pricing models and Monte Carlo simulations.

## What It Does

Options Risk Analysis helps you understand and manage options trading risk through:

- **Portfolio Builder**: Create complex options positions (calls, puts, long, short) across multiple stocks
- **Black-Scholes Pricing**: Instantly calculate option values using industry-standard models
- **Greeks Analytics**: Visualize Delta, Gamma, Vega, Theta, and Rho for your entire portfolio
- **Monte Carlo Simulation**: Run 10,000 price path scenarios to understand potential outcomes
- **Risk Metrics**: Calculate Value at Risk (VaR) at 95% and 99% confidence levels
- **Real Data**: Pre-loaded with 61 stock tickers and historical volatility calculations

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for blazing-fast dev experience
- Recharts for interactive visualizations
- Axios for API communication

**Backend:**
- Flask (Python) REST API
- NumPy & SciPy for quantitative calculations
- Pandas for data processing
- Black-Scholes implementation from scratch

**Data:**
- Historical price data with calculated volatilities from https://www.kaggle.com/datasets/nelgiriyewithana/world-stock-prices-daily-updating?resource=download 
- Multi-year coverage for 61+ tickers
- JSON-based processed dataset

## Key Features

### 1. Smart Ticker Selection
Search through 61 pre-loaded stocks. When you select a ticker, volatility and current price auto-populate.

### 2. Portfolio Construction
Build positions by specifying:
- Option type (Call/Put)
- Position side (Long/Short)
- Strike price
- Time to expiration
- Quantity of contracts

### 3. Greeks Dashboard
See how your portfolio responds to:
- **Price changes** (Delta)
- **Delta changes** (Gamma)
- **Volatility shifts** (Vega)
- **Time decay** (Theta)
- **Interest rate moves** (Rho)

### 4. Monte Carlo Risk Analysis
Simulate thousands of future scenarios to see:
- Mean expected profit/loss
- Standard deviation of outcomes
- Downside risk (VaR)
- Full distribution histogram

## Project Structure
```
OptionsRiskAnalysis/
├── backend/
│   ├── data/
│   │   ├── raw/              # CSV data files
│   │   └── processed/        # volatility.json (generated)
│   ├── models/
│   │   └── black_scholes.py  # Pricing & Greeks
│   ├── services/
│   │   ├── portfolio.py      # Portfolio analytics
│   │   └── monte_carlo.py    # MC simulation
│   └── app.py                # Flask API
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/           # Dashboard page
    │   └── api.ts           # API client
    └── package.json
```

## Why This Project?

This tool bridges the gap between theoretical finance and practical application. Whether you're:
- Learning options pricing theory
- Testing trading strategies
- Understanding portfolio risk
- Studying quantitative finance

...this provides hands-on experience with real models and real data.


Built as a demonstration of full-stack quantitative finance development.
