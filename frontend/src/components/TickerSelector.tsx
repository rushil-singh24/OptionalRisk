import React, { useState } from "react";
import { API_BASE } from "../api";

interface Ticker {
  ticker: string;
  volatility: number;
  latest_price: number;
  brand_name?: string;
}

interface Props {
  selectedTicker: string;
  onSelectTicker: (ticker: string, volatility: number, price: number) => void;
  tickers: Ticker[];
  loading: boolean;
}

const TickerSelector: React.FC<Props> = ({ selectedTicker, onSelectTicker, tickers, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelect = (ticker: Ticker) => {
    onSelectTicker(ticker.ticker, ticker.volatility, ticker.latest_price);
  };

  const filteredTickers = tickers.filter(t => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      t.ticker.toLowerCase().includes(term) ||
      (t.brand_name || "").toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <div>Loading tickers...</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <label style={{ fontWeight: 700, color: "#e2e8f0" }}>Select Stock Ticker</label>
        <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>API: {API_BASE}</span>
      </div>
      
      <input
        type="text"
        placeholder="Search tickers (e.g., PTON, CROX)..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "0.5rem",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          backgroundColor: "rgba(255,255,255,0.04)",
          color: "#e2e8f0"
        }}
      />

      <div style={{
        maxHeight: "200px",
        overflowY: "auto",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        backgroundColor: "#0b1020",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)"
      }}>
        {filteredTickers.length === 0 ? (
          <div style={{ padding: "1rem", textAlign: "center", color: "#94a3b8" }}>
            No tickers found
          </div>
        ) : (
          filteredTickers.map(ticker => (
            <div
              key={ticker.ticker}
              onClick={() => handleSelect(ticker)}
              style={{
                padding: "0.75rem",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: selectedTicker === ticker.ticker ? "rgba(124, 58, 237, 0.12)" : "transparent",
                transition: "background-color 0.2s",
                color: "#e2e8f0"
              }}
              onMouseEnter={(e) => {
                if (selectedTicker !== ticker.ticker) {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTicker !== ticker.ticker) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {ticker.ticker}
                  </span>
                  {ticker.brand_name && (
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                      {ticker.brand_name}
                    </div>
                  )}
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                    σ={ticker.volatility.toFixed(4)} | ${ticker.latest_price.toFixed(2)}
                  </div>
                </div>
                {selectedTicker === ticker.ticker && (
                  <span style={{ color: "#38bdf8", fontSize: "1.2rem" }}>✓</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTicker && (
        <div style={{
          marginTop: "1rem",
          padding: "0.75rem",
          backgroundColor: "rgba(56, 189, 248, 0.12)",
          borderRadius: "8px",
          fontSize: "0.9rem",
          color: "#e2e8f0",
          border: "1px solid rgba(56, 189, 248, 0.35)"
        }}>
          <strong>Selected:</strong> {selectedTicker}
        </div>
      )}
    </div>
  );
};

export default TickerSelector;
