/** Axios helpers for talking to the Flask backend. */
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:5000",
});

export async function fetchVolatility() {
  const { data } = await client.get<{ volatility: number }>("/market/volatility");
  return data;
}

export async function analyzePortfolio(portfolio: unknown) {
  const { data } = await client.post("/portfolio/analyze", portfolio);
  return data;
}
