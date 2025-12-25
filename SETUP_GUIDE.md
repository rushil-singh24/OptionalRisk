# Setup Guide

Let's get this running on your machine step by step. No assumptions, just clear instructions.

## What You'll Need

Before starting, make sure you have:
- **Python 3.8 or newer** ([Download here](https://www.python.org/downloads/))
- **Node.js 18 or newer** ([Download here](https://nodejs.org/))
- A terminal/command prompt
- About 5 minutes

## Step 1: Get the Code
```bash
# Clone or download the project
cd OptionsRiskAnalysis
```

## Step 2: Set Up the Backend

The backend is the Python/Flask API that does all the calculations.

### 2.1 Open a Terminal in the Backend Folder
```bash
cd backend
```

### 2.2 Create a Virtual Environment

This keeps your Python packages organized and separate from other projects.

**On Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` appear in your terminal prompt - that means it worked!

### 2.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

This installs Flask, NumPy, Pandas, SciPy, and other packages. Takes about 30-60 seconds.

### 2.4 Process the Stock Data

This creates the `volatility.json` file with pre-calculated values.
```bash
python data/raw/preprocess_data.py
```

You should see:
```
============================================================
Historical Volatility Calculator
============================================================
Found 1 CSV file(s)

Processing your_file.csv...
  Found 61 unique tickers...

✓ Processed 61 tickers
✓ Output saved to: backend/data/processed/volatility.json
============================================================
```

### 2.5 Start the Backend Server
```bash
python app.py
```

You should see:
```
============================================================
Options Risk Analysis Backend
============================================================
Tickers loaded: 61
Server starting on http://127.0.0.1:5001
============================================================
```

**Leave this terminal running!** The backend needs to stay on.

## Step 3: Set Up the Frontend

Open a **NEW terminal** (keep the backend running in the first one).

### 3.1 Navigate to Frontend Folder
```bash
cd frontend
```

### 3.2 Install JavaScript Dependencies
```bash
npm install
```

This downloads React, Vite, and other packages. Takes about 60-90 seconds.

### 3.3 Start the Development Server
```bash
npm run dev
```

You should see:
```
  VITE v6.0.3  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 4: Open the App

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the dashboard!

## Using the App - Quick Start

### Select a Stock
1. Look for the "Select Stock Ticker" section
2. Type to search (try "PTON" or "AAPL")
3. Click a ticker - volatility and price auto-fill

### Build a Position
1. Choose option type (Call or Put)
2. Choose side (Long or Short)
3. Enter strike price (e.g., 110)
4. Enter time to expiry (0.5 = 6 months)
5. Click "Add Position"

### Analyze
1. Click "📊 Analyze Portfolio"
2. See portfolio value and Greeks
3. Click "Run Monte Carlo" for risk simulation

## Troubleshooting

### "Port 5001 already in use"
Something else is using port 5001. Either:
- Find and stop that program, or
- Edit `backend/app.py`, change line 101 from `port=5001` to `port=5002`
- Edit `frontend/src/api.ts`, change the port in `API_BASE`

### "volatility.json not found"
You need to run the preprocessing script:
```bash
cd backend
python data/raw/preprocess_data.py
```

### Backend won't start
Make sure your virtual environment is activated - you should see `(venv)` in your prompt.

### Frontend shows connection errors
1. Make sure the backend is running (check the terminal)
2. Check the backend URL in browser: http://127.0.0.1:5001/health
3. You should see: `{"status":"ok","tickers_loaded":61}`

### Nothing shows up in the browser
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Check browser console for errors (F12 key)
3. Make sure you're on http://localhost:5173

## Stopping the Servers

When you're done:
1. In the backend terminal: Press `Ctrl+C`
2. In the frontend terminal: Press `Ctrl+C`

## Next Steps

- Try different option strategies (spreads, straddles)
- Adjust the risk-free rate
- Compare different tickers
- Run Monte Carlo with different position sizes

## Need Help?

Check that:
- [ ] Backend is running on port 5001
- [ ] Frontend is running on port 5173
- [ ] `volatility.json` exists in `backend/data/processed/`
- [ ] Virtual environment is activated (you see `venv` in prompt)

---

**You're all set!** Start exploring options pricing and risk analysis.
