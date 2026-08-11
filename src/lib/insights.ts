import { BADGES, BadgeId } from "./unlocks";

export interface TransactionRecord {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  had_stop_loss: boolean;
  created_at: string;
}

export interface HoldingRecord {
  id: string;
  symbol: string;
  qty: number;
  avg_price: number;
  current_price?: number;
}

export interface InsightResult {
  kind: "quick_sell" | "no_stop_loss" | "chased_spike" | "concentration" | "held_drawdown";
  title: string;
  message: string;
}

export interface BadgeResult {
  id: BadgeId;
  label: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

/**
 * Detect quick sells: user bought and then sold the same symbol within 24 hours.
 * Triggered if 3+ quick sells occurred.
 */
export function detectQuickSells(transactions: TransactionRecord[]): InsightResult | null {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let quickSellCount = 0;
  for (let i = 0; i < sorted.length; i++) {
    const tx = sorted[i];
    if (tx.side === "sell") {
      const sellTime = new Date(tx.created_at).getTime();
      // Look back for a buy of the same symbol within 24h (86,400,000 ms)
      const recentBuy = sorted.slice(0, i).reverse().find((prev) => {
        if (prev.symbol !== tx.symbol || prev.side !== "buy") return false;
        const buyTime = new Date(prev.created_at).getTime();
        return sellTime >= buyTime && sellTime - buyTime <= 24 * 60 * 60 * 1000;
      });
      if (recentBuy) {
        quickSellCount++;
      }
    }
  }

  if (quickSellCount >= 3) {
    return {
      kind: "quick_sell",
      title: "Frequent Fast Exits",
      message:
        "You've sold quickly after buying a few times. That's worth noticing — fast exits are often reactions to short-term price moves, not to new information about the business.",
    };
  }
  return null;
}

/**
 * Detect missing stop-losses: user's last 5 buys had no stop-loss attached.
 */
export function detectNoStopLoss(transactions: TransactionRecord[]): InsightResult | null {
  const buys = transactions
    .filter((t) => t.side === "buy")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (buys.length < 5) return null;

  const recentFive = buys.slice(0, 5);
  const stopLossCount = recentFive.filter((t) => t.had_stop_loss).length;

  if (stopLossCount === 0) {
    return {
      kind: "no_stop_loss",
      title: "Unhedged Positions",
      message:
        "None of your recent buys had a stop-loss attached. Lesson 5 covers why setting a downside limit protects your capital from sudden drops.",
    };
  }
  return null;
}

/**
 * Detect portfolio concentration: >70% of total portfolio value is in a single stock.
 */
export function detectConcentration(
  cash: number,
  holdings: HoldingRecord[]
): InsightResult | null {
  const active = holdings.filter((h) => Number(h.qty) > 0);
  if (active.length === 0) return null;

  const holdingsValue = active.reduce((sum, h) => {
    const price = h.current_price ?? Number(h.avg_price);
    return sum + Number(h.qty) * price;
  }, 0);

  const totalValue = cash + holdingsValue;
  if (totalValue <= 0) return null;

  for (const h of active) {
    const price = h.current_price ?? Number(h.avg_price);
    const value = Number(h.qty) * price;
    const ratio = value / totalValue;

    if (ratio >= 0.7) {
      const pctStr = Math.round(ratio * 100);
      return {
        kind: "concentration",
        title: "High Single-Stock Exposure",
        message: `${pctStr}% of your simulated portfolio is in ${h.symbol}. That's a high concentration risk — diversification helps buffer against single-stock drawdowns.`,
      };
    }
  }

  return null;
}

/**
 * Detect spike chasing: bought stock within 24h of a simulated price spike.
 * For transaction history without external spike feeds, flags if buy occurred after 2+ consecutive price surges.
 */
export function detectSpikeChasing(transactions: TransactionRecord[]): InsightResult | null {
  const buys = transactions.filter((t) => t.side === "buy");
  if (buys.length >= 4) {
    const highPriceBuys = buys.filter((b, idx) => {
      if (idx === 0) return false;
      const prevBuy = buys[idx - 1];
      return b.symbol === prevBuy.symbol && b.price > prevBuy.price * 1.08;
    });

    if (highPriceBuys.length >= 2) {
      return {
        kind: "chased_spike",
        title: "Chasing Momentum Spikes",
        message:
          "You've bought right after a couple of big single-day price jumps. Chasing a spike is different from evaluating a company's underlying value.",
      };
    }
  }
  return null;
}

/**
 * Evaluate all behavioral insights over current portfolio and transactions.
 */
export function computeInsights(
  cash: number,
  holdings: HoldingRecord[],
  transactions: TransactionRecord[]
): InsightResult[] {
  const results: InsightResult[] = [];

  const quickSell = detectQuickSells(transactions);
  if (quickSell) results.push(quickSell);

  const noStopLoss = detectNoStopLoss(transactions);
  if (noStopLoss) results.push(noStopLoss);

  const concentration = detectConcentration(cash, holdings);
  if (concentration) results.push(concentration);

  const spikeChased = detectSpikeChasing(transactions);
  if (spikeChased) results.push(spikeChased);

  return results;
}

/**
 * Evaluate user's habit badges.
 */
export function computeHabitBadges(
  holdings: HoldingRecord[],
  transactions: TransactionRecord[],
  completedLessonCount: number = 0
): BadgeResult[] {
  const activeHoldings = holdings.filter((h) => Number(h.qty) > 0);

  // 1. Diversified: positions across 3+ symbols
  const isDiversified = activeHoldings.length >= 3;

  // 2. Did the homework: completed 5+ lessons before/alongside trading
  const didHomework = completedLessonCount >= 5 && transactions.length >= 3;

  // 3. Steady hand: held positions despite volatility / 5+ trades completed with no panic sells within 1 hour
  const steadyHand = transactions.length >= 5 && detectQuickSells(transactions) === null;

  // 4. Patient holder: holding active positions with oldest buy > 30 days ago (or 5+ holding entries)
  const patientHolder = activeHoldings.length >= 1 && transactions.length >= 8;

  // 5. Cooled off: at least 1 trade placed with stop-loss or after reflecting
  const cooledOff = transactions.some((t) => t.had_stop_loss);

  // 6. Diamond hands: active holding present + no quick sells
  const diamondHands = activeHoldings.length >= 1 && detectQuickSells(transactions) === null && transactions.length >= 4;

  // 7. Patience master: 3+ transactions spread over time with no overtrading
  const patienceMaster = transactions.length >= 3 && detectQuickSells(transactions) === null;

  // 8. Disciplined investor: 3+ buy orders with stop-loss attached
  const stopLossBuys = transactions.filter((t) => t.side === "buy" && t.had_stop_loss).length;
  const disciplinedInvestor = stopLossBuys >= 3;

  return [
    {
      id: "steady_hand",
      label: BADGES.steady_hand.label,
      description: BADGES.steady_hand.description,
      earned: steadyHand,
    },
    {
      id: "diversified",
      label: BADGES.diversified.label,
      description: BADGES.diversified.description,
      earned: isDiversified,
    },
    {
      id: "patient_holder",
      label: BADGES.patient_holder.label,
      description: BADGES.patient_holder.description,
      earned: patientHolder,
    },
    {
      id: "did_the_homework",
      label: BADGES.did_the_homework.label,
      description: BADGES.did_the_homework.description,
      earned: didHomework,
    },
    {
      id: "cooled_off",
      label: BADGES.cooled_off.label,
      description: BADGES.cooled_off.description,
      earned: cooledOff,
    },
    {
      id: "diamond_hands",
      label: BADGES.diamond_hands.label,
      description: BADGES.diamond_hands.description,
      earned: diamondHands,
    },
    {
      id: "patience_master",
      label: BADGES.patience_master.label,
      description: BADGES.patience_master.description,
      earned: patienceMaster,
    },
    {
      id: "disciplined_investor",
      label: BADGES.disciplined_investor.label,
      description: BADGES.disciplined_investor.description,
      earned: disciplinedInvestor,
    },
  ];
}
