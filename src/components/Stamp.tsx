"use client";

/**
 * The signature element (see docs/DESIGN_SYSTEM.md). Renders a hand-stamped
 * mark. Only ever use this for something genuinely earned — a completed
 * lesson or an unlocked badge. Never decorative, never tied to a trade's
 * profitability (see docs/LOGIC.md "Design constraint").
 */
export function Stamp({ label, earned }: { label: string; earned: boolean }) {
  return (
    <div
      role="img"
      aria-label={earned ? `${label}: completed` : `${label}: not yet completed`}
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center"
    >
      <svg
        viewBox="0 0 44 44"
        className={[
          "h-11 w-11 transition-all duration-150 motion-reduce:transition-none",
          earned
            ? "rotate-[-6deg] scale-100 opacity-100"
            : "rotate-0 scale-95 opacity-40",
        ].join(" ")}
      >
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke={earned ? "#8C2F39" : "#5C7A63"}
          strokeWidth={earned ? 2.5 : 1.5}
          strokeDasharray={earned ? "0" : "3 3"}
        />
        {earned && (
          <path
            d="M13 22.5 L19 28 L31 15"
            fill="none"
            stroke="#8C2F39"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
}
