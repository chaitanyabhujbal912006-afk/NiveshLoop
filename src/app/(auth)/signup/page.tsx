"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Signup failed");

      // Authenticate browser session
      const supabase = supabaseBrowser();
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginErr) throw loginErr;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="border border-rule/30 rounded-sm p-8 bg-paper">
        <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
          Passbook Setup · Step 1
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-6">
          Open your passbook
        </h1>
        <p className="text-sm text-ink/80 mb-6">
          Get started with ₹1,00,000 in virtual cash. No real money, no credit card required.
        </p>

        {error && (
          <div className="bg-loss/10 border border-loss/30 text-loss text-sm rounded-sm p-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-rule/40 rounded-sm px-3.5 py-2.5 bg-transparent font-mono text-sm text-ink focus:outline-none focus:border-stamp"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Password (min 6 chars)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-rule/40 rounded-sm px-3.5 py-2.5 bg-transparent font-mono text-sm text-ink focus:outline-none focus:border-stamp"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stamp text-paper py-3 rounded-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating passbook..." : "Start with ₹1,00,000 fake money"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Already have a passbook?{" "}
          <Link href="/login" className="text-stamp font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Simulated portfolio only. Prices delayed ~15 minutes. Not real money. Not investment advice.
      </p>
    </main>
  );
}
