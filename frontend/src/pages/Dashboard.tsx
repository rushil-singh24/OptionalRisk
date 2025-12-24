import React, { useState, useEffect } from "react";
import PositionForm from "../components/PositionForm";
import PortfolioSummary from "../components/PortfolioSummary";
import GreeksChart from "../components/GreeksChart";
import MonteCarloChart from "../components/MonteCarloChart";
import TickerSelector from "../components/TickerSelector";
import { analyzePortfolio } from "../api";

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedTicker, setSelectedTicker] = useState<string>("");
  const [volatility, setVolatility] = useState<number>(0.25);
  const [currentPrice, setCurrentPrice] = useState<number>(100);
  const [riskFreeRate, setRiskFreeRate] = useState<number>(0.03);
  const [loading, setLoading] = useState<boolean>(false);

  const handleTickerSelect = (ticker: string, vol: number, price: number) => {
    setSelectedTicker(ticker);
    setVolatility(vol);
    setCurrentPrice(price);
    console.log(`Selected ticker: ${ticker}, σ=${vol}, P=${price}`);
  };

  const handleAnalyze = async () => {
    if (portfolio.length === 0) {
      alert("Please add at least one position to analyze.");
      return;
    }

    if (!selectedTicker) {
      alert("Please select a stock ticker first.");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzePortfolio(portfolio, currentPrice, riskFreeRate);
      console.log("Analysis result:", result);
      setSummary(result);
    } catch (err) {
      console.error("Error analyzing portfolio:", err);
      alert("Failed to analyze portfolio. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700 }}>
          Options Risk Dashboard
        </h1>
        <p style={{ margin: "0.5rem 0 0 0", color: "#64748b" }}>
          Analyze options portfolios using Black-Scholes and Monte Carlo simulation
        </p>
      </div>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {/* Ticker Selection */}
        <section className="card">
          <h2 className="section-title">1. Select Underlying Stock</h2>
          <TickerSelector
            selectedTicker={selectedTicker}
            onSelectTicker={handleTickerSelect}
          />
        </section>

        {/* Market Parameters */}
        <section className="card">
          <h2 className="section-title">2. Market Parameters</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Current Stock Price ($)
              </label>
              <input
                type="number"
                value={currentPrice}
                onChange={e => setCurrentPrice(parseFloat(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px"
                }}
              />
              <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                Auto-filled from historical data
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Risk-Free Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={riskFreeRate * 100}
                onChange={e => setRiskFreeRate(parseFloat(e.target.value) / 100)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px"
                }}
              />
              <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                Current risk-free rate: {(riskFreeRate * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Historical Volatility (σ)
              </label>
              <input
                type="number"
                step="0.01"
                value={volatility}
                readOnly
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  backgroundColor: "#f8fafc"
                }}
                title="Calculated from historical data"
              />
              <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                Calculated from {selectedTicker || "dataset"}
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Input */}
        <section className="card">
          <h2 className="section-title">3. Build Portfolio</h2>
          <PositionForm
            portfolio={portfolio}
            setPortfolio={setPortfolio}
            defaultVolatility={volatility}
          />
        </section>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || portfolio.length === 0 || !selectedTicker}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: 600,
            backgroundColor: selectedTicker && portfolio.length > 0 ? "#6366f1" : "#94a3b8",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: portfolio.length === 0 || !selectedTicker ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            boxShadow: selectedTicker && portfolio.length > 0 ? "0 4px 6px rgba(99, 102, 241, 0.25)" : "none"
          }}
        >
          {loading ? "⏳ Analyzing..." : "📊 Analyze Portfolio"}
        </button>

        {/* Results Section */}
        {summary && (
          <>
            <div style={{
              padding: "1rem",
              backgroundColor: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "8px",
              color: "#166534",
              fontWeight: 500
            }}>
              ✓ Analysis complete for {selectedTicker}
            </div>

            <PortfolioSummary summary={summary} />
            <GreeksChart summary={summary} />
            <MonteCarloChart 
              portfolio={portfolio}
              currentPrice={currentPrice}
              riskFreeRate={riskFreeRate}
              volatility={volatility}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
