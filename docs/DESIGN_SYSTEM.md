# NiveshLoop — Luxury Passbook & Fintech Design System (MASTER SPEC)

> **Core Brand Thesis**: Money and lessons both live in the same continuous Indian bank passbook ledger. Learning and executing trades are recorded side by side in a single unified journal.

---

## 1. Visual Identity & Brand Philosophy

The design direction is grounded in the **Indian Bank Passbook (बचत पासबुक)** — combined with ultra-high-end modern financial technology aesthetics:
- **Structural Ledger Grid**: Fine ruled lines, sequential timestamped entries, tabular alignment.
- **Physical Stamp Mark**: A rotating oxblood ink seal validating genuine lesson completions.
- **Luxury Glassmorphism & Mesh Backgrounds**: Backdrop blurs, subtle glowing ambient radial lights, multi-layered shadows.
- **Monospaced Numerical Precision**: IBM Plex Mono with `tabular-nums` on all monetary figures (`₹1,00,000.00`).

---

## 2. Color Palette & Design Tokens

### Primary Theme Tokens (CSS Variables)

| Token Name | CSS Variable | Hex / Value | Purpose & Psychological Impact |
|---|---|---|---|
| **Paper Background** | `--color-paper` | `#E9EFE7` | Warm pale sage passbook paper; low strain, tactile paper feel |
| **Ink Foreground** | `--color-ink` | `#1E2A44` | Deep fountain-pen indigo for primary titles, body text, and dark sections |
| **Ledger Rule** | `--color-rule` | `#5C7A63` | Forest sage for grid lines, borders, and structural framing |
| **Stamp Oxblood** | `--color-stamp` | `#8C2F39` | Crimson stamp seal, signature CTAs, and milestone achievements |
| **Profit Gain** | `--color-gain` | `#2F6B4F` | Vibrant emerald green for positive P&L and completed steps |
| **Loss Red** | `--color-loss` | `#A6493F` | Distinct terracotta loss red for negative position changes (separate from Stamp) |
| **Muted Caption** | `--color-muted` | `#6B7568` | Subtle grey-green for timestamps, field labels, and secondary metadata |
| **Gold Metallic** | `--color-gold` | `#D4AF37` | Shimmer gradient accent for virtual currency coins and habit badges |

### Glass & Mesh Overlay Tokens

```css
/* Glassmorphism Panel */
.glass-panel {
  background: rgba(233, 239, 231, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(92, 122, 99, 0.22);
  box-shadow: 0 8px 32px 0 rgba(30, 42, 68, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
}

/* Dark Mode Mesh Panel */
.glass-panel-dark {
  background: rgba(30, 42, 68, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
}
```

---

## 3. Typography & Type Scale

| Layer | Font Family | Weights | Usage & Rules |
|---|---|---|---|
| **Display / Headlines** | `Fraunces` (Serif) | 400, 600, 700 | Hero titles, section headings (`§ 01`), passbook headers |
| **Body & UI** | `Inter` (Sans-Serif) | 400, 500, 600 | Explanatory text, lesson content, instructions, buttons |
| **Monospace / Numerals** | `IBM Plex Mono` | 400, 500, 600, 700 | **Mandatory tabular-nums** for all ₹ currency values, stock tickers, order quantities, and dates |

### Monospace Tabular Numerals Requirement

```css
/* ALL money figures MUST use tabular numbers */
.font-mono {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
```

---

## 4. Component Architecture & Design Patterns

### A. Passbook Journal Entry (`LessonEntry.tsx` & `TransactionHistory.tsx`)
- **Grid Layout**: `[Timestamp | Code | Details / Symbol | Debit/Credit | Running Balance]`
- **Ink Bleed**: Subtle pulse animation on numerical changes (`.ink-gain`, `.ink-loss`).
- **Watermark**: Faint diagonal `SIMULATED` watermark (2.8% opacity) overlaid across the canvas.

### B. Virtual Money Vault Widget (`MoneyVaultWidget.tsx`)
- **3D Currency Stack**: ₹2000 oxblood note & ₹500 emerald note floating with 3D tilt perspective.
- **Spinning Rupee Coin**: 3D spinning metallic gold coin with `transform-style: preserve-3d`.
- **Live Cash Balance**: Displays `₹1,00,000.00` capital with real-time simulated fluctuations.
- **Allocation Breakdown**: Visual progress bars showing Large Cap (52%), Mid Cap (28%), and Cash (20%).

### C. Signature Stamp Mark (`Stamp.tsx`)
- **Physical Inking**: Oxblood circular seal rotated at `-6deg` with roughened edge texture.
- **Press Motion**: 180ms cubic-bezier press down animation (`scale(1.4) -> scale(0.97) -> scale(1)`).
- **Rule**: Stamped **only** when a lesson is genuinely completed — never decoratively or for speculative returns.

### D. Interactive Behavioral Sandbox (`FeatureSandbox.tsx`)
- **10-Second Cooldown Nudge**: Active countdown ring + breathing pause screen when selling during market dips.
- **Dynamic Form Unlock**: Form fields (Stop-Loss, Limit Orders) unlock dynamically as corresponding lessons are stamped.
- **Genuine Stamp Trigger**: Live interactive stamp press demonstrator.

### E. SEBI Scam & Tip Checker (`ScamChecker.tsx`)
- **SEBI Fraud Engine**: Real-time evaluation of WhatsApp/Telegram forwards against SEBI fraud patterns.
- **Risk Score Meter**: 0 to 100 Risk Gauge with color transitions (Green -> Yellow -> Oxblood Red).
- **Detected Red Flag Chips**: Categorized indicators (e.g. Guaranteed Profit Promise, Unregistered Channel, Pump & Dump).

---

## 5. Motion Choreography & Interactions

- **Micro-Interactions**: 150ms – 250ms duration with `cubic-bezier(0.16, 1, 0.3, 1)` easing.
- **Page Transitions**: 3D page turn effect (`perspective(1200px) rotateY(20deg)`).
- **Scroll Animations**: Framer Motion `whileInView` fade up and stagger reveal.
- **Reduced Motion**: Respect `prefers-reduced-motion: reduce` by disabling page rotations while maintaining stamp visibility.

---

## 6. Layout Grid & Breakpoint Architecture

```
Mobile (375px)     → 1 column, 16px padding, 44px min touch target
Tablet (768px)     → 2 column grid, 24px padding, sticky sidebar
Desktop (1024px)   → 3 column showcase grid, 32px padding, 3D passbook widget
Ultrawide (1440px) → Max-width 1280px container, centered ledger alignment
```

---

## 7. Pre-Delivery UI/UX Checklist

- [x] **No Emoji as Structural Icons**: Use SVG vector icons (`LessonIcons.tsx`, Phosphor/Lucide SVG) for navigation, buttons, and badges.
- [x] **Tabular Money Numerals**: All `₹` values use `IBM Plex Mono` with `tabular-nums`.
- [x] **Touch Target Minimum**: All interactive buttons & tabs are at least 44px × 44px.
- [x] **Accessible Contrast**: Primary text ratio >= 4.5:1 against paper `#E9EFE7` and dark `#1E2A44`.
- [x] **Disclaimer Compliance**: "Simulated portfolio · Delayed prices · Not real money · Not investment advice" visible on every price/portfolio screen.
- [x] **Zero Financial Advice**: UI copy describes user behavior only — never recommends future stock actions.
