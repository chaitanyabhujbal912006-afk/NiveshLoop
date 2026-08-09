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
    const res = await fetch(`${base}/stock?symbol=${encodeURIComponent(symbol)}`, {
      // Next.js: don't cache at the fetch layer, we manage caching ourselves via Supabase.
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Price source returned ${res.status}`);
    const json = await res.json();

    // TODO: adjust this to match the actual response shape of whichever free
    // price source you wire up — this is a placeholder field name.
    const price: number = json.price ?? json.last_price;
    if (typeof price !== "number") throw new Error("Unexpected price response shape");

    const fetchedAt = new Date().toISOString();
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
