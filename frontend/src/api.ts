import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

export const getHealth = async () => {
  const response = await axios.get(`${API_BASE}/health`);
  return response.data;
};

export const getVolatility = async () => {
  const response = await axios.get(`${API_BASE}/market/volatility`);
  return response.data;
};

export const analyzePortfolio = async (portfolio: any, currentPrice: number, riskFreeRate: number) => {
  const response = await axios.post(`${API_BASE}/portfolio/analyze`, {
    portfolio,
    current_price: currentPrice,
    risk_free_rate: riskFreeRate,
  });
  return response.data;
};
