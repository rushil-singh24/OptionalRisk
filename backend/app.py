from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from services import portfolio
from services import monte_carlo

# ----------------------------
# Flask app initialization
# ----------------------------
app = Flask(__name__)
CORS(app)

# ----------------------------
# Load processed volatility data
# ----------------------------
try:
    with open("data/processed/volatility.json") as f:
        VOL_DATA = json.load(f)
        print(f"✓ Loaded volatility data for {VOL_DATA['metadata']['total_tickers']} tickers")
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
            "historical_volatility": 0.25,
            "latest_price": 100.0
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
    S = data.get("current_price", 100)
    r = data.get("risk_free_rate", 0.03)
    ticker = data.get("ticker", "").upper()

    # Fill missing volatilities from dataset
    default_vol = 0.25
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
    S = data.get("current_price", 100)
    r = data.get("risk_free_rate", 0.03)
    T = data.get("horizon", 0.5)  # years
    n_simulations = data.get("n_simulations", 10000)
    ticker = data.get("ticker", "").upper()

    # Get volatility from dataset
    sigma = 0.25
    if ticker and ticker in VOL_DATA.get("tickers", {}):
        sigma = VOL_DATA["tickers"][ticker]["volatility"]

    # Fill missing volatilities
    for pos in portfolio_positions:
        if "volatility" not in pos or pos["volatility"] is None:
            pos["volatility"] = sigma

    simulation = monte_carlo.simulate_portfolio(
        portfolio_positions, S, T, r, sigma, n_simulations=n_simulations
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
    print("Server starting on http://127.0.0.1:5000")
    print("="*60 + "\n")
    
    app.run(debug=True, host="0.0.0.0", port=5000)
