import React from "react";

interface Props {
  summary: any;
}

const PortfolioSummary: React.FC<Props> = ({ summary }) => {
  if (!summary) {
    return (
      <div>
        <p className="placeholder">
          Add positions and click "Analyze Portfolio" to see metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">Portfolio Summary</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div className="metric-card">
          <div className="metric-label">Portfolio Value</div>
          <div className="metric-value">${summary.total_value?.toFixed(2) || "0.00"}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Delta</div>
          <div className="metric-value">{summary.total_delta?.toFixed(4) || "0.0000"}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Gamma</div>
          <div className="metric-value">{summary.total_gamma?.toFixed(4) || "0.0000"}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Vega</div>
          <div className="metric-value">{summary.total_vega?.toFixed(4) || "0.0000"}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Theta</div>
          <div className="metric-value">{summary.total_theta?.toFixed(4) || "0.0000"}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Rho</div>
          <div className="metric-value">{summary.total_rho?.toFixed(4) || "0.0000"}</div>
        </div>
      </div>

      {/* Individual Positions Breakdown */}
      <div style={{ marginTop: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Position Details</h3>
        <table style={{ width: "100%", fontSize: "0.9rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Position</th>
              <th style={{ textAlign: "right", padding: "0.5rem" }}>Value</th>
              <th style={{ textAlign: "right", padding: "0.5rem" }}>Delta</th>
              <th style={{ textAlign: "right", padding: "0.5rem" }}>Gamma</th>
              <th style={{ textAlign: "right", padding: "0.5rem" }}>Vega</th>
              <th style={{ textAlign: "right", padding: "0.5rem" }}>Theta</th>
            </tr>
          </thead>
          <tbody>
            {summary.positions?.map((pos: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.5rem" }}>Position {idx + 1}</td>
                <td style={{ textAlign: "right", padding: "0.5rem" }}>${pos.value?.toFixed(2)}</td>
                <td style={{ textAlign: "right", padding: "0.5rem" }}>{pos.delta?.toFixed(4)}</td>
                <td style={{ textAlign: "right", padding: "0.5rem" }}>{pos.gamma?.toFixed(4)}</td>
                <td style={{ textAlign: "right", padding: "0.5rem" }}>{pos.vega?.toFixed(4)}</td>
                <td style={{ textAlign: "right", padding: "0.5rem" }}>{pos.theta?.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioSummary;
