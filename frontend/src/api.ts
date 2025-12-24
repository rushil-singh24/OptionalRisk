import axios from "axios";

// Central API base so we can switch ports easily (e.g., 5001 if 5000 is taken)
export const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE ||
  "http://127.0.0.1:5000";

export const getHealth = async () => {
  const response = await axios.get(`${API_BASE}/health`);
  return response.data;
};

export const getTickers = async () => {
  const response = await axios.get(`${API_BASE}/market/tickers`);
  return response.data;
};

export const getVolatility = async () => {
  const response = await axios.get(`${API_BASE}/market/volatility`);
  return response.data;
};

export const analyzePortfolio = async (
  portfolio: any,
  currentPrice: number,
  riskFreeRate: number,
  ticker: string
) => {
  const response = await axios.post(`${API_BASE}/portfolio/analyze`, {
    portfolio,
    current_price: currentPrice,
    risk_free_rate: riskFreeRate,
    ticker,
  });
  return response.data;
};

export const simulatePortfolio = async (
  portfolio: any[],
  currentPrice: number,
  riskFreeRate: number,
  volatility: number,
  ticker: string
) => {
  const response = await axios.post(`${API_BASE}/portfolio/simulate`, {
    portfolio,
    current_price: currentPrice,
    risk_free_rate: riskFreeRate,
    horizon: 0.5,
    n_simulations: 10000,
    ticker,
    volatility,
  });
  return response.data;
};
