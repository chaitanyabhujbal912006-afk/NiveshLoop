import { describe, it, expect } from "vitest";
import {
  detectQuickSells,
  detectNoStopLoss,
  detectConcentration,
  detectSpikeChasing,
  computeInsights,
  computeHabitBadges,
  TransactionRecord,
  HoldingRecord,
} from "./insights";

describe("Behavioral Insights Engine", () => {
  it("detects quick sells when 3 or more buy-sell pairs occur within 24h", () => {
    const now = Date.now();
    const transactions: TransactionRecord[] = [
      { id: "1", symbol: "TCS.NS", side: "buy", qty: 10, price: 3500, had_stop_loss: false, created_at: new Date(now - 1000000).toISOString() },
      { id: "2", symbol: "TCS.NS", side: "sell", qty: 10, price: 3550, had_stop_loss: false, created_at: new Date(now - 500000).toISOString() },
      { id: "3", symbol: "INFY.NS", side: "buy", qty: 5, price: 1400, had_stop_loss: false, created_at: new Date(now - 400000).toISOString() },
      { id: "4", symbol: "INFY.NS", side: "sell", qty: 5, price: 1390, had_stop_loss: false, created_at: new Date(now - 300000).toISOString() },
      { id: "5", symbol: "RELIANCE.NS", side: "buy", qty: 2, price: 2900, had_stop_loss: false, created_at: new Date(now - 200000).toISOString() },
      { id: "6", symbol: "RELIANCE.NS", side: "sell", qty: 2, price: 2920, had_stop_loss: false, created_at: new Date(now - 100000).toISOString() },
    ];

    const res = detectQuickSells(transactions);
    expect(res).not.toBeNull();
    expect(res?.kind).toBe("quick_sell");
    expect(res?.title).toBe("Frequent Fast Exits");
  });

  it("does not trigger quick sell insight for sells > 24 hours after buy", () => {
    const now = Date.now();
    const dayAndHalf = 36 * 60 * 60 * 1000;
    const transactions: TransactionRecord[] = [
      { id: "1", symbol: "TCS.NS", side: "buy", qty: 10, price: 3500, had_stop_loss: false, created_at: new Date(now - dayAndHalf * 2).toISOString() },
      { id: "2", symbol: "TCS.NS", side: "sell", qty: 10, price: 3550, had_stop_loss: false, created_at: new Date(now - dayAndHalf).toISOString() },
    ];

    const res = detectQuickSells(transactions);
    expect(res).toBeNull();
  });

  it("detects missing stop-loss when last 5 buys have no stop-loss attached", () => {
    const transactions: TransactionRecord[] = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`,
      symbol: "RELIANCE.NS",
      side: "buy",
      qty: 1,
      price: 2800,
      had_stop_loss: false,
      created_at: new Date(Date.now() - i * 10000).toISOString(),
    }));

    const res = detectNoStopLoss(transactions);
    expect(res).not.toBeNull();
    expect(res?.kind).toBe("no_stop_loss");
  });

  it("detects high single-stock concentration (>70% of portfolio)", () => {
    const cash = 10000;
    const holdings: HoldingRecord[] = [
      { id: "h1", symbol: "RELIANCE.NS", qty: 30, avg_price: 3000, current_price: 3000 }, // 90,000 value out of 100,000 total = 90%
    ];

    const res = detectConcentration(cash, holdings);
    expect(res).not.toBeNull();
    expect(res?.kind).toBe("concentration");
    expect(res?.message).toContain("90%");
  });

  it("does not flag concentration when portfolio is diversified", () => {
    const cash = 40000;
    const holdings: HoldingRecord[] = [
      { id: "h1", symbol: "RELIANCE.NS", qty: 10, avg_price: 2000, current_price: 2000 }, // 20k = 20%
      { id: "h2", symbol: "TCS.NS", qty: 10, avg_price: 2000, current_price: 2000 }, // 20k = 20%
      { id: "h3", symbol: "INFY.NS", qty: 10, avg_price: 2000, current_price: 2000 }, // 20k = 20%
    ];

    const res = detectConcentration(cash, holdings);
    expect(res).toBeNull();
  });

  it("evaluates habit badges correctly", () => {
    const holdings: HoldingRecord[] = [
      { id: "1", symbol: "RELIANCE.NS", qty: 5, avg_price: 2500 },
      { id: "2", symbol: "TCS.NS", qty: 2, avg_price: 3500 },
      { id: "3", symbol: "INFY.NS", qty: 10, avg_price: 1400 },
    ];
    const transactions: TransactionRecord[] = [
      { id: "t1", symbol: "RELIANCE.NS", side: "buy", qty: 5, price: 2500, had_stop_loss: true, created_at: new Date().toISOString() },
    ];

    const badges = computeHabitBadges(holdings, transactions, 5);
    const divBadge = badges.find((b) => b.id === "diversified");
    const cooledBadge = badges.find((b) => b.id === "cooled_off");

    expect(divBadge?.earned).toBe(true);
    expect(cooledBadge?.earned).toBe(true);
  });

  it("evaluates diamond_hands, patience_master, and disciplined_investor badges", () => {
    const holdings: HoldingRecord[] = [
      { id: "1", symbol: "TCS.NS", qty: 5, avg_price: 3500 },
    ];
    const transactions: TransactionRecord[] = [
      { id: "t1", symbol: "TCS.NS", side: "buy", qty: 5, price: 3500, had_stop_loss: true, created_at: "2026-08-01T10:00:00Z" },
      { id: "t2", symbol: "INFY.NS", side: "buy", qty: 3, price: 1500, had_stop_loss: true, created_at: "2026-08-03T10:00:00Z" },
      { id: "t3", symbol: "HDFC.NS", side: "buy", qty: 2, price: 1600, had_stop_loss: true, created_at: "2026-08-05T10:00:00Z" },
      { id: "t4", symbol: "WIPRO.NS", side: "buy", qty: 10, price: 450, had_stop_loss: false, created_at: "2026-08-07T10:00:00Z" },
    ];

    const badges = computeHabitBadges(holdings, transactions, 5);
    const diamondBadge = badges.find((b) => b.id === "diamond_hands");
    const patienceBadge = badges.find((b) => b.id === "patience_master");
    const disciplinedBadge = badges.find((b) => b.id === "disciplined_investor");

    expect(diamondBadge?.earned).toBe(true);
    expect(patienceBadge?.earned).toBe(true);
    expect(disciplinedBadge?.earned).toBe(true);
  });
});
