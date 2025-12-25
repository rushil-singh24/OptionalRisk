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
  const [riskFreeRate, setRiskFreeRate] = useState<number>(0.036);
  const [loading, setLoading] = useState<boolean>(false);
  const [tickers, setTickers] = useState<any[]>([]);
  const [loadingTickers, setLoadingTickers] = useState<boolean>(true);
  const [tickerError, setTickerError] = useState<string>("");
  const [manualPrices, setManualPrices] = useState<Record<string, number>>({});

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
    const override = manualPrices[ticker];
    setCurrentPrice(override !== undefined ? override : price);
    console.log(`Selected ticker: ${ticker}, σ=${vol}, P=${override !== undefined ? override : price}`);
  };

  // Auto-select the first ticker once data is available to keep the flow moving
  useEffect(() => {
    if (!loadingTickers && tickers.length > 0 && !selectedTicker) {
      const first = tickers[0];
      setSelectedTicker(first.ticker);
      setVolatility(first.volatility);
      const override = manualPrices[first.ticker];
      setCurrentPrice(override !== undefined ? override : first.latest_price);
    }
  }, [loadingTickers, tickers, selectedTicker, manualPrices]);

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
        <div className="hero-grid">
          <div className="hero-text">
            <div className="hero-eyebrow">Black-Scholes × Monte Carlo</div>
            <h1 className="hero-title">Option(al) Risk</h1>
            <p className="hero-subheadline">Understand, build, and stress-test options portfolios.</p>
            <p className="hero-subtitle">
              The Black–Scholes equation prices options by blending spot, strike, time to expiry, volatility, and the risk-free rate under smooth price paths.
              Monte Carlo simulations complement it by simulating thousands of noisy futures to expose downside risk, stress scenarios, and the range of outcomes beyond a single path.
            </p>
            <div className="hero-stats">
              <div className="pill">Data coverage: {loadingTickers ? "loading…" : `${tickers.length} tickers`}</div>
              <div className="pill">Greeks + VaR in seconds</div>
              <div className="pill">Historical vols auto-filled</div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="formula-card">
              <div className="formula-card__title">Black–Scholes model</div>
              <div className="formula-card__body">
                <div className="formula-card__lhs">
                  <div className="formula-card__eq">C = S·N(d₁) − K·e<sup>−r·t</sup>·N(d₂)</div>
                  <div className="formula-card__where">where</div>
                  <div className="formula-card__d1d2">
                    <div className="formula-card__d1">d₁ = [ln(S/K) + (r + σ²/2)·t] / (σ·√t)</div>
                    <div className="formula-card__d2">d₂ = d₁ − σ·√t</div>
                  </div>
                </div>
                <div className="formula-card__rhs">
                  <div>C = Call option price</div>
                  <div>S = Current stock price</div>
                  <div>K = Strike price</div>
                  <div>r = Risk-free rate</div>
                  <div>t = Time to maturity</div>
                  <div>N = Normal CDF</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="info-grid">
        <article className="info-card">
          <h3>“Greeks” in Black–Scholes</h3>
          <p>Greeks measure risk. They tell you how an option’s value changes when something in the market changes.</p>
          <div className="greeks-table">
            <div className="greeks-row greeks-head">
              <div>Greek</div>
              <div>What It Measures</div>
              <div>Units</div>
            </div>
            <div className="greeks-row">
              <div>Delta (Δ)</div>
              <div>Sensitivity to underlying price</div>
              <div>Option price change per $1 change in stock price</div>
            </div>
            <div className="greeks-row">
              <div>Gamma (Γ)</div>
              <div>Sensitivity of delta to price</div>
              <div>Change in delta per $1 change in stock price</div>
            </div>
            <div className="greeks-row">
              <div>Theta (Θ)</div>
              <div>Sensitivity to time</div>
              <div>Option price change per day</div>
            </div>
            <div className="greeks-row">
              <div>Vega (ν)</div>
              <div>Sensitivity to volatility</div>
              <div>Option price change per 1% change in volatility</div>
            </div>
            <div className="greeks-row">
              <div>Rho (ρ)</div>
              <div>Sensitivity to interest rates</div>
              <div>Option price change per 1% change in interest rate</div>
            </div>
          </div>
        </article>
        <article className="info-card">
          <h3>Monte Carlo, visualized</h3>
          <p>Paths, drift, and volatility combine to sketch the entire distribution of outcomes.</p>
          <div className="mc-grid">
            <div className="mc-box">
              <div className="mc-label">Process</div>
              <div className="mc-body">Geometric Brownian Motion with drift r and volatility σ.</div>
            </div>
            <div className="mc-box">
              <div className="mc-label">Paths</div>
              <div className="mc-body">10,000 scenarios across a 6-month horizon by default.</div>
            </div>
            <div className="mc-box">
              <div className="mc-label">Outputs</div>
              <div className="mc-body">Portfolio value distribution + VaR at 5% and 1%.</div>
            </div>
            <div className="mc-box">
              <div className="mc-label">Use it for</div>
              <div className="mc-body">Tail risk, convexity checks, and path-dependent payoffs.</div>
            </div>
          </div>
        </article>
        <article className="info-card">
          <h3>Dataset</h3>
          <p>
            Several years of daily prices from a Kaggle-sourced dataset, preprocessed to surface latest close and realized volatility instantly.
          </p>
          <div className="dataset-grid">
            <div className="dataset-box">
              <div className="dataset-label">Coverage</div>
              <div className="dataset-body">{loadingTickers ? "Loading…" : `${tickers.length} tickers with prices + vols`}</div>
            </div>
            <div className="dataset-box">
              <div className="dataset-label">Fields</div>
              <div className="dataset-body">Latest price, historical volatility (σ), ticker, brand label.</div>
            </div>
            <div className="dataset-box">
              <div className="dataset-label">Prefill</div>
              <div className="dataset-body">Search by ticker/brand to auto-populate price and σ.</div>
            </div>
            <div className="dataset-box">
              <div className="dataset-label">Source</div>
              <div className="dataset-body">Derived from Kaggle data.</div>
            </div>
          </div>
          {tickerError && <div className="inline-alert">{tickerError}</div>}
        </article>
      </section>

      <section className="card highlight">
        <h2 className="section-title">Workflow</h2>
        <div className="pill-row">
          <div className="pill strong">1. Learn the models</div>
          <div className="pill strong">2. Select ticker + inputs</div>
          <div className="pill strong">3. Build portfolio</div>
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
              priceOverrides={manualPrices}
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
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setCurrentPrice(val);
                    const key = selectedTicker || portfolio[0]?.ticker;
                    if (key) {
                      setManualPrices(prev => ({ ...prev, [key]: val }));
                    }
                  }}
                />
                <div className="helper-text">Adjust Accordingly</div>
              </div>
              <div>
                <label className="field-label">Risk-Free Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={Number((riskFreeRate * 100).toFixed(3))}
                  onChange={e => setRiskFreeRate(parseFloat(e.target.value) / 100)}
                />
                <div className="helper-text">Current risk-free rate: {(riskFreeRate * 100).toFixed(2)}%</div>
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
