import React, { useState } from "react";
import { simulatePortfolio } from "../api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";

interface Props {
  portfolio: any[];
  currentPrice: number;
  riskFreeRate: number;
  volatility: number;
  ticker: string;
}

const MonteCarloChart: React.FC<Props> = ({ portfolio, currentPrice, riskFreeRate, volatility, ticker }) => {
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    if (portfolio.length === 0 || !ticker) return;

    setLoading(true);
    try {
      const response = await simulatePortfolio(
        portfolio,
        currentPrice,
        riskFreeRate,
        volatility,
        ticker
      );
      setSimulation(response);
    } catch (err) {
      console.error("Monte Carlo simulation error:", err);
      alert("Failed to run simulation");
    } finally {
      setLoading(false);
    }
  };

  // Create histogram data
  const createHistogram = (values: number[], bins: number = 50) => {
    if (!values.length) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins || 1; // avoid zero width when all values equal

    const histogram = Array(bins).fill(0);
    values.forEach(val => {
      const binIndex = Math.min(Math.floor((val - min) / binWidth), bins - 1);
      histogram[binIndex]++;
    });

    return histogram.map((count, i) => ({
      value: min + i * binWidth,
      count,
    }));
  };

  const histogramData = simulation?.portfolio_values
    ? createHistogram(simulation.portfolio_values)
    : [];

  return (
    <div className="card">
      <h2 className="section-title">Monte Carlo Simulation</h2>
      
      <button 
        onClick={runSimulation} 
        disabled={loading || portfolio.length === 0 || !ticker}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#6366f1",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: portfolio.length === 0 || !ticker ? "not-allowed" : "pointer",
          opacity: portfolio.length === 0 || !ticker ? 0.5 : 1,
          marginBottom: "1rem"
        }}
      >
        {loading ? "Simulating..." : "Run Monte Carlo (10,000 paths)"}
      </button>

      {simulation && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div className="metric-card">
              <div className="metric-label">Mean P&L</div>
              <div className="metric-value">${simulation.mean?.toFixed(2)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Std Dev</div>
              <div className="metric-value">${simulation.std?.toFixed(2)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">VaR (5%)</div>
              <div className="metric-value" style={{ color: "#ef4444" }}>
                ${simulation.VaR_5?.toFixed(2)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">VaR (1%)</div>
              <div className="metric-value" style={{ color: "#dc2626" }}>
                ${simulation.VaR_1?.toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Portfolio P&L Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis 
                  dataKey="value" 
                  tickFormatter={(val) => `$${val.toFixed(0)}`}
                  label={{ value: "P&L ($)", position: "insideBottom", offset: -5 }}
                  stroke="#cbd5e1"
                />
                <YAxis label={{ value: "Frequency", angle: -90, position: "insideLeft" }} stroke="#cbd5e1" />
                <Tooltip 
                  formatter={(value: any, name: string) => [value, "Frequency"]}
                  labelFormatter={(label) => `Value: $${parseFloat(label).toFixed(2)}`}
                  contentStyle={{ backgroundColor: "#0b1020", border: "1px solid #1f2937", color: "#e2e8f0" }}
                  labelStyle={{ color: "#e2e8f0" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="count" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </>
      )}

      {!simulation && !loading && (
        <p className="placeholder">Click "Run Monte Carlo" to simulate portfolio outcomes over 6 months.</p>
      )}
    </div>
  );
};

export default MonteCarloChart;
