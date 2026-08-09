import { describe, it, expect } from "vitest";
import { calculateBuy, calculateSell } from "../src/lib/trade-math";

describe("Trade Math Calculations", () => {
  describe("calculateBuy", () => {
    it("deducts cash balance and calculates new holding quantity and price correctly for a new position", () => {
      const result = calculateBuy({
        currentCash: 100000,
        existingQty: 0,
        existingAvgPrice: 0,
        buyQty: 10,
        buyPrice: 2000,
      });

      expect(result.totalCost).toBe(20000);
      expect(result.newCash).toBe(80000);
      expect(result.newQty).toBe(10);
      expect(result.newAvgPrice).toBe(2000);
    });

    it("calculates weighted average price when adding to an existing position", () => {
      const result = calculateBuy({
        currentCash: 80000,
        existingQty: 10,
        existingAvgPrice: 2000, // 20,000 total cost
        buyQty: 10,
        buyPrice: 3000, // 30,000 additional cost
      });

      expect(result.totalCost).toBe(30000);
      expect(result.newCash).toBe(50000);
      expect(result.newQty).toBe(20);
      expect(result.newAvgPrice).toBe(2500); // (20000 + 30000) / 20 = 2500
    });

    it("throws an error if total cost exceeds current cash balance", () => {
      expect(() =>
        calculateBuy({
          currentCash: 10000,
          existingQty: 0,
          existingAvgPrice: 0,
          buyQty: 10,
          buyPrice: 2000,
        })
      ).toThrow("Insufficient virtual cash");
    });
  });

  describe("calculateSell", () => {
    it("adds revenue to cash balance and reduces remaining quantity correctly", () => {
      const result = calculateSell({
        currentCash: 50000,
        existingQty: 20,
        sellQty: 5,
        sellPrice: 2500,
      });

      expect(result.totalRevenue).toBe(12500);
      expect(result.newCash).toBe(62500);
      expect(result.remainingQty).toBe(15);
    });

    it("throws an error if attempting to sell more shares than currently held", () => {
      expect(() =>
        calculateSell({
          currentCash: 50000,
          existingQty: 5,
          sellQty: 10,
          sellPrice: 2500,
        })
      ).toThrow("Not enough shares to sell");
    });
  });
});
