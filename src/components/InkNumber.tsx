"use client";

import { useState, useEffect, useRef } from "react";

interface InkNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  locale?: string;
}

/**
 * Animated counter that counts up/down to `value` over ~400ms.
 * On significant change (>1%), briefly flashes an ink-blot pulse
 * in gain/loss color behind the number.
 * Uses tabular-nums throughout so no layout shift occurs during counting.
 */
export function InkNumber({
  value,
  prefix = "₹",
  suffix = "",
  decimals = 2,
  className = "",
  locale = "en-IN",
}: InkNumberProps) {
  const [displayed, setDisplayed] = useState(value);
  const [pulse, setPulse] = useState<"gain" | "loss" | null>(null);
  const prevValue = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    const delta = to - from;

    if (Math.abs(delta) < 0.01) {
      setDisplayed(to);
      return;
    }

    // Significant change: trigger ink pulse
    const pct = Math.abs(delta / (Math.abs(from) || 1));
    if (pct > 0.005) {
      setPulse(delta > 0 ? "gain" : "loss");
      setTimeout(() => setPulse(null), 500);
    }

    const startTime = performance.now();
    const duration = 400;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(now: number) {
      const elapsed = Math.min(now - startTime, duration);
      const progress = easeOut(elapsed / duration);
      setDisplayed(from + delta * progress);

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayed(to);
        prevValue.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  const formatted = displayed.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      className={[
        "font-mono tabular-nums relative rounded-sm px-0.5 transition-none",
        pulse === "gain" ? "ink-pulse-gain" : pulse === "loss" ? "ink-pulse-loss" : "",
        className,
      ].join(" ")}
    >
      {prefix}{formatted}{suffix}
    </span>
  );
}
