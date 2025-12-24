import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
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

  // Color bars based on positive/negative values
  const getColor = (value: number) => {
    return value >= 0 ? "#10b981" : "#ef4444";
  };

  return (
    <div className="card">
      <h2 className="section-title">Greeks Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={greeksData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="greek" />
          <YAxis />
          <Tooltip 
            formatter={(value: any) => value.toFixed(4)}
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {greeksData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GreeksChart;
