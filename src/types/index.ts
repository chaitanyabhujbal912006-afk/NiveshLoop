export type TradeSide = "buy" | "sell";

export interface Holding {
  symbol: string;
  qty: number;
  avgPrice: number;
}

export interface Portfolio {
  id: string;
  cashBalance: number;
  holdings: Holding[];
}

export interface PriceQuote {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  prevClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  fetchedAt: string; // ISO timestamp — always show this next to any price in the UI
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  bodyMd: string;
  orderIndex: number;
  unlocksAction: string | null;
}

export interface Insight {
  kind: string;
  message: string;
  computedAt: string;
}
