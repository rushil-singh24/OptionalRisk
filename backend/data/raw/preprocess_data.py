"""
Enhanced data preprocessing script for multi-stock dataset.
Calculates historical volatility for each stock ticker.
"""

import pandas as pd
import numpy as np
import json
import os
from pathlib import Path

# Resolve paths relative to this script's location to avoid cwd issues
RAW_DATA_PATH = Path(__file__).resolve().parent  # backend/data/raw
PROCESSED_DATA_PATH = RAW_DATA_PATH.parent / "processed"
OUTPUT_FILE = PROCESSED_DATA_PATH / "volatility.json"

def calculate_volatility(df, ticker):
    """
    Calculate annualized historical volatility for a single stock.
    
    Parameters:
    - df: DataFrame with 'Date' and 'Close' columns for one ticker
    - ticker: Stock ticker symbol
    
    Returns:
    - dict with ticker and volatility
    """
    # Sort by date
    df = df.sort_values('Date').copy()
    
    # Calculate log returns
    df['log_return'] = np.log(df['Close'] / df['Close'].shift(1))
    
    # Drop NaN values
    df = df.dropna(subset=['log_return'])
    
    if len(df) < 30:  # Need at least 30 days of data
        print(f"Warning: {ticker} has only {len(df)} data points. Skipping.")
        return None
    
    # Calculate annualized volatility (assuming 252 trading days)
    volatility = df['log_return'].std() * np.sqrt(252)
    
    # Calculate additional metrics
    mean_return = df['log_return'].mean() * 252  # Annualized mean return
    min_price = df['Close'].min()
    max_price = df['Close'].max()
    latest_price = df['Close'].iloc[-1]
    
    return {
        'ticker': ticker,
        'volatility': float(volatility),
        'mean_annual_return': float(mean_return),
        'latest_price': float(latest_price),
        'min_price': float(min_price),
        'max_price': float(max_price),
        'data_points': len(df),
        'date_range': {
            'start': df['Date'].min().isoformat(),
            'end': df['Date'].max().isoformat()
        }
    }

def process_all_stocks(data_path):
    """
    Process all CSV files in the data directory and calculate volatilities.
    """
    csv_files = list(Path(data_path).glob("*.csv"))
    
    if not csv_files:
        print(f"No CSV files found in {data_path}")
        return {}
    
    print(f"Found {len(csv_files)} CSV file(s)")
    
    all_volatilities = {}
    
    for csv_file in csv_files:
        print(f"\nProcessing {csv_file.name}...")
        
        try:
            # Read CSV
            df = pd.read_csv(csv_file, parse_dates=['Date'])
            
            # Get unique tickers
            if 'Ticker' in df.columns:
                tickers = df['Ticker'].unique()
                print(f"  Found {len(tickers)} unique tickers: {', '.join(tickers)}")
                
                for ticker in tickers:
                    ticker_df = df[df['Ticker'] == ticker].copy()
                    result = calculate_volatility(ticker_df, ticker)
                    
                    if result:
                        all_volatilities[ticker] = result
                        print(f"    {ticker}: σ={result['volatility']:.4f}, "
                              f"Price=${result['latest_price']:.2f}, "
                              f"N={result['data_points']}")
            else:
                # Single stock file without Ticker column
                ticker = csv_file.stem  # Use filename as ticker
                result = calculate_volatility(df, ticker)
                if result:
                    all_volatilities[ticker] = result
                    print(f"  {ticker}: σ={result['volatility']:.4f}")
                    
        except Exception as e:
            print(f"  Error processing {csv_file.name}: {e}")
            continue
    
    return all_volatilities

def main():
    """Main execution function."""
    print("=" * 60)
    print("Historical Volatility Calculator")
    print("=" * 60)
    
    # Create output directory if it doesn't exist
    os.makedirs(PROCESSED_DATA_PATH, exist_ok=True)
    
    # Process all stocks
    volatilities = process_all_stocks(RAW_DATA_PATH)
    
    if not volatilities:
        print("\nNo volatility data calculated. Check your CSV files.")
        return
    
    # Add metadata
    output = {
        'metadata': {
            'total_tickers': len(volatilities),
            'generated_at': pd.Timestamp.now().isoformat(),
            'trading_days_per_year': 252
        },
        'tickers': volatilities
    }
    
    # Save to JSON
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print("\n" + "=" * 60)
    print(f"✓ Processed {len(volatilities)} tickers")
    print(f"✓ Output saved to: {OUTPUT_FILE}")
    print("=" * 60)
    
    # Print summary statistics
    vols = [v['volatility'] for v in volatilities.values()]
    print(f"\nVolatility Statistics:")
    print(f"  Mean: {np.mean(vols):.4f}")
    print(f"  Median: {np.median(vols):.4f}")
    print(f"  Min: {np.min(vols):.4f} ({min(volatilities.items(), key=lambda x: x[1]['volatility'])[0]})")
    print(f"  Max: {np.max(vols):.4f} ({max(volatilities.items(), key=lambda x: x[1]['volatility'])[0]})")

if __name__ == "__main__":
    main()
