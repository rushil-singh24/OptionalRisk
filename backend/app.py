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
# Load processed volatility
# ----------------------------
try:
    with open("data/processed/volatility.json") as f:
        VOL_DATA = json.load(f)
except FileNotFoundError:
    VOL_DATA = {"symbol": "UNKNOWN", "historical_volatility": 0.25}

# ----------------------------
# Health check endpoint
# ----------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# ----------------------------
# Market volatility endpoint
# ----------------------------
@app.route("/market/volatility", methods=["GET"])
def get_volatility():
    return jsonify(VOL_DATA)

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

    # Fill missing volatilities from dataset
    for pos in portfolio_positions:
        if "volatility" not in pos or pos["volatility"] is None:
            pos["volatility"] = VOL_DATA["historical_volatility"]

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
    T = data.get("horizon", 0.5)          # years
    n_simulations = data.get("n_simulations", 10000)

    # Fill missing volatilities
    for pos in portfolio_positions:
        if "volatility" not in pos or pos["volatility"] is None:
            pos["volatility"] = VOL_DATA["historical_volatility"]

    simulation = monte_carlo.simulate_portfolio(
        portfolio_positions, S, T, r, VOL_DATA["historical_volatility"], n_simulations=n_simulations
    )

    return jsonify(simulation)

# ----------------------------
# Run Flask server
# ----------------------------
if __name__ == "__main__":
    app.run(debug=True)
