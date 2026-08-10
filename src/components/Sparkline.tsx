"use client";

interface SparklineProps {
  basePrice: number;
  currentPrice: number;
  points?: number;
  width?: number;
  height?: number;
  className?: string;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function buildSparkPoints(basePrice: number, currentPrice: number, points: number): number[] {
  const rand = seededRandom(Math.floor(basePrice * 100));
  const prices: number[] = [basePrice];
  for (let i = 1; i < points - 1; i++) {
    const prev = prices[prices.length - 1];
    const delta = (rand() - 0.47) * (basePrice * 0.012);
    prices.push(Math.max(1, prev + delta));
  }
  prices.push(currentPrice);
  return prices;
}

export function Sparkline({
  basePrice,
  currentPrice,
  points = 16,
  width = 64,
  height = 22,
  className = "",
}: SparklineProps) {
  const prices = buildSparkPoints(basePrice, currentPrice, points);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const pad = { x: 2, y: 2 };
  const innerW = width - pad.x * 2;
  const innerH = height - pad.y * 2;

  const getX = (i: number) => pad.x + (i / (prices.length - 1)) * innerW;
  const getY = (v: number) => pad.y + innerH - ((v - minP) / range) * innerH;

  const polyPoints = prices.map((v, i) => `${getX(i)},${getY(v)}`).join(" ");
  const areaPath = [
    `M ${pad.x},${pad.y + innerH}`,
    ...prices.map((v, i) => `L ${getX(i)},${getY(v)}`),
    `L ${pad.x + innerW},${pad.y + innerH} Z`,
  ].join(" ");

  const isUp = currentPrice >= basePrice;
  const lineColor = isUp ? "#2F6B4F" : "#A6493F";
  const fillColor = isUp ? "rgba(47,107,79,0.12)" : "rgba(166,73,63,0.12)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden
    >
      <path d={areaPath} fill={fillColor} />
      <polyline
        fill="none"
        stroke={lineColor}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polyPoints}
      />
      <circle
        cx={getX(prices.length - 1)}
        cy={getY(prices[prices.length - 1])}
        r="1.5"
        fill={lineColor}
      />
    </svg>
  );
}
