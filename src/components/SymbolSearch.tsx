"use client";

import { useState } from "react";
import type { PriceQuote } from "@/types";

interface SymbolSearchProps {
  onSelectQuote: (quote: PriceQuote) => void;
}

const POPULAR_SYMBOLS = [
  { symbol: "RELIANCE.NS", name: "Reliance" },
  { symbol: "TCS.NS", name: "TCS" },
  { symbol: "INFY.NS", name: "Infosys" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors" },
  { symbol: "SBIN.NS", name: "SBI" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
  { symbol: "ITC.NS", name: "ITC" },
  { symbol: "BHARTIARTL.NS", name: "Airtel" },
  { symbol: "LT.NS", name: "L&T" },
];

export function SymbolSearch({ onSelectQuote }: SymbolSearchProps) {
  const [inputSymbol, setInputSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPrice(symbolToFetch: string) {
    const symbol = symbolToFetch.trim().toUpperCase();
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/prices?symbol=${encodeURIComponent(symbol)}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch stock price");
      }

      onSelectQuote(json as PriceQuote);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching price");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-rule/30 rounded-sm p-6 bg-paper">
      <p className="font-display text-base font-semibold text-ink mb-1">Stock Lookup</p>
      <p className="font-body text-xs text-muted mb-4">
        Search any NSE/BSE symbol (e.g., RELIANCE.NS, TCS.NS) to get delayed price
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchPrice(inputSymbol);
        }}
        className="flex gap-2 mb-4"
      >
        <input
          type="text"
          value={inputSymbol}
          onChange={(e) => setInputSymbol(e.target.value)}
          placeholder="e.g. RELIANCE.NS"
          className="flex-1 border border-rule/40 rounded-sm px-3.5 py-2 font-mono text-sm uppercase bg-transparent text-ink focus:outline-none focus:border-stamp"
        />
        <button
          type="submit"
          disabled={loading || !inputSymbol.trim()}
          className="bg-rule text-paper px-4 py-2 rounded-sm font-body text-sm font-medium hover:bg-ink transition-colors disabled:opacity-50"
        >
          {loading ? "Fetching..." : "Fetch Quote"}
        </button>
      </form>

      {error && (
        <p className="text-xs text-loss mb-3 font-body">
          {error} (Use .NS suffix for NSE stocks)
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted font-mono">Quick Pick:</span>
        {POPULAR_SYMBOLS.map((item) => (
          <button
            key={item.symbol}
            type="button"
            onClick={() => {
              setInputSymbol(item.symbol);
              fetchPrice(item.symbol);
            }}
            className="text-xs font-mono border border-rule/30 rounded-sm px-2.5 py-1 text-ink hover:border-stamp hover:text-stamp transition-colors"
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
