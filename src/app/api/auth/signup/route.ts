import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Server-side signup handler with auto-confirm and official @supabase/ssr cookies.
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

    // Log user in and set cookies on response
    let response = NextResponse.json({
      success: true,
      user: { id: authData.user.id, email: authData.user.email },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            req.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            req.cookies.set({ name, value: "", ...options });
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    await supabase.auth.signInWithPassword({ email, password });

    return response;
  } catch (err) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected registration error." },
      { status: 500 }
    );
  }
}
