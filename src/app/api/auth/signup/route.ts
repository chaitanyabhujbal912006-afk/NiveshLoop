import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";

/**
 * Server-side signup handler. Creates the Supabase Auth user, auto-confirms email,
 * provisions initial portfolio, and signs user in via cookies.
 * Server-side only (per AGENTS.md rules).
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Valid email and password (minimum 6 characters) are required." },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? "Failed to create user account." },
        { status: 400 }
      );
    }

    // Create portfolio with ₹1,00,000 virtual cash balance
    const { error: pErr } = await admin.from("portfolios").upsert(
      {
        user_id: authData.user.id,
        cash_balance: 100000.0,
      },
      { onConflict: "user_id" }
    );

    if (pErr) {
      console.error("Error creating portfolio:", pErr);
    }

    // Server-side sign in to set cookies
    const supabase = supabaseServer();
    await supabase.auth.signInWithPassword({ email, password });

    return NextResponse.json({
      success: true,
      user: { id: authData.user.id, email: authData.user.email },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected registration error." },
      { status: 500 }
    );
  }
}
