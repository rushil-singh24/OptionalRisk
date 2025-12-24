import React, { useState, useEffect } from "react";
import PositionForm from "../components/PositionForm";
import PortfolioSummary from "../components/PortfolioSummary";
import GreeksChart from "../components/GreeksChart";
import MonteCarloChart from "../components/MonteCarloChart";
import { analyzePortfolio, getVolatility } from "../api";

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [volatility, setVolatility] = useState<number>(0.25);
  const [currentPrice, setCurrentPrice] = useState<number>(100);
  const [riskFreeRate, setRiskFreeRate] = useState<number>(0.03);
  const [loading, setLoading] = useState<boolean>(false);

  // Load historical volatility on mount
  useEffect(() => {
    getVolatility()
      .then(data => {
        console.log("Volatility data:", data);
        setVolatility(data.historical_volatility || 0.25);
      })
      .catch(err => console.error("Error fetching volatility:", err));
  }, []);

  const handleAnalyze = async () => {
    if (portfolio.length === 0) {
      alert("Please add at least one position to analyze.");
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
      <h1 style={{ marginBottom: "2rem" }}>Options Risk Dashboard</h1>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {/* Portfolio Input */}
        <section className="card">
          <h2 className="section-title">Portfolio Input</h2>
          <PositionForm
            portfolio={portfolio}
            setPortfolio={setPortfolio}
            defaultVolatility={volatility}
          />
        </section>

        {/* Market Parameters */}
        <section className="card">
          <h2 className="section-title">Market Parameters</h2>
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
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Risk-Free Rate (decimal)
              </label>
              <input
                type="number"
                step="0.001"
                value={riskFreeRate}
                onChange={e => setRiskFreeRate(parseFloat(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Historical Volatility
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
                title="Loaded from dataset"
              />
            </div>
          </div>
        </section>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || portfolio.length === 0}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: 600,
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: portfolio.length === 0 ? "not-allowed" : "pointer",
            opacity: portfolio.length === 0 ? 0.5 : 1,
            transition: "all 0.2s"
          }}
        >
          {loading ? "Analyzing..." : "Analyze Portfolio"}
        </button>

        {/* Results Section */}
        {summary && (
          <>
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
