import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { computeInsights, computeHabitBadges, TransactionRecord, HoldingRecord } from "@/lib/insights";

export async function GET() {
  const supabase = supabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch user's portfolio
  const { data: portfolio, error: portError } = await supabase
    .from("portfolios")
    .select("id, cash_balance")
    .eq("user_id", user.id)
    .single();

  if (portError || !portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  // 2. Fetch holdings
  const { data: holdingsData } = await supabase
    .from("holdings")
    .select("id, symbol, qty, avg_price")
    .eq("portfolio_id", portfolio.id);

  const holdings: HoldingRecord[] = (holdingsData || []).map((h) => ({
    id: h.id,
    symbol: h.symbol,
    qty: Number(h.qty),
    avg_price: Number(h.avg_price),
  }));

  // 3. Fetch transactions
  const { data: txData } = await supabase
    .from("transactions")
    .select("id, symbol, side, qty, price, had_stop_loss, created_at")
    .eq("portfolio_id", portfolio.id)
    .order("created_at", { ascending: false });

  const transactions: TransactionRecord[] = (txData || []).map((t) => ({
    id: t.id,
    symbol: t.symbol,
    side: t.side as "buy" | "sell",
    qty: Number(t.qty),
    price: Number(t.price),
    had_stop_loss: t.had_stop_loss,
    created_at: t.created_at,
  }));

  // 4. Fetch lesson progress
  const { data: lessonsData } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id);

  const completedLessonCount = lessonsData ? lessonsData.length : 0;

  // 5. Compute insights & badges
  const insights = computeInsights(Number(portfolio.cash_balance), holdings, transactions);
  const badges = computeHabitBadges(holdings, transactions, completedLessonCount);

  // 6. Save computed insights to DB (upsert/insert unique kinds)
  if (insights.length > 0) {
    const rowsToInsert = insights.map((i) => ({
      user_id: user.id,
      kind: i.kind,
      message: i.message,
    }));
    await supabase.from("insights").insert(rowsToInsert);
  }

  return NextResponse.json({
    insights,
    badges,
    transactionCount: transactions.length,
  });
}
