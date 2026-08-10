"use client";

import { useEffect, useState } from "react";

interface PortfolioGaugeProps {
  portfolioValue: number;
  startingValue?: number;
  className?: string;
}

/**
 * Animated SVG arc gauge showing portfolio performance.
 * 0% = -20% returns, 50% = flat, 100% = +20% returns.
 * The needle sweeps in on mount.
 */
export function PortfolioGauge({
  portfolioValue,
  startingValue = 100000,
  className = "",
}: PortfolioGaugeProps) {
  const pnlPct = ((portfolioValue - startingValue) / startingValue) * 100;
  // Map -20%..+20% to 0..1
  const normalized = Math.min(1, Math.max(0, (pnlPct + 20) / 40));

  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setAnimated(normalized), 60);
    });
    return () => cancelAnimationFrame(raf);
  }, [normalized]);

  // SVG arc params
  const cx = 80;
  const cy = 80;
  const r = 62;
  const startAngle = 200; // degrees
  const sweepTotal = 140; // degrees

  function polarToXY(angleDeg: number, radius: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(fromDeg: number, toDeg: number, radius: number) {
    const from = polarToXY(fromDeg, radius);
    const to = polarToXY(toDeg, radius);
    const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
    return `M ${from.x} ${from.y} A ${radius} ${radius} 0 ${large} 1 ${to.x} ${to.y}`;
  }

  const trackFrom = startAngle;
  const trackTo = startAngle + sweepTotal;
  const fillTo = startAngle + sweepTotal * animated;

  // Needle
  const needleDeg = startAngle + sweepTotal * animated;
  const needleTip = polarToXY(needleDeg, r - 8);
  const needleBase1 = polarToXY(needleDeg + 90, 7);
  const needleBase2 = polarToXY(needleDeg - 90, 7);

  // Color: loss (red) → neutral (muted) → gain (green)
  const arcColor = animated < 0.45 ? "#A6493F" : animated > 0.55 ? "#2F6B4F" : "#5C7A63";

  const isGain = pnlPct >= 0;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg viewBox="0 0 160 110" className="w-full max-w-[160px]" aria-hidden>
        <defs>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Track */}
        <path
          d={arcPath(trackFrom, trackTo, r)}
          fill="none"
          stroke="rgba(92,122,99,0.15)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Filled arc */}
        <path
          d={arcPath(trackFrom, Math.max(trackFrom + 0.1, fillTo), r)}
          fill="none"
          stroke={arcColor}
          strokeWidth="8"
          strokeLinecap="round"
          style={{ transition: "d 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}
          filter="url(#gauge-glow)"
        />

        {/* Zone ticks */}
        {[-20, -10, 0, 10, 20].map((pct) => {
          const norm = (pct + 20) / 40;
          const deg = startAngle + sweepTotal * norm;
          const inner = polarToXY(deg, r - 14);
          const outer = polarToXY(deg, r - 5);
          return (
            <line
              key={pct}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke={pct === 0 ? "rgba(92,122,99,0.5)" : "rgba(92,122,99,0.2)"}
              strokeWidth={pct === 0 ? 1.5 : 1}
            />
          );
        })}

        {/* Needle */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill={arcColor}
          opacity="0.9"
          style={{ transition: "all 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}
        />

        {/* Center cap */}
        <circle cx={cx} cy={cy} r="5" fill="rgba(30,42,68,0.7)" />
        <circle cx={cx} cy={cy} r="3" fill="#E9EFE7" />

        {/* Zone labels */}
        <text x={polarToXY(trackFrom + 4, r + 14).x} y={polarToXY(trackFrom + 4, r + 14).y}
          textAnchor="middle" fontSize="7" fill="#A6493F" fontFamily="IBM Plex Mono">−20%</text>
        <text x={polarToXY(trackTo - 4, r + 14).x} y={polarToXY(trackTo - 4, r + 14).y}
          textAnchor="middle" fontSize="7" fill="#2F6B4F" fontFamily="IBM Plex Mono">+20%</text>
        <text x={cx} y={cy + 20}
          textAnchor="middle" fontSize="6.5" fill="rgba(92,122,99,0.6)" fontFamily="IBM Plex Mono">flat</text>
      </svg>

      {/* P&L readout beneath gauge */}
      <div className="text-center -mt-1">
        <p className={`font-mono tabular-nums text-lg font-semibold leading-none ${isGain ? "text-gain" : "text-loss"}`}>
          {isGain ? "+" : ""}{pnlPct.toFixed(2)}%
        </p>
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted mt-0.5">
          vs. ₹1,00,000 start
        </p>
      </div>
    </div>
  );
}
