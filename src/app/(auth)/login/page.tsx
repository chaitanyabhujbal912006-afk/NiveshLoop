"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper ledger-bg flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-paper w-[420px] shrink-0 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(transparent,transparent 47px,rgba(92,122,99,1) 47px,rgba(92,122,99,1) 48px)" }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-stamp/90" />

        <div className="relative">
          <Link href="/" className="font-display text-paper font-semibold text-base tracking-tight block">
            Nivesh<span className="text-stamp">Loop</span>
          </Link>
        </div>

        <div className="relative">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-paper/30 mb-6">
            Continue where you left off
          </p>
          <h1 className="font-display text-5xl font-semibold text-paper leading-[1.0] mb-8">
            Your<br />
            passbook<br />
            <span className="text-stamp italic">is waiting.</span>
          </h1>
          <p className="font-body text-sm text-paper/50 leading-relaxed max-w-xs">
            Every lesson you completed, every trade you placed, every reflection
            waiting to be read — it&rsquo;s all still there.
          </p>
        </div>

        <div className="relative">
          <p className="font-mono text-[9px] text-paper/20 uppercase tracking-widest">
            Simulated · Educational · Free
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-16 relative">
        <div className="lg:hidden mb-10">
          <Link href="/" className="font-display text-ink font-semibold text-xl tracking-tight">
            Nivesh<span className="text-stamp">Loop</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Passbook header */}
          <div className="border border-rule/35 border-b-0 bg-rule/[0.03] px-6 py-4 relative">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-stamp/80" />
            <div className="ml-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted mb-0.5">
                Passbook Access
              </p>
              <p className="font-display text-2xl font-semibold text-ink">
                Welcome back
              </p>
            </div>
          </div>

          {/* Form body */}
          <div className="border border-rule/35 bg-paper px-6 pt-6 pb-8 relative">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-stamp/80" />
            <div className="ml-2">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="border-l-2 border-loss pl-3 py-1 mb-6"
                >
                  <p className="font-mono text-xs text-loss">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="ledger-input w-full font-mono text-sm text-ink placeholder:text-muted/40"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ledger-input w-full font-mono text-sm text-ink"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stamp text-paper font-body font-semibold py-3.5 text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {loading ? "Opening passbook…" : "Open my passbook →"}
                </button>
              </form>

              <p className="mt-6 text-center font-mono text-[10px] text-muted uppercase tracking-wider">
                New here?{" "}
                <Link href="/signup" className="text-stamp hover:opacity-70 transition-opacity">
                  Open a free passbook
                </Link>
              </p>
            </div>
          </div>

          <div className="border border-rule/35 border-t-0 px-6 py-3 bg-rule/[0.02]">
            <div className="ml-2">
              <p className="font-mono text-[9px] text-muted uppercase tracking-widest">
                Simulated · Prices delayed ~15 min · Not real money · Not investment advice
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
