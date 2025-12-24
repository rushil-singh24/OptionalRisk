import React, { useState, useEffect } from "react";
import PositionForm from "../components/PositionForm";
import PortfolioSummary from "../components/PortfolioSummary";
import GreeksChart from "../components/GreeksChart";
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
      .then(data => setVolatility(data.historical_volatility))
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
      setSummary(result);
    } catch (err) {
      console.error("Error analyzing portfolio:", err);
      alert("Failed to analyze portfolio. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Options Risk Dashboard</h1>

      {/* Portfolio Input */}
      <section>
        <h2>Portfolio Input</h2>
        <PositionForm
          portfolio={portfolio}
          setPortfolio={setPortfolio}
          defaultVolatility={volatility}
        />
      </section>

      {/* Optional Inputs */}
      <section>
        <h2>Market Parameters</h2>
        <label>
          Current Stock Price:
          <input
            type="number"
            value={currentPrice}
            onChange={e => setCurrentPrice(parseFloat(e.target.value))}
          />
        </label>
        <label>
          Risk-Free Rate:
          <input
            type="number"
            step="0.01"
            value={riskFreeRate}
            onChange={e => setRiskFreeRate(parseFloat(e.target.value))}
          />
        </label>
      </section>

      {/* Analyze Button */}
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Portfolio"}
      </button>

      {/* Portfolio Summary & Charts */}
      {summary && (
        <section>
          <PortfolioSummary summary={summary} />
          <GreeksChart summary={summary} />
          {/* Placeholder for Monte Carlo Histogram */}
          {/* <MonteCarloHistogram summary={summary} /> */}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
