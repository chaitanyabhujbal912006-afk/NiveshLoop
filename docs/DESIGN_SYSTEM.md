# Design System — NiveshLoop

## Direction

The subject is an Indian bank **passbook** — not generic "modern fintech minimalism," which by now is its own AI-generated cliché (every prompt for a clean fintech UI converges on the same Stripe-adjacent look). A passbook is a specific, real object: ruled ledger lines, sequential dated entries, a physical stamp validating each one. That's where this app's whole visual identity comes from — money and lessons both live in the same ledger, because the product's actual thesis is that learning and doing are the same continuous record.

Executed with modern, restrained precision (generous whitespace, exact spacing, no skeuomorphic clutter) — the passbook is a structural reference, not a literal skin.

## Tokens

| Role | Name | Hex | Use |
|---|---|---|---|
| Background | `paper` | `#E9EFE7` | Page background — pale sage, evokes passbook paper |
| Text | `ink` | `#1E2A44` | All body text — deep indigo, fountain-pen character |
| Structure | `rule` | `#5C7A63` | Ledger rule lines, borders, secondary UI, this doc's "primary" |
| Accent | `stamp` | `#8C2F39` | CTAs and the signature stamp mark only — oxblood, used sparingly and deliberately |
| Positive | `gain` | `#2F6B4F` | Price/position up |
| Negative | `loss` | `#A6493F` | Price/position down — kept visually distinct from `stamp` so a red CTA is never confused with a loss |
| Muted | `muted` | `#6B7568` | Secondary/caption text, timestamps |

Deliberately avoided: cream background + terracotta accent (the most common AI-generated fintech default), near-black + neon accent, and literal Apple-clone styling — none of those are specific to this product.

## Typography

- **Display — Fraunces**: headlines, lesson titles. Has enough print/ledger character to feel considered rather than default-system-serif.
- **Body — Inter**: everything else. Functional, doesn't fight for attention.
- **Mono — IBM Plex Mono, tabular-nums**: every number that represents money, always. This is the one rule with zero exceptions — a ₹ figure anywhere in this app is monospaced and right-aligned, so a list of holdings reads like an actual ledger column. This single decision does more to make the product feel "designed" than any amount of extra chrome.

## Layout concept

The portfolio dashboard is a ledger page: thin horizontal rules between rows, each row is `date | description | debit/credit | running balance`, exactly like a physical passbook. Lessons render as rows in that same rhythm — an unstamped outline circle when locked/in-progress, a filled stamp mark when completed — so scrolling the dashboard reads as one continuous record of "what you learned and what you did," not two separate features glued together.

## Signature element — the stamp

A circular mark, slightly rotated (never perfectly upright — a real stamp never lands perfectly straight), with a deliberately rough/inked edge rather than a clean vector circle. Animates in with a quick "press down" motion (scale + slight opacity flash) exactly once, the moment something is genuinely earned: a lesson completed, a habit badge unlocked. Never used decoratively, never used for a trade's profitability (see `docs/LOGIC.md` §"Design constraint").

## Motion

Restrained. The stamp's press-in animation is the one deliberate, orchestrated moment in the product. Everything else (page transitions, list updates) should be quick and quiet — under 150ms, no bouncy easing. Respect `prefers-reduced-motion`: the stamp should still appear, just without the press-in animation.

## Accessibility floor

Visible keyboard focus rings using the `stamp` color at reduced opacity. All ledger-row text meets WCAG AA contrast against `paper`. The stamp mark is never the *only* indicator of completion — always paired with text ("Completed" / accessible label), since color/shape alone shouldn't carry that meaning.
