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

  const filteredTickers = tickers.filter(t => {
    const term = tickerSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      t.ticker.toLowerCase().includes(term) ||
      (t.brand_name || "").toLowerCase().includes(term)
    );
  });

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

  const removePosition = (idx: number) => {
    const next = portfolio.filter((_, i) => i !== idx);
    setPortfolio(next);
  };

  return (
    <div style={{ display: "grid", gap: "0.75rem", color: "#e2e8f0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 600 }}>
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
            style={{
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              color: "#e2e8f0"
            }}
          />
          <div style={{
            maxHeight: "140px",
            overflowY: "auto",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            background: "#0b1020",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)"
          }}>
            {loadingTickers ? (
              <div style={{ padding: "0.5rem", color: "#94a3b8" }}>Loading tickers...</div>
            ) : filteredTickers.length === 0 ? (
              <div style={{ padding: "0.5rem", color: "#94a3b8" }}>No matches</div>
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
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    backgroundColor: position.ticker === t.ticker ? "rgba(124, 58, 237, 0.12)" : "transparent",
                    color: "#e2e8f0",
                    transition: "background-color 0.2s"
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{t.ticker}</div>
                  {t.brand_name && (
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{t.brand_name}</div>
                  )}
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                    σ={t.volatility.toFixed(4)} | ${t.latest_price.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 600 }}>
          Option Type
          <select name="type" value={position.type} onChange={handleChange} style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "#e2e8f0"
          }}>
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 600 }}>
          Position Side
          <select name="side" value={position.side} onChange={handleChange} style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "#e2e8f0"
          }}>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 600 }}>
          Quantity (contracts)
          <input type="number" name="quantity" value={position.quantity} onChange={handleChange} placeholder="e.g. 1" style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "#e2e8f0"
          }} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 600 }}>
          Strike Price
          <input type="number" name="strike" value={position.strike} onChange={handleChange} placeholder="e.g. 100" style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "#e2e8f0"
          }} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 600 }}>
          Time to Expiry (years)
          <input type="number" step="0.01" name="time_to_expiry" value={position.time_to_expiry} onChange={handleChange} placeholder="0.5 = 6 months" style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "#e2e8f0"
          }} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 600 }}>
          Volatility (σ)
          <input type="number" step="0.01" name="volatility" value={position.volatility} onChange={handleChange} placeholder="Auto from ticker" style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "#e2e8f0"
          }} />
          <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Defaults to selected ticker volatility</span>
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button
          onClick={addPosition}
          style={{
            padding: "0.6rem 1rem",
            backgroundColor: "#38bdf8",
            color: "#04101c",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(56, 189, 248, 0.25)"
          }}
        >
          Add Position
        </button>
        <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
          Tip: set time in years (0.5 = 6 months)
        </span>
      </div>

      {portfolio.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 0.5rem 0" }}>Current Portfolio</h4>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {portfolio.map((p, idx) => (
              <div key={idx} style={{
                padding: "0.75rem",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.02)",
                color: "#e2e8f0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                  <div>
                    [{p.ticker}] {p.side.toUpperCase()} {p.quantity} {p.type.toUpperCase()} @ {p.strike} | T={p.time_to_expiry}y | σ={p.volatility}
                  </div>
                  <button
                    onClick={() => removePosition(idx)}
                    style={{
                      background: "rgba(239, 68, 68, 0.12)",
                      color: "#fecdd3",
                      border: "1px solid rgba(239, 68, 68, 0.35)",
                      borderRadius: "6px",
                      padding: "0.3rem 0.55rem",
                      cursor: "pointer"
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionForm;
