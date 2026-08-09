"use client";

import { useEffect, useState } from "react";

interface CooldownRingProps {
  /** Duration in seconds. Default 11s. */
  duration?: number;
  onComplete?: () => void;
}

/**
 * The cooldown nudge progress ring. Fills clockwise around the "Sell anyway"
 * button over 10-12 seconds. The ring is friction-as-respect, not urgency:
 * the button remains clickable throughout. Calm, never alarming.
 * See docs/DESIGN_SYSTEM.md §"The Cooldown Nudge, Made Physical".
 */
export function CooldownRing({ duration = 11, onComplete }: CooldownRingProps) {
  const [progress, setProgress] = useState(0);
  const circumference = 2 * Math.PI * 18; // r=18

  useEffect(() => {
    const startTime = performance.now();
    const durationMs = duration * 1000;
    let raf: number;

    function step(now: number) {
      const elapsed = Math.min(now - startTime, durationMs);
      setProgress(elapsed / durationMs);
      if (elapsed < durationMs) {
        raf = requestAnimationFrame(step);
      } else {
        setProgress(1);
        onComplete?.();
      }
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [duration, onComplete]);

  const dashOffset = circumference * (1 - progress);

  return (
    <svg
      viewBox="0 0 44 44"
      className="absolute inset-0 h-full w-full -rotate-90"
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx="22" cy="22" r="18"
        fill="none"
        stroke="rgba(140,47,57,0.15)"
        strokeWidth="2"
      />
      {/* Fill ring */}
      <circle
        cx="22" cy="22" r="18"
        fill="none"
        stroke="#8C2F39"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{
          transition: "stroke-dashoffset 0.1s linear",
          "@media (prefers-reduced-motion: reduce)": { strokeDashoffset: 0 },
        } as React.CSSProperties}
      />
    </svg>
  );
}
