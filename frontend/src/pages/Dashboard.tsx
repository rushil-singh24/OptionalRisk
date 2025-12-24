import React, { useState, useEffect } from "react";
import PositionForm from "../components/PositionForm";
import PortfolioSummary from "../components/PortfolioSummary";
import GreeksChart from "../components/GreeksChart";
import MonteCarloChart from "../components/MonteCarloChart";
import TickerSelector from "../components/TickerSelector";
import { analyzePortfolio, getTickers } from "../api";

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedTicker, setSelectedTicker] = useState<string>("");
  const [volatility, setVolatility] = useState<number>(0.25);
  const [currentPrice, setCurrentPrice] = useState<number>(100);
  const [riskFreeRate, setRiskFreeRate] = useState<number>(0.03);
  const [loading, setLoading] = useState<boolean>(false);
  const [tickers, setTickers] = useState<any[]>([]);
  const [loadingTickers, setLoadingTickers] = useState<boolean>(true);
  const [tickerError, setTickerError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTickers();
        setTickers(data);
        setTickerError("");
      } catch (err) {
        console.error("Failed to load tickers", err);
        setTickerError("Unable to load tickers from the backend. Start the API and retry.");
      } finally {
        setLoadingTickers(false);
      }
    };
    load();
  }, []);

  const handleTickerSelect = (ticker: string, vol: number, price: number) => {
    setSelectedTicker(ticker);
    setVolatility(vol);
    setCurrentPrice(price);
    console.log(`Selected ticker: ${ticker}, σ=${vol}, P=${price}`);
  };

  // Auto-select the first ticker once data is available to keep the flow moving
  useEffect(() => {
    if (!loadingTickers && tickers.length > 0 && !selectedTicker) {
      const first = tickers[0];
      setSelectedTicker(first.ticker);
      setVolatility(first.volatility);
      setCurrentPrice(first.latest_price);
    }
  }, [loadingTickers, tickers, selectedTicker]);

  const handleAnalyze = async () => {
    if (portfolio.length === 0) {
      alert("Please add at least one position to analyze.");
      return;
    }

    const effectiveTicker = selectedTicker || portfolio[0]?.ticker;

    setLoading(true);
    try {
      const result = await analyzePortfolio(portfolio, currentPrice, riskFreeRate, effectiveTicker || "");
      console.log("Analysis result:", result);
      setSummary(result);
    } catch (err) {
      console.error("Error analyzing portfolio:", err);
      alert("Failed to analyze portfolio. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const effectiveTicker = selectedTicker || portfolio[0]?.ticker || "";
  const readyToAnalyze = portfolio.length > 0 && effectiveTicker;

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-eyebrow">Black-Scholes + Monte Carlo in one workflow</div>
        <h1>Understand, build, and stress-test options portfolios</h1>
        <p className="hero-subtitle">
          Start with the theory, pick underlyings from the dataset, assemble trades, then run Black-Scholes analytics and Monte Carlo simulations.
        </p>
        <div className="hero-stats">
          <div className="pill">Data coverage: {loadingTickers ? "loading…" : `${tickers.length} tickers`}</div>
          <div className="pill">Greeks + VaR in seconds</div>
          <div className="pill">Historical vols auto-filled</div>
        </div>
      </header>

      <section className="info-grid">
        <article className="info-card">
          <h3>Black-Scholes primer</h3>
          <p>
            Closed-form pricing for vanilla options (European as the baseline). Use it to sanity-check prices and read sensitivities (Δ, Γ, Vega, Θ, ρ).
          </p>
          <div className="formula-block">
            <div className="formula-title">Call price</div>
            <div className="formula-body">C = S·N(d1) − K·exp(-rT)·N(d2)</div>
          </div>
          <div className="formula-grid">
            <div className="chip">d1 = (ln(S/K) + (r + 0.5σ²)T) / (σ√T)</div>
            <div className="chip">d2 = d1 − σ√T</div>
          </div>
          <div className="vars-grid">
            <span className="var-pill">S: spot</span>
            <span className="var-pill">K: strike</span>
            <span className="var-pill">r: risk-free rate</span>
            <span className="var-pill">T: time (years)</span>
            <span className="var-pill">σ: volatility</span>
            <span className="var-pill">N(): normal CDF</span>
          </div>
          <p className="small-muted" style={{ marginTop: "0.5rem" }}>
            Use: fair-value checks, intuition for how price moves with underlyings, time, rates, and volatility.
          </p>
        </article>
        <article className="info-card">
          <h3>Monte Carlo intuition</h3>
          <p>
            Simulate thousands of price paths (Geometric Brownian Motion: random walks with drift and volatility).
            Great for visualizing P&amp;L distribution and tail risk, especially when payoffs are path-dependent or non-linear.
          </p>
          <ul>
            <li>Paths: 10,000 by default over a 6M horizon</li>
            <li>Outputs: histogram of portfolio values plus VaR at 5% and 1%</li>
            <li>Interpretation: how wide outcomes spread, and where the tails sit</li>
          </ul>
        </article>
        <article className="info-card">
          <h3>Dataset</h3>
          <p>
            Several years of daily prices (thousands of points per ticker), preprocessed so you get latest close and realized volatility out of the box.
          </p>
          <ul>
            <li>{loadingTickers ? "Loading coverage…" : `Coverage: ${tickers.length} stocks`} </li>
            <li>Fields: latest price, historical volatility (σ)</li>
            <li>Search by ticker or brand name to prefill inputs instantly</li>
          </ul>
          {tickerError && <div className="inline-alert">{tickerError}</div>}
        </article>
      </section>

      <section className="card highlight">
        <h2 className="section-title">Workflow</h2>
        <div className="pill-row">
          <div className="pill strong">1. Learn the models</div>
          <div className="pill strong">2. Select ticker + inputs</div>
          <div className="pill strong">3. Add option legs</div>
          <div className="pill strong">4. Analyze and simulate</div>
        </div>
        <p className="small-muted">Tip: start by clicking a ticker below—volatility and price will prefill.</p>
      </section>

      <section className="card">
        <h2 className="section-title">Set Underlying &amp; Market Inputs</h2>
        <div className="two-column">
          <div className="subcard">
            <TickerSelector
              selectedTicker={selectedTicker}
              onSelectTicker={handleTickerSelect}
              tickers={tickers}
              loading={loadingTickers}
            />
          </div>
          <div className="subcard">
            <div className="section-title small">Market parameters</div>
            <div className="input-grid">
              <div>
                <label className="field-label">Current Stock Price ($)</label>
                <input
                  type="number"
                  value={currentPrice}
                  onChange={e => setCurrentPrice(parseFloat(e.target.value))}
                />
                <div className="helper-text">Auto-filled from historical data</div>
              </div>
              <div>
                <label className="field-label">Risk-Free Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskFreeRate * 100}
                  onChange={e => setRiskFreeRate(parseFloat(e.target.value) / 100)}
                />
                <div className="helper-text">Current risk-free rate: {(riskFreeRate * 100).toFixed(1)}%</div>
              </div>
              <div>
                <label className="field-label">Historical Volatility (σ)</label>
                <input
                  type="number"
                  step="0.01"
                  value={volatility}
                  readOnly
                  title="Calculated from historical data"
                />
                <div className="helper-text">Calculated from {selectedTicker || "dataset"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Build Portfolio</h2>
        <PositionForm
          portfolio={portfolio}
          setPortfolio={setPortfolio}
          defaultVolatility={volatility}
          tickers={tickers}
          loadingTickers={loadingTickers}
        />
      </section>

      <section className="card action-card">
        <div className="action-card__content">
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0" }}>Run Black-Scholes analytics</h3>
            <p className="helper-text">
              Calculates option values and portfolio Greeks using the current price, rate, and vol above.
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !readyToAnalyze}
            className="primary-button"
          >
            {loading ? "⏳ Analyzing..." : "📊 Analyze Portfolio"}
          </button>
        </div>
        {!readyToAnalyze && (
          <div className="inline-alert">Add at least one position and pick a ticker to enable analysis.</div>
        )}
      </section>

      {/* Results Section */}
      {summary && (
        <>
          <div className="success-banner">
            ✓ Analysis complete for {effectiveTicker}
          </div>

          <PortfolioSummary summary={summary} />
          <GreeksChart summary={summary} />
          <MonteCarloChart 
            portfolio={portfolio}
            currentPrice={currentPrice}
            riskFreeRate={riskFreeRate}
            volatility={volatility}
            ticker={effectiveTicker}
          />
        </>
      )}

      {!summary && (
        <section className="card">
          <h3 className="section-title">Results</h3>
          <p className="placeholder">
            Analyze the portfolio to see valuation, Greeks, and a Monte Carlo distribution of outcomes.
          </p>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
