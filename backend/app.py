import json
import os
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

from services import portfolio
from services import monte_carlo
# ----------------------------
# Environment loading (simple .env parser)
# ----------------------------
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"


def load_env_file(env_path: Path):
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        os.environ.setdefault(key, value)


load_env_file(ENV_PATH)

# ----------------------------
# Config from environment
# ----------------------------
def get_env_float(key: str, default: float) -> float:
    try:
        return float(os.getenv(key, default))
    except (TypeError, ValueError):
        return default


def get_env_int(key: str, default: int) -> int:
    try:
        return int(os.getenv(key, default))
    except (TypeError, ValueError):
        return default


def get_env_bool(key: str, default: bool) -> bool:
    val = os.getenv(key)
    if val is None:
        return default
    return str(val).lower() in {"1", "true", "yes", "y", "on"}


HOST = os.getenv("HOST", "0.0.0.0")
PORT = get_env_int("PORT", 5001)
FLASK_ENV = os.getenv("FLASK_ENV", "development")
FLASK_DEBUG = get_env_bool("FLASK_DEBUG", True)
VOL_PATH = os.getenv("VOLATILITY_DATA_PATH", "data/processed/volatility.json")
DEFAULT_RISK_FREE = get_env_float("DEFAULT_RISK_FREE_RATE", 0.036)
DEFAULT_VOL = get_env_float("DEFAULT_VOLATILITY", 0.25)
DEFAULT_PRICE = get_env_float("DEFAULT_CURRENT_PRICE", 100.0)
DEFAULT_MC_SIMS = get_env_int("DEFAULT_MC_SIMULATIONS", 10000)
DEFAULT_MC_HORIZON = get_env_float("DEFAULT_MC_HORIZON_YEARS", 0.5)
DEFAULT_MC_STEPS = get_env_int("DEFAULT_MC_STEPS", 252)
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# ----------------------------
# Logging configuration
# ----------------------------
import logging
logging.basicConfig(level=getattr(logging, LOG_LEVEL.upper(), logging.INFO))

# ----------------------------
# Flask app initialization
# ----------------------------
app = Flask(__name__)

# Configure CORS from env if provided
if CORS_ORIGINS:
    origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
    CORS(app, resources={r"/*": {"origins": origins}})
else:
    CORS(app)

# ----------------------------
# Load processed volatility data
# ----------------------------
vol_path = Path(VOL_PATH)
if not vol_path.is_absolute():
    vol_path = BASE_DIR / vol_path

try:
    with open(vol_path) as f:
        VOL_DATA = json.load(f)
        print(f"✓ Loaded volatility data for {VOL_DATA['metadata']['total_tickers']} tickers from {vol_path}")
except FileNotFoundError:
    print("Warning: volatility.json not found. Run preprocess_data.py first.")
    VOL_DATA = {
        "metadata": {"total_tickers": 0},
        "tickers": {}
    }

# ----------------------------
# Health check endpoint
# ----------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "tickers_loaded": VOL_DATA["metadata"]["total_tickers"]
    })

# ----------------------------
# Get all available tickers
# ----------------------------
@app.route("/market/tickers", methods=["GET"])
def get_tickers():
    """Return list of all available tickers with their data."""
    tickers = []
    for ticker, data in VOL_DATA.get("tickers", {}).items():
        tickers.append({
            "ticker": ticker,
            "volatility": data["volatility"],
            "latest_price": data["latest_price"],
            "brand_name": ticker  # You could enhance this with Brand_Name from CSV
        })
    return jsonify(tickers)

# ----------------------------
# Get volatility for specific ticker
# ----------------------------
@app.route("/market/volatility/<ticker>", methods=["GET"])
def get_ticker_volatility(ticker):
    """Get volatility data for a specific ticker."""
    ticker = ticker.upper()
    
    if ticker in VOL_DATA.get("tickers", {}):
        return jsonify(VOL_DATA["tickers"][ticker])
    else:
        return jsonify({
            "error": f"Ticker {ticker} not found",
            "available_tickers": list(VOL_DATA.get("tickers", {}).keys())
        }), 404

# ----------------------------
# Legacy volatility endpoint (backwards compatible)
# ----------------------------
@app.route("/market/volatility", methods=["GET"])
def get_volatility():
    """Return default volatility (first ticker or fallback)."""
    tickers = VOL_DATA.get("tickers", {})
    
    if tickers:
        # Return first ticker's data as default
        first_ticker = list(tickers.keys())[0]
        return jsonify({
            "ticker": first_ticker,
            "historical_volatility": tickers[first_ticker]["volatility"],
            "latest_price": tickers[first_ticker]["latest_price"]
        })
    else:
        # Fallback
        return jsonify({
            "ticker": "UNKNOWN",
            "historical_volatility": DEFAULT_VOL,
            "latest_price": DEFAULT_PRICE
        })

# ----------------------------
# Portfolio analysis endpoint
# ----------------------------
@app.route("/portfolio/analyze", methods=["POST"])
def analyze_portfolio():
    data = request.get_json()
    if not data or "portfolio" not in data:
        return jsonify({"error": "Portfolio data required"}), 400

    portfolio_positions = data["portfolio"]
    S = data.get("current_price", DEFAULT_PRICE)
    r = data.get("risk_free_rate", DEFAULT_RISK_FREE)
    ticker = data.get("ticker", "").upper()

    # Fill missing volatilities from dataset
    default_vol = DEFAULT_VOL
    if ticker and ticker in VOL_DATA.get("tickers", {}):
        default_vol = VOL_DATA["tickers"][ticker]["volatility"]
    
    for pos in portfolio_positions:
        if "volatility" not in pos or pos["volatility"] is None:
            pos["volatility"] = default_vol

    result = portfolio.compute_portfolio(portfolio_positions, S, r)
    return jsonify(result)

# ----------------------------
# Portfolio Monte Carlo simulation endpoint
# ----------------------------
@app.route("/portfolio/simulate", methods=["POST"])
def simulate_portfolio_route():
    data = request.get_json()
    if not data or "portfolio" not in data:
        return jsonify({"error": "Portfolio data required"}), 400

    portfolio_positions = data["portfolio"]
    S = data.get("current_price", DEFAULT_PRICE)
    r = data.get("risk_free_rate", DEFAULT_RISK_FREE)
    T = data.get("horizon", DEFAULT_MC_HORIZON)  # years
    n_simulations = data.get("n_simulations", DEFAULT_MC_SIMS)
    ticker = data.get("ticker", "").upper()

    # Get volatility from dataset
    sigma = DEFAULT_VOL
    if ticker and ticker in VOL_DATA.get("tickers", {}):
        sigma = VOL_DATA["tickers"][ticker]["volatility"]

    # Fill missing volatilities
    for pos in portfolio_positions:
        if "volatility" not in pos or pos["volatility"] is None:
            pos["volatility"] = sigma

    simulation = monte_carlo.simulate_portfolio(
        portfolio_positions,
        S,
        T,
        r,
        sigma,
        steps=DEFAULT_MC_STEPS,
        n_simulations=n_simulations
    )

    # Convert numpy arrays to lists for JSON serialization
    if "portfolio_values" in simulation:
        simulation["portfolio_values"] = simulation["portfolio_values"].tolist()

    return jsonify(simulation)

# ----------------------------
# Run Flask server
# ----------------------------
if __name__ == "__main__":
    print("\n" + "="*60)
    print("Options Risk Analysis Backend")
    print("="*60)
    print(f"Tickers loaded: {VOL_DATA['metadata']['total_tickers']}")
    print(f"Server starting on http://{HOST}:{PORT}")
    print("="*60 + "\n")
    
    app.run(debug=FLASK_DEBUG, host=HOST, port=PORT)
