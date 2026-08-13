import { NextRequest, NextResponse } from "next/server";
import { getHistoricalPrices } from "@/lib/prices";

/**
 * GET /api/prices/history?symbol=RELIANCE.NS&range=5d&interval=15m
 *
 * Serves delayed OHLC candle history array for chart rendering.
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  const range = req.nextUrl.searchParams.get("range") || "5d";
  const interval = req.nextUrl.searchParams.get("interval") || "15m";

  if (!symbol) {
    return NextResponse.json({ error: "symbol query param is required" }, { status: 400 });
  }

  try {
    const candles = await getHistoricalPrices(symbol, range, interval);
    return NextResponse.json({ symbol, candles });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch chart history" },
      { status: 502 }
    );
  }
}
