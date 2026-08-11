import { describe, it, expect } from "vitest";
import { analyzeTip } from "../src/lib/scam-checker";

describe("analyzeTip (SEBI Scam & Tip Checker)", () => {
  it("returns zero risk for empty or neutral news text", () => {
    const result = analyzeTip("TCS reported Q3 net profit of Rs 11,000 crore, up 5% YoY.");
    expect(result.riskScore).toBe(0);
    expect(result.riskLevel).toBe("Low");
    expect(result.flags.length).toBe(0);
  });

  it("detects blatant guaranteed returns and Telegram scams", () => {
    const scamTip = "JOIN OUR VIP TELEGRAM GROUP FOR GUARANTEED 100% PROFIT DAILY CALLS! SURE SHOT JACKPOT!";
    const result = analyzeTip(scamTip);
    expect(result.riskScore).toBeGreaterThanOrEqual(60);
    expect(result.riskLevel).toBe("Critical");
    expect(result.flags.some((f) => f.category === "guaranteed_returns")).toBe(true);
    expect(result.flags.some((f) => f.category === "unregistered_channel")).toBe(true);
  });

  it("detects pump & dump penny stock manipulations", () => {
    const pumpTip = "Buy penny stock hidden gem NOW before 9:15 AM! Operator stock target 1000% multibagger alert!";
    const result = analyzeTip(pumpTip);
    expect(result.riskScore).toBeGreaterThanOrEqual(50);
    expect(result.flags.some((f) => f.category === "pump_and_dump")).toBe(true);
    expect(result.flags.some((f) => f.category === "fomo_urgency")).toBe(true);
  });

  it("detects fake SEBI registration claims", () => {
    const fakeSebiTip = "100% SEBI approved tips! Join WhatsApp group for risk free daily profit.";
    const result = analyzeTip(fakeSebiTip);
    expect(result.riskScore).toBeGreaterThan(40);
    expect(result.flags.some((f) => f.category === "fake_sebi_claim")).toBe(true);
  });
});
