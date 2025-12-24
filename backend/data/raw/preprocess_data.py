import pandas as pd
import numpy as np
import json
import os

# Paths
RAW_CSV = "backend/data/raw/AAPL.csv"       # Update filename if needed
PROCESSED_JSON = "backend/data/processed/volatility.json"

# Load CSV
df = pd.read_csv(RAW_CSV, parse_dates=["Date"])  # make sure 'Date' column exists
df = df.sort_values("Date")

# Compute daily log returns
df["log_return"] = np.log(df["Close"] / df["Close"].shift(1))
df = df.dropna()

# Compute annualized volatility (assuming 252 trading days)
historical_vol = df["log_return"].std() * np.sqrt(252)

# Save as JSON
output = {
    "symbol": "AAPL",
    "historical_volatility": float(historical_vol)
}

os.makedirs(os.path.dirname(PROCESSED_JSON), exist_ok=True)
with open(PROCESSED_JSON, "w") as f:
    json.dump(output, f, indent=4)

print(f"Historical volatility saved: {historical_vol:.4f}")
