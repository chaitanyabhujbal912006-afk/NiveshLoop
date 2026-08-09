import { supabaseAdmin } from "./supabase";
import type { PriceQuote } from "@/types";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — see docs/ARCHITECTURE.md §4

/**
 * Returns a delayed price for `symbol` (e.g. "RELIANCE.NS"), serving from the
 * Supabase price_cache table if it's fresh enough, otherwise refetching from
 * the free price source and updating the cache.
 *
 * Never throws on a source failure — falls back to the last cached price
 * (however old) rather than breaking the portfolio view. The caller is
 * responsible for showing `fetchedAt` next to the price in the UI.
 */
export async function getPrice(symbol: string): Promise<PriceQuote> {
  const admin = supabaseAdmin();

  const { data: cached } = await admin
    .from("price_cache")
    .select("*")
    .eq("symbol", symbol)
    .maybeSingle();

  const isFresh =
    cached && Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS;

  if (isFresh) {
    return { symbol, price: cached.price, fetchedAt: cached.fetched_at };
  }

  try {
    const base = process.env.PRICE_API_BASE_URL;
    let price: number;
    let fetchedAt = new Date().toISOString();

    if (!base) {
      // Fallback mock prices for stock simulation when external API URL is not set
      const defaultPrices: Record<string, number> = {
        "TCS.NS": 3842.50,
        "RELIANCE.NS": 2940.00,
        "INFY.NS": 1815.20,
        "HDFCBANK.NS": 1642.00,
        "WIPRO.NS": 485.60,
        "TATAMOTORS.NS": 980.00,
        "ICICIBANK.NS": 1150.00,
        "SBIN.NS": 820.00,
      };
      price = defaultPrices[symbol.toUpperCase()] ?? 1500.00;
    } else {
      const res = await fetch(`${base}/stock?symbol=${encodeURIComponent(symbol)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Price source returned ${res.status}`);
      const json = await res.json();
      price = json.price ?? json.last_price;
      if (typeof price !== "number") throw new Error("Unexpected price response shape");
    }

    await admin.from("price_cache").upsert({ symbol, price, fetched_at: fetchedAt });
    return { symbol, price, fetchedAt };
  } catch (err) {
    console.error(`getPrice: falling back to cache for ${symbol}`, err);
    if (cached) {
      return { symbol, price: cached.price, fetchedAt: cached.fetched_at };
    }
    throw new Error(`No price available for ${symbol} and source fetch failed`);
  }
}
