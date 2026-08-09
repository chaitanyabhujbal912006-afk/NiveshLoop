export interface BuyCalculationInput {
  currentCash: number;
  existingQty: number;
  existingAvgPrice: number;
  buyQty: number;
  buyPrice: number;
}

export interface BuyCalculationResult {
  newCash: number;
  newQty: number;
  newAvgPrice: number;
  totalCost: number;
}

/**
 * Calculates new cash balance, holdings quantity, and weighted average price after a buy order.
 * Throws if total cost exceeds available virtual cash balance.
 */
export function calculateBuy({
  currentCash,
  existingQty,
  existingAvgPrice,
  buyQty,
  buyPrice,
}: BuyCalculationInput): BuyCalculationResult {
  const totalCost = buyQty * buyPrice;
  if (totalCost > currentCash) {
    throw new Error("Insufficient virtual cash");
  }

  const newQty = existingQty + buyQty;
  const newAvgPrice =
    existingQty > 0
      ? (existingQty * existingAvgPrice + totalCost) / newQty
      : buyPrice;

  return {
    newCash: currentCash - totalCost,
    newQty,
    newAvgPrice,
    totalCost,
  };
}

export interface SellCalculationInput {
  currentCash: number;
  existingQty: number;
  sellQty: number;
  sellPrice: number;
}

export interface SellCalculationResult {
  newCash: number;
  remainingQty: number;
  totalRevenue: number;
}

/**
 * Calculates new cash balance and remaining holding quantity after a sell order.
 * Throws if selling more shares than currently held.
 */
export function calculateSell({
  currentCash,
  existingQty,
  sellQty,
  sellPrice,
}: SellCalculationInput): SellCalculationResult {
  if (sellQty > existingQty) {
    throw new Error("Not enough shares to sell");
  }

  const totalRevenue = sellQty * sellPrice;
  return {
    newCash: currentCash + totalRevenue,
    remainingQty: existingQty - sellQty,
    totalRevenue,
  };
}
