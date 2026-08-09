"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface StampProps {
  label: string;
  earned: boolean;
  /** Animate the press-in on first render when earned is true */
  animateOnMount?: boolean;
  /** Override rotation (degrees). Defaults to a seeded -4 to -8 range. */
  rotate?: number;
  size?: "sm" | "md" | "lg";
}

/** Deterministic "random" rotation from the label text — same label always
 *  gets the same slight tilt, so the UI is consistent across re-renders. */
function seedRotate(label: string): number {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash << 5) - hash + label.charCodeAt(i);
    hash |= 0;
  }
  // Range: -4 to -8 degrees (always counter-clockwise, like a real stamp)
  return -4 - (Math.abs(hash) % 5);
}

const sizes = {
  sm: { outer: "h-9 w-9", svg: "h-9 w-9", cx: 22, cy: 22, r: 16, sw: 2, swDashed: 1.5, checkPath: "M13 22.5 L19 28 L31 15" },
  md: { outer: "h-11 w-11", svg: "h-11 w-11", cx: 22, cy: 22, r: 18, sw: 2.5, swDashed: 1.5, checkPath: "M13 22.5 L19 28 L31 15" },
  lg: { outer: "h-16 w-16", svg: "h-16 w-16", cx: 32, cy: 32, r: 26, sw: 3, swDashed: 2, checkPath: "M18 32 L28 42 L46 20" },
};

/**
 * The signature element — a hand-stamped circle mark.
 * Presses onto the page exactly once per achievement.
 * Never used decoratively; never tied to trade profitability.
 * See docs/DESIGN_SYSTEM.md §"The Stamp".
 */
export function Stamp({ label, earned, animateOnMount = false, rotate, size = "md" }: StampProps) {
  const deg = rotate ?? seedRotate(label);
  const [pressed, setPressed] = useState(false);
  const [cardPressed, setCardPressed] = useState(false);
  const mounted = useRef(false);
  const s = sizes[size];

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (earned && animateOnMount) {
        // Brief 1-frame card compress
        setCardPressed(true);
        setTimeout(() => setCardPressed(false), 180);
        setPressed(true);
      }
    }
  }, [earned, animateOnMount]);

  const stampVariants = {
    hidden: { scale: 1.4, opacity: 0, rotate: deg },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: deg,
      transition: { duration: 0.18, ease: [0.25, 0, 0, 1] as [number, number, number, number] },
    },
    static: { scale: 1, opacity: 1, rotate: deg },
    unearned: { scale: 0.95, opacity: 0.4, rotate: 0 },
  };

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${s.outer} ${cardPressed ? "translate-y-px" : ""} transition-transform duration-75`}
      style={{ transform: cardPressed ? "translateY(1px)" : undefined }}
    >
      {/* Ink-bleed SVG filter definition (inline, referenced by class) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id={`ink-bleed-${label.replace(/\s/g, "")}`}>
            <feMorphology in="SourceAlpha" operator="dilate" radius="0.4" result="dilated" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
            <feDisplacementMap in="dilated" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feComposite in="SourceGraphic" in2="displaced" operator="over" />
          </filter>
        </defs>
      </svg>

      <motion.svg
        viewBox="0 0 44 44"
        className={s.svg}
        style={{ filter: earned ? `url(#ink-bleed-${label.replace(/\s/g, "")})` : undefined }}
        variants={stampVariants}
        initial={earned && animateOnMount ? "hidden" : earned ? "static" : "unearned"}
        animate={earned ? (pressed || !animateOnMount ? "visible" : "hidden") : "unearned"}
        role="img"
        aria-label={earned ? `${label}: completed` : `${label}: not yet completed`}
      >
        {/* Second, slightly offset stroke for ink-bleed character */}
        {earned && (
          <circle
            cx={s.cx}
            cy={s.cy + 0.4}
            r={s.r + 0.3}
            fill="none"
            stroke="#8C2F39"
            strokeWidth={s.sw * 0.6}
            opacity={0.25}
          />
        )}

        <circle
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="none"
          stroke={earned ? "#8C2F39" : "#5C7A63"}
          strokeWidth={earned ? s.sw : s.swDashed}
          strokeDasharray={earned ? "0" : "3 3"}
        />

        {earned && (
          <path
            d={s.checkPath}
            fill="none"
            stroke="#8C2F39"
            strokeWidth={s.sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </motion.svg>
    </div>
  );
}
