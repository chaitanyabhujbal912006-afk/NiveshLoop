"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase-client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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

      const supabase = supabaseBrowser();
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
      if (loginErr) throw loginErr;

      setDone(true);
      setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper ledger-bg flex">
      {/* ── Left panel — editorial brand statement ── */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-paper w-[420px] shrink-0 p-12 relative overflow-hidden">
        {/* Faint ledger lines on dark */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(transparent,transparent 47px,rgba(92,122,99,1) 47px,rgba(92,122,99,1) 48px)" }}
        />
        {/* Red spine */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-stamp/90" />

        <div className="relative">
          <Link href="/" className="font-display text-paper font-semibold text-base tracking-tight mb-16 block">
            Nivesh<span className="text-stamp">Loop</span>
          </Link>
        </div>

        <div className="relative">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-paper/30 mb-6">
            Your passbook starts here
          </p>
          <h1 className="font-display text-5xl font-semibold text-paper leading-[1.0] mb-8">
            ₹1,00,000<br />
            <span className="text-stamp">in your hand.</span><br />
            <span className="italic text-paper/60">Not one rupee real.</span>
          </h1>
          <div className="space-y-4">
            {[
              "15 lessons, each ending with a trade",
              "Your behavior reflected back to you",
              "Unlocks that prove you learned",
              "No streaks, no urgency, no advice",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="font-mono text-stamp/60 mt-0.5">—</span>
                <p className="font-body text-sm text-paper/60">{t}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="font-mono text-[9px] text-paper/20 uppercase tracking-widest">
            Simulated · Educational · Free
          </p>
        </div>
      </div>

      {/* ── Right panel — the form ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-16 relative">
        {/* Mobile brand */}
        <div className="lg:hidden mb-10">
          <Link href="/" className="font-display text-ink font-semibold text-xl tracking-tight">
            Nivesh<span className="text-stamp">Loop</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          {/* Passbook header */}
          <div className="border border-rule/35 border-b-0 bg-rule/[0.03] px-6 py-4 relative">
            {/* Spine */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-stamp/80" />
            <div className="ml-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted mb-0.5">
                Passbook Setup · Step 1 of 1
              </p>
              <p className="font-display text-2xl font-semibold text-ink">
                Open your passbook
              </p>
            </div>
          </div>

          {/* Form body */}
          <div className="border border-rule/35 bg-paper px-6 pt-6 pb-8 relative">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-stamp/80" />
            <div className="ml-2">
              <p className="font-body text-sm text-ink/65 mb-7 leading-relaxed">
                ₹1,00,000 in virtual cash to practise with. No real money. No credit card.
              </p>

              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 1.5, rotate: -12, opacity: 0 }}
                      animate={{ scale: 1, rotate: -6, opacity: 1 }}
                      transition={{ duration: 0.2, ease: [0.25, 0, 0, 1] }}
                      className="inline-block mb-4"
                    >
                      <svg viewBox="0 0 80 80" className="h-20 w-20" aria-label="Passbook opened">
                        <defs>
                          <filter id="ink-done">
                            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" />
                          </filter>
                        </defs>
                        <g filter="url(#ink-done)">
                          <circle cx="40" cy="40" r="34" fill="none" stroke="#8C2F39" strokeWidth="3" />
                          <circle cx="40" cy="40" r="29" fill="none" stroke="#8C2F39" strokeWidth="1" />
                          <path d="M25 40 L35 50 L56 28" fill="none" stroke="#8C2F39" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                      </svg>
                    </motion.div>
                    <p className="font-display text-xl font-semibold text-ink mb-1">Passbook opened.</p>
                    <p className="font-mono text-xs text-muted">Taking you to your ledger…</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="border-l-2 border-loss pl-3 py-1"
                      >
                        <p className="font-mono text-xs text-loss">{error}</p>
                      </motion.div>
                    )}

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
                        Password <span className="normal-case tracking-normal text-muted/60">— min 6 characters</span>
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="ledger-input w-full font-mono text-sm text-ink"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-stamp text-paper font-body font-semibold py-3.5 text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
                    >
                      {loading ? "Opening passbook…" : "Start with ₹1,00,000 →"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <p className="mt-6 text-center font-mono text-[10px] text-muted uppercase tracking-wider">
                Already have a passbook?{" "}
                <Link href="/login" className="text-stamp hover:opacity-70 transition-opacity">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer disclaimer */}
          <div className="border border-rule/35 border-t-0 px-6 py-3 bg-rule/[0.02]">
            <div className="ml-2">
              <p className="font-mono text-[9px] text-muted uppercase tracking-widest">
                Simulated · Prices delayed ~15 min · Not real money · Not investment advice
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
