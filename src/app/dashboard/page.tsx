import { redirect } from "next/navigation";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import { getPrice } from "@/lib/prices";
import { DashboardView } from "@/components/DashboardView";

export const revalidate = 0; // dynamic server-rendered page

export default async function DashboardPage() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = supabaseAdmin();

  // Fetch portfolio
  let { data: portfolio } = await admin
    .from("portfolios")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!portfolio) {
    const { data: newPortfolio } = await admin
      .from("portfolios")
      .insert({ user_id: user.id, cash_balance: 100000.0 })
      .select("*")
      .single();
    portfolio = newPortfolio;
  }

  // Fetch holdings
  const { data: holdings } = await admin
    .from("holdings")
    .select("*")
    .eq("portfolio_id", portfolio?.id ?? "")
    .order("updated_at", { ascending: false });

  // Fetch current delayed quotes for holdings
  const holdingsWithPrices = await Promise.all(
    (holdings ?? []).map(async (h) => {
      try {
        const quote = await getPrice(h.symbol);
        return {
          ...h,
          current_price: quote.price,
          fetched_at: quote.fetchedAt,
        };
      } catch {
        return {
          ...h,
          current_price: Number(h.avg_price),
        };
      }
    })
  );

  // Fetch transaction history
  const { data: transactions } = await admin
    .from("transactions")
    .select("*")
    .eq("portfolio_id", portfolio?.id ?? "")
    .order("created_at", { ascending: false });

  // Fetch completed lesson progress
  const { data: progress } = await admin
    .from("lesson_progress")
    .select("lessons(slug)")
    .eq("user_id", user.id);

  const completedLessonSlugs = (progress ?? [])
    .map((p: any) => p.lessons?.slug)
    .filter(Boolean);

  return (
    <DashboardView
      userEmail={user.email ?? "Investor"}
      initialCash={Number(portfolio?.cash_balance ?? 100000.0)}
      initialHoldings={holdingsWithPrices}
      initialTransactions={transactions ?? []}
      completedLessonSlugs={completedLessonSlugs}
    />
  );
}
