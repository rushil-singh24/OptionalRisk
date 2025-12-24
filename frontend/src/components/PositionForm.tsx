import React, { useEffect, useState } from "react";

interface Ticker {
  ticker: string;
  volatility: number;
  latest_price: number;
  brand_name?: string;
}

interface Props {
  portfolio: any[];
  setPortfolio: (p: any[]) => void;
  defaultVolatility: number;
  tickers: Ticker[];
  loadingTickers: boolean;
}

const PositionForm: React.FC<Props> = ({ portfolio, setPortfolio, defaultVolatility, tickers, loadingTickers }) => {
  const [position, setPosition] = useState({
    type: "call",
    side: "long",
    quantity: 1,
    strike: 100,
    time_to_expiry: 0.5,
    volatility: defaultVolatility,
    ticker: ""
  });
  const [tickerSearch, setTickerSearch] = useState("");

  // Keep the form's default volatility in sync with the selected ticker
  useEffect(() => {
    setPosition((prev) => ({ ...prev, volatility: defaultVolatility }));
  }, [defaultVolatility]);

  const filteredTickers = tickers.filter(t =>
    t.ticker.toLowerCase().includes(tickerSearch.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ["quantity", "strike", "time_to_expiry", "volatility"];
    setPosition({
      ...position,
      [name]: numericFields.includes(name) ? parseFloat(value) : value
    });
  };

  const addPosition = () => {
    if (!position.ticker) {
      alert("Please select a ticker for this option.");
      return;
    }

    setPortfolio([...portfolio, position]);
    setPosition({
      type: "call",
      side: "long",
      quantity: 1,
      strike: 100,
      time_to_expiry: 0.5,
      volatility: defaultVolatility,
      ticker: ""
    });
    setTickerSearch("");
  };

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 500 }}>
          Ticker
          <input
            type="text"
            name="ticker"
            value={tickerSearch || position.ticker}
            placeholder="Type to search (e.g., AAPL)"
            onChange={(e) => {
              setTickerSearch(e.target.value);
              setPosition({ ...position, ticker: "" });
            }}
            style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
          />
          <div style={{ maxHeight: "140px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#f8fafc" }}>
            {loadingTickers ? (
              <div style={{ padding: "0.5rem", color: "#64748b" }}>Loading tickers...</div>
            ) : filteredTickers.length === 0 ? (
              <div style={{ padding: "0.5rem", color: "#64748b" }}>No matches</div>
            ) : (
              filteredTickers.map(t => (
                <div
                  key={t.ticker}
                  onClick={() => {
                    setPosition({ ...position, ticker: t.ticker, volatility: t.volatility });
                    setTickerSearch(t.ticker);
                  }}
                  style={{
                    padding: "0.5rem",
                    cursor: "pointer",
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: position.ticker === t.ticker ? "#eef2ff" : "transparent"
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{t.ticker}</div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    σ={t.volatility.toFixed(4)} | ${t.latest_price.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 500 }}>
          Option Type
          <select name="type" value={position.type} onChange={handleChange} style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 500 }}>
          Position Side
          <select name="side" value={position.side} onChange={handleChange} style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 500 }}>
          Quantity (contracts)
          <input type="number" name="quantity" value={position.quantity} onChange={handleChange} placeholder="e.g. 1" style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 500 }}>
          Strike Price
          <input type="number" name="strike" value={position.strike} onChange={handleChange} placeholder="e.g. 100" style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 500 }}>
          Time to Expiry (years)
          <input type="number" step="0.01" name="time_to_expiry" value={position.time_to_expiry} onChange={handleChange} placeholder="0.5 = 6 months" style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 500 }}>
          Volatility (σ)
          <input type="number" step="0.01" name="volatility" value={position.volatility} onChange={handleChange} placeholder="Auto from ticker" style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Defaults to selected ticker volatility</span>
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button
          onClick={addPosition}
          style={{
            padding: "0.6rem 1rem",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(16, 185, 129, 0.25)"
          }}
        >
          Add Position
        </button>
        <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
          Tip: set time in years (0.5 = 6 months)
        </span>
      </div>

      {portfolio.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 0.5rem 0" }}>Current Portfolio</h4>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {portfolio.map((p, idx) => (
              <div key={idx} style={{ padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "6px", backgroundColor: "#f8fafc" }}>
                [{p.ticker}] {p.side.toUpperCase()} {p.quantity} {p.type.toUpperCase()} @ {p.strike} | T={p.time_to_expiry}y | σ={p.volatility}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionForm;
