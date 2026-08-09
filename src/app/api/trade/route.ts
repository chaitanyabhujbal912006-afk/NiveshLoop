import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import { getPrice } from "@/lib/prices";
import { calculateBuy, calculateSell } from "@/lib/trade-math";
import type { TradeSide } from "@/types";

interface TradeBody {
  symbol: string;
  side: TradeSide;
  qty: number;
  stopLoss?: number | null; // presence just gets logged as had_stop_loss for now
}

/**
 * Executes one simulated buy or sell. This is the only place cash_balance and
 * holdings are ever mutated — keep it that way (see AGENTS.md "Code quality").
 *
 * NOTE: this does a read-then-write against Supabase without a DB-level
 * transaction, which is fine for a solo-user student project but is a known
 * simplification — if you ever expect concurrent trades on the same
 * portfolio, move this logic into a Postgres function instead.
 */
export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body: TradeBody = await req.json();
  const { symbol, side, qty, stopLoss } = body;

  if (!symbol || !side || !qty || qty <= 0) {
    return NextResponse.json({ error: "Invalid trade payload" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: portfolio, error: pErr } = await admin
    .from("portfolios")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (pErr || !portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const quote = await getPrice(symbol);

  const { data: existingHolding } = await admin
    .from("holdings")
    .select("*")
    .eq("portfolio_id", portfolio.id)
    .eq("symbol", symbol)
    .maybeSingle();

  if (side === "buy") {
    let result;
    try {
      result = calculateBuy({
        currentCash: Number(portfolio.cash_balance),
        existingQty: existingHolding?.qty ?? 0,
        existingAvgPrice: existingHolding?.avg_price ?? 0,
        buyQty: qty,
        buyPrice: quote.price,
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Insufficient virtual cash" },
        { status: 400 }
      );
    }

    await admin.from("holdings").upsert({
      portfolio_id: portfolio.id,
      symbol,
      qty: result.newQty,
      avg_price: result.newAvgPrice,
      updated_at: new Date().toISOString(),
    });

    await admin
      .from("portfolios")
      .update({ cash_balance: result.newCash })
      .eq("id", portfolio.id);
  } else {
    let result;
    try {
      result = calculateSell({
        currentCash: Number(portfolio.cash_balance),
        existingQty: existingHolding?.qty ?? 0,
        sellQty: qty,
        sellPrice: quote.price,
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Not enough shares to sell" },
        { status: 400 }
      );
    }

    await admin
      .from("holdings")
      .update({ qty: result.remainingQty, updated_at: new Date().toISOString() })
      .eq("id", existingHolding.id);

    await admin
      .from("portfolios")
      .update({ cash_balance: result.newCash })
      .eq("id", portfolio.id);
  }

  await admin.from("transactions").insert({
    portfolio_id: portfolio.id,
    symbol,
    side,
    qty,
    price: quote.price,
    had_stop_loss: Boolean(stopLoss),
  });

  return NextResponse.json({ success: true, executedPrice: quote.price });
}
