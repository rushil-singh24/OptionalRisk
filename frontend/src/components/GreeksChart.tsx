/** Minimal Recharts example to visualize placeholder Greeks data. */
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const sampleGreeks = [
  { greek: "Delta", value: 0.0 },
  { greek: "Gamma", value: 0.0 },
  { greek: "Vega", value: 0.0 },
  { greek: "Theta", value: 0.0 },
  { greek: "Rho", value: 0.0 },
];

const GreeksChart = () => {
  return (
    <div style={{ height: 260 }}>
      <p className="placeholder" style={{ marginBottom: "0.75rem" }}>
        Placeholder chart using Recharts; wire real data from backend analytics.
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sampleGreeks} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="greek" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GreeksChart;
