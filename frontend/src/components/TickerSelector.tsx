import React, { useState, useEffect } from "react";
import axios from "axios";

interface Ticker {
  ticker: string;
  volatility: number;
  latest_price: number;
  brand_name?: string;
}

interface Props {
  selectedTicker: string;
  onSelectTicker: (ticker: string, volatility: number, price: number) => void;
}

const TickerSelector: React.FC<Props> = ({ selectedTicker, onSelectTicker }) => {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTickers();
  }, []);

  const loadTickers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/market/tickers");
      setTickers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading tickers:", err);
      setLoading(false);
    }
  };

  const handleSelect = (ticker: Ticker) => {
    onSelectTicker(ticker.ticker, ticker.volatility, ticker.latest_price);
  };

  const filteredTickers = tickers.filter(t =>
    t.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading tickers...</div>;
  }

  return (
    <div>
      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
        Select Stock Ticker
      </label>
      
      <input
        type="text"
        placeholder="Search tickers (e.g., PTON, CROX)..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "0.5rem",
          border: "1px solid #e2e8f0",
          borderRadius: "6px"
        }}
      />

      <div style={{
        maxHeight: "200px",
        overflowY: "auto",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        backgroundColor: "#f8fafc"
      }}>
        {filteredTickers.length === 0 ? (
          <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
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
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: selectedTicker === ticker.ticker ? "#eef2ff" : "transparent",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                if (selectedTicker !== ticker.ticker) {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
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
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    σ={ticker.volatility.toFixed(4)} | ${ticker.latest_price.toFixed(2)}
                  </div>
                </div>
                {selectedTicker === ticker.ticker && (
                  <span style={{ color: "#6366f1", fontSize: "1.2rem" }}>✓</span>
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
          backgroundColor: "#eef2ff",
          borderRadius: "6px",
          fontSize: "0.9rem"
        }}>
          <strong>Selected:</strong> {selectedTicker}
        </div>
      )}
    </div>
  );
};

export default TickerSelector;
