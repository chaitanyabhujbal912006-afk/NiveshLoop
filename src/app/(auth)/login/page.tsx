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

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Server returned status ${res.status}. Please check your connection and try again.`);
      }

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

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(92,122,99,1) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />

        <div className="relative">
          <Link href="/" className="font-display text-paper font-semibold text-base tracking-tight block">
            Nivesh<span className="text-stamp">Loop</span>
          </Link>
        </div>

        {/* ── Animated Mini Chart ── */}
        <div className="relative">
          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-paper/25 mb-3">✓ Portfolio simulation active</p>

          {/* SVG chart — seeded decoration, purely illustrative */}
          <div className="border border-paper/10 p-3 mb-5" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] text-paper/40 uppercase tracking-widest">Portfolio — 30d view</span>
              <span className="font-mono text-[9px] text-gain/80">+4.2%</span>
            </div>
            <svg viewBox="0 0 280 70" className="w-full" aria-hidden>
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F6B4F" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2F6B4F" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Ledger lines */}
              {[14, 28, 42, 56].map(y => (
                <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="rgba(92,122,99,0.12)" strokeWidth="1" />
              ))}
              {/* Area */}
              <path
                d="M0,55 C20,52 35,48 55,45 C70,42 80,50 100,44 C115,38 125,30 140,28 C158,25 165,35 185,30 C200,26 215,18 235,15 C250,12 265,14 280,10 L280,70 L0,70 Z"
                fill="url(#chart-grad)"
              />
              {/* Line */}
              <polyline
                fill="none"
                stroke="#2F6B4F"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,55 20,52 35,48 55,45 70,42 80,50 100,44 115,38 125,30 140,28 158,25 165,35 185,30 200,26 215,18 235,15 250,12 265,14 280,10"
              />
              {/* Last dot */}
              <circle cx="280" cy="10" r="2.5" fill="#2F6B4F" />
              <circle cx="280" cy="10" r="5" fill="#2F6B4F" fillOpacity="0.2" />
            </svg>
          </div>

          {/* Ledger rows preview */}
          <div className="space-y-2 mb-6">
            {[
              { ref: "L-05", text: "Stop-loss lesson read", tag: "lesson" },
              { ref: "T-07", text: "Bought 5 × INFY.NS", tag: "trade" },
              { ref: "R-02", text: "3 exits — pattern noted", tag: "insight" },
            ].map((row) => (
              <div key={row.ref} className="grid grid-cols-[2.5rem_1fr_auto] gap-2 items-center">
                <span className="font-mono text-[8px] text-paper/30 tabular-nums">{row.ref}</span>
                <span className="font-mono text-[9px] text-paper/55 truncate">{row.text}</span>
                <span className={`font-mono text-[7px] uppercase px-1.5 py-0.5 border tracking-widest ${
                  row.tag === "lesson" ? "border-stamp/40 text-stamp/70"
                  : row.tag === "trade" ? "border-paper/15 text-paper/40"
                  : "border-paper/10 text-paper/25"
                }`}>{row.tag}</span>
              </div>
            ))}
          </div>

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
            waiting to be read &mdash; it&apos;s all still there.
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
