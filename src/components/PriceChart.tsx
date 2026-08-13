"use client";

import { useState, useEffect } from "react";
import { InkNumber } from "./InkNumber";

export interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  symbol: string;
  currentPrice: number;
  isCandlestickUnlocked?: boolean;
  candles?: CandlePoint[];
}

/** Generate realistic mock OHLC candle history from base price */
export function generateCandleHistory(basePrice: number, points = 24): CandlePoint[] {
  const result: CandlePoint[] = [];
  let price = basePrice * 0.96;
  const now = Date.now();
  const stepMs = 15 * 60 * 1000; // 15-min intervals

  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now - i * stepMs).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const change = (Math.random() - 0.48) * (basePrice * 0.015);
    const open = price;
    const close = i === 0 ? basePrice : Math.max(1, price + change);
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.008);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.008);
    const volume = Math.floor(Math.random() * 5000 + 1000);

    result.push({ time, open, high, low, close, volume });
    price = close;
  }
  return result;
}

export function PriceChart({
  symbol,
  currentPrice,
  isCandlestickUnlocked = false,
  candles: providedCandles,
}: PriceChartProps) {
  const [mode, setMode] = useState<"line" | "candlestick">(isCandlestickUnlocked ? "candlestick" : "line");
  const [hoverPoint, setHoverPoint] = useState<CandlePoint | null>(null);
  const [fetchedCandles, setFetchedCandles] = useState<CandlePoint[] | null>(null);
  const [chartLoading, setChartLoading] = useState<boolean>(false);

  // Dynamically fetch historical candles for selected stock symbol
  useEffect(() => {
    if (providedCandles) return;
    let active = true;
    setChartLoading(true);

    async function fetchHistory() {
      try {
        const res = await fetch(`/api/prices/history?symbol=${encodeURIComponent(symbol)}`);
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data.candles) && data.candles.length > 0) {
            setFetchedCandles(data.candles);
          }
        }
      } catch (err) {
        // Fallback handles gracefully
      } finally {
        if (active) setChartLoading(false);
      }
    }

    fetchHistory();
    return () => {
      active = false;
    };
  }, [symbol, providedCandles]);

  const candles = providedCandles || fetchedCandles || generateCandleHistory(currentPrice);

  const minPrice = Math.min(...candles.map((c) => c.low));
  const maxPrice = Math.max(...candles.map((c) => c.high));
  const priceRange = maxPrice - minPrice || 1;

  const width = 540;
  const height = 220;
  const padding = { top: 20, right: 15, bottom: 30, left: 45 };

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Helpers to scale coordinates
  const getX = (idx: number) => padding.left + (idx / (candles.length - 1)) * innerW;
  const getY = (val: number) => padding.top + innerH - ((val - minPrice) / priceRange) * innerH;

  // Build SVG path for line chart
  const points = candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(" ");
  const areaPath = `M ${padding.left},${padding.top + innerH} L ${points} L ${padding.left + innerW},${padding.top + innerH} Z`;

  const firstPrice = candles[0].open;
  const lastPrice = candles[candles.length - 1].close;
  const isUp = lastPrice >= firstPrice;

  return (
    <div className="border border-rule/25 bg-paper rounded-sm p-4 text-ink font-body">
      {/* Chart Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">{symbol}</span>
            <span className="font-mono text-[10px] text-muted uppercase">15m delayed</span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <InkNumber value={hoverPoint ? hoverPoint.close : currentPrice} className="text-xl font-semibold text-ink" />
            <span className={`font-mono text-xs ${isUp ? "text-gain" : "text-loss"}`}>
              {isUp ? "+" : ""}
              {(((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-rule/[0.06] p-1 rounded-sm border border-rule/15">
          <button
            onClick={() => setMode("line")}
            className={[
              "px-2.5 py-1 text-xs font-mono rounded-xs transition-colors",
              mode === "line" ? "bg-paper text-ink shadow-xs" : "text-muted hover:text-ink",
            ].join(" ")}
          >
            Line
          </button>
          <button
            onClick={() => isCandlestickUnlocked && setMode("candlestick")}
            title={!isCandlestickUnlocked ? "Complete Lesson 6 to unlock Candlestick view" : undefined}
            className={[
              "px-2.5 py-1 text-xs font-mono rounded-xs transition-colors flex items-center gap-1",
              mode === "candlestick"
                ? "bg-paper text-ink shadow-xs"
                : isCandlestickUnlocked
                ? "text-muted hover:text-ink"
                : "text-muted/40 cursor-not-allowed",
            ].join(" ")}
          >
            Candle {!isCandlestickUnlocked && "🔒"}
          </button>
        </div>
      </div>

      {/* SVG Chart Frame */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoverPoint(null)}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + innerH * ratio;
            const priceVal = maxPrice - ratio * priceRange;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerW}
                  y2={y}
                  stroke="currentColor"
                  className="text-rule/15"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-muted font-mono text-[9px]"
                >
                  ₹{Math.round(priceVal)}
                </text>
              </g>
            );
          })}

          {/* Line Mode */}
          {mode === "line" && (
            <>
              <path
                d={areaPath}
                className={isUp ? "fill-gain/10" : "fill-loss/10"}
              />
              <polyline
                fill="none"
                stroke={isUp ? "#2F6B4F" : "#A6493F"}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </>
          )}

          {/* Candlestick Mode */}
          {mode === "candlestick" &&
            candles.map((c, i) => {
              const x = getX(i);
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const candleUp = c.close >= c.open;
              const barWidth = Math.max(3, innerW / candles.length - 3);

              return (
                <g
                  key={i}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoverPoint(c)}
                >
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={candleUp ? "#2F6B4F" : "#A6493F"}
                    strokeWidth="1"
                  />
                  {/* Body */}
                  <rect
                    x={x - barWidth / 2}
                    y={Math.min(openY, closeY)}
                    width={barWidth}
                    height={Math.max(2, Math.abs(closeY - openY))}
                    fill={candleUp ? "#2F6B4F" : "#A6493F"}
                    rx="0.5"
                  />
                </g>
              );
            })}

          {/* Hover Overlay Line */}
          {hoverPoint && (
            <line
              x1={getX(candles.indexOf(hoverPoint))}
              y1={padding.top}
              x2={getX(candles.indexOf(hoverPoint))}
              y2={padding.top + innerH}
              stroke="#8C2F39"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}
        </svg>

        {/* Hover Info Banner */}
        {hoverPoint && (
          <div className="absolute top-2 right-2 bg-paper border border-rule/30 p-2 rounded-xs shadow-sm font-mono text-[10px] space-y-0.5 z-10">
            <p className="text-muted border-b border-rule/15 pb-1 mb-1 font-semibold">{hoverPoint.time}</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              <span className="text-muted">Open: <span className="text-ink">₹{hoverPoint.open.toFixed(2)}</span></span>
              <span className="text-muted">Close: <span className="text-ink">₹{hoverPoint.close.toFixed(2)}</span></span>
              <span className="text-muted">High: <span className="text-gain">₹{hoverPoint.high.toFixed(2)}</span></span>
              <span className="text-muted">Low: <span className="text-loss">₹{hoverPoint.low.toFixed(2)}</span></span>
            </div>
          </div>
        )}
      </div>

      {!isCandlestickUnlocked && (
        <p className="font-mono text-[10px] text-muted text-center mt-2">
          💡 Unlock candlestick view by completing <strong>Lesson 6 — Reading a Candlestick</strong>.
        </p>
      )}
    </div>
  );
}
