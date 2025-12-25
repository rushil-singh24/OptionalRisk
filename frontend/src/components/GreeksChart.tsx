import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  ReferenceLine
} from "recharts";

interface Props {
  summary: any;
}

const GreeksChart: React.FC<Props> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="card">
        <h2 className="section-title">Greeks Overview</h2>
        <p className="placeholder">No data to display. Analyze a portfolio first.</p>
      </div>
    );
  }

  const greeksData = [
    { greek: "Delta", value: summary.total_delta || 0 },
    { greek: "Gamma", value: summary.total_gamma || 0 },
    { greek: "Vega", value: summary.total_vega || 0 },
    { greek: "Theta", value: summary.total_theta || 0 },
    { greek: "Rho", value: summary.total_rho || 0 },
  ];

  const maxAbs = Math.max(
    0.1,
    ...greeksData.map(d => Math.abs(d.value || 0))
  );

  // Color bars based on positive/negative values
  const getColor = (value: number) => {
    return value >= 0 ? "#10b981" : "#ef4444";
  };

  const explainGreek = (name: string, value: number) => {
    const abs = Math.abs(value);
    const direction = value > 0 ? "positive" : value < 0 ? "negative" : "flat";
    const perDay = abs / 365;
    const perPct = abs / 100;
    switch (name) {
      case "Delta":
        return direction === "flat"
          ? "Δ near 0: price changes have little effect."
          : `Δ ${direction}: portfolio ${direction === "positive" ? "gains" : "loses"} about $${abs.toFixed(2)} per $1 move.`;
      case "Gamma":
        return direction === "flat"
          ? "Γ near 0: delta is stable as price moves."
          : `Γ ${direction}: delta ${direction === "positive" ? "accelerates" : "decelerates"} as price rises.`;
      case "Vega":
        return direction === "flat"
          ? "Vega near 0: volatility changes have little effect."
          : `Vega ${direction}: ~$${perPct.toFixed(2)} per 1% vol change (annualized unit basis).`;
      case "Theta":
        return direction === "flat"
          ? "Θ near 0: time decay is minimal."
          : `Θ ${direction}: annualized ${direction === "negative" ? "lose" : "earn"} ~$${abs.toFixed(2)}; ≈ $${perDay.toFixed(2)} per day.`;
      case "Rho":
        return direction === "flat"
          ? "ρ near 0: rates have little effect."
          : `ρ ${direction}: ~$${perPct.toFixed(2)} per 1% rate change (annualized unit basis).`;
      default:
        return "";
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Greeks Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={greeksData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="greek" stroke="#cbd5e1" />
          <YAxis
            domain={[-maxAbs * 1.2, maxAbs * 1.2]}
            stroke="#cbd5e1"
            tickFormatter={(v) => v.toFixed(2)}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
          <Tooltip
            formatter={(value: any) => Number(value).toFixed(4)}
            contentStyle={{ backgroundColor: "#0b1020", border: "1px solid #1f2937", color: "#e2e8f0" }}
            labelStyle={{ color: "#e2e8f0" }}
            itemStyle={{ color: "#e2e8f0" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={36}>
            {greeksData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="greeks-insight-grid">
        {greeksData.map(item => (
          <div key={item.greek} className="greeks-insight">
            <div className="greeks-insight__header">
              <span className="greeks-insight__name">{item.greek}</span>
              <span className="greeks-insight__value">{item.value.toFixed(4)}</span>
            </div>
            <div className="greeks-insight__body">
              {explainGreek(item.greek, item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GreeksChart;
