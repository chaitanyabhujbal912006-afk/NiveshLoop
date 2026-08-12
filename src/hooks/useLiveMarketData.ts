"use client";

import { useState, useEffect } from "react";
import type { PriceQuote } from "@/types";

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  up: boolean;
}

const INITIAL_INDICES: MarketIndex[] = [
  { name: "NIFTY 50", value: 24435.95, change: 74.25, changePercent: 0.30, up: true },
  { name: "SENSEX", value: 77966.35, change: -187.90, changePercent: -0.24, up: false },
  { name: "BANKNIFTY", value: 57885.85, change: 439.60, changePercent: 0.77, up: true },
  { name: "FINNIFTY", value: 26426.75, change: -5.65, changePercent: -0.02, up: false },
  { name: "INDIA VIX", value: 13.82, change: -0.30, changePercent: -2.12, up: false },
];

export interface MarketDepthEntry {
  price: number;
  orders: number;
  qty: number;
}

export function useLiveMarketData(selectedSymbol: string, initialPrice: number = 2940.0) {
  const [indices, setIndices] = useState<MarketIndex[]>(INITIAL_INDICES);
  const [currentQuote, setCurrentQuote] = useState<PriceQuote>({
    symbol: selectedSymbol,
    price: initialPrice,
    change: 14.5,
    changePercent: 0.5,
    dayHigh: Number((initialPrice * 1.018).toFixed(2)),
    dayLow: Number((initialPrice * 0.982).toFixed(2)),
    volume: 2450890,
    prevClose: Number((initialPrice - 14.5).toFixed(2)),
    fiftyTwoWeekHigh: Number((initialPrice * 1.3).toFixed(2)),
    fiftyTwoWeekLow: Number((initialPrice * 0.75).toFixed(2)),
    fetchedAt: new Date().toISOString(),
  });

  const [bids, setBids] = useState<MarketDepthEntry[]>([]);
  const [asks, setAsks] = useState<MarketDepthEntry[]>([]);
  const [lastTickDirection, setLastTickDirection] = useState<"up" | "down" | "neutral">("up");

  // Fetch live price quote from server
  useEffect(() => {
    let isMounted = true;
    async function fetchQuote() {
      try {
        const res = await fetch(`/api/quote?symbol=${encodeURIComponent(selectedSymbol)}`);
        if (res.ok) {
          const data: PriceQuote = await res.json();
          if (isMounted) {
            setCurrentQuote(data);
          }
        }
      } catch (err) {
        // Fallback
      }
    }
    fetchQuote();
    return () => {
      isMounted = false;
    };
  }, [selectedSymbol]);

  // Live simulation tick engine (every 2.5s update indices and market depth)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Tick indices
      setIndices((prev) =>
        prev.map((idx) => {
          const delta = (Math.random() - 0.48) * (idx.value * 0.0008);
          const newVal = Number((idx.value + delta).toFixed(2));
          const newChg = Number((idx.change + delta).toFixed(2));
          const newPct = Number(((newChg / (idx.value - idx.change)) * 100).toFixed(2));
          return {
            ...idx,
            value: newVal,
            change: newChg,
            changePercent: newPct,
            up: newChg >= 0,
          };
        })
      );

      // 2. Tick current quote safely
      setCurrentQuote((prev) => {
        const prevPrice = prev.price;
        const prevCloseVal = prev.prevClose ?? Number((prevPrice * 0.995).toFixed(2));
        const dayHighVal = prev.dayHigh ?? Number((prevPrice * 1.015).toFixed(2));
        const dayLowVal = prev.dayLow ?? Number((prevPrice * 0.985).toFixed(2));
        const volumeVal = prev.volume ?? 1500000;

        const tickDelta = (Math.random() - 0.49) * (prevPrice * 0.0015);
        const newPrice = Number(Math.max(1, prevPrice + tickDelta).toFixed(2));
        const dir = newPrice > prevPrice ? "up" : newPrice < prevPrice ? "down" : "neutral";
        setLastTickDirection(dir);

        const newHigh = Math.max(dayHighVal, newPrice);
        const newLow = Math.min(dayLowVal, newPrice);
        const newChg = Number((newPrice - prevCloseVal).toFixed(2));
        const newPct = Number(((newChg / prevCloseVal) * 100).toFixed(2));
        const newVol = volumeVal + Math.floor(Math.random() * 150 + 10);

        return {
          ...prev,
          price: newPrice,
          change: newChg,
          changePercent: newPct,
          dayHigh: Number(newHigh.toFixed(2)),
          dayLow: Number(newLow.toFixed(2)),
          volume: newVol,
          prevClose: prevCloseVal,
          fetchedAt: new Date().toISOString(),
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Update Market Depth whenever price changes
  useEffect(() => {
    const price = currentQuote.price;
    const generatedBids: MarketDepthEntry[] = [
      { price: Number((price - 0.25).toFixed(2)), orders: Math.floor(Math.random() * 12 + 4), qty: Math.floor(Math.random() * 1200 + 300) },
      { price: Number((price - 0.50).toFixed(2)), orders: Math.floor(Math.random() * 18 + 5), qty: Math.floor(Math.random() * 2400 + 600) },
      { price: Number((price - 0.85).toFixed(2)), orders: Math.floor(Math.random() * 25 + 8), qty: Math.floor(Math.random() * 3800 + 1200) },
      { price: Number((price - 1.20).toFixed(2)), orders: Math.floor(Math.random() * 32 + 10), qty: Math.floor(Math.random() * 5200 + 1800) },
      { price: Number((price - 1.60).toFixed(2)), orders: Math.floor(Math.random() * 45 + 15), qty: Math.floor(Math.random() * 7500 + 2500) },
    ];

    const generatedAsks: MarketDepthEntry[] = [
      { price: Number((price + 0.25).toFixed(2)), orders: Math.floor(Math.random() * 14 + 3), qty: Math.floor(Math.random() * 1400 + 400) },
      { price: Number((price + 0.55).toFixed(2)), orders: Math.floor(Math.random() * 20 + 6), qty: Math.floor(Math.random() * 2600 + 700) },
      { price: Number((price + 0.90).toFixed(2)), orders: Math.floor(Math.random() * 28 + 9), qty: Math.floor(Math.random() * 4100 + 1100) },
      { price: Number((price + 1.30).toFixed(2)), orders: Math.floor(Math.random() * 35 + 12), qty: Math.floor(Math.random() * 5900 + 2100) },
      { price: Number((price + 1.75).toFixed(2)), orders: Math.floor(Math.random() * 48 + 18), qty: Math.floor(Math.random() * 8100 + 3000) },
    ];

    setBids(generatedBids);
    setAsks(generatedAsks);
  }, [currentQuote.price]);

  return {
    indices,
    currentQuote,
    bids,
    asks,
    lastTickDirection,
  };
}
