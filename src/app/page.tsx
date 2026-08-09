import { Stamp } from "@/components/Stamp";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <p className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-6">
        Free · No ads · Simulated money only
      </p>

      <h1 className="font-display text-4xl sm:text-5xl leading-[1.15] text-ink mb-6">
        A passbook for learning to invest —
        <br />
        <span className="text-stamp">every entry earned, nothing simulated about the lesson.</span>
      </h1>

      <p className="font-body text-lg text-ink/75 mb-14 max-w-lg">
        Most places teach the theory, then leave you to figure out the doing.
        Here, every lesson and every trade lives in the same ledger — you read,
        you act with ₹1,00,000 in fake money, and every so often we hand the
        page back and show you the pattern in how you're actually investing.
      </p>

      <div className="border border-rule/30 rounded-sm mb-14 overflow-hidden bg-paper">
        <div className="px-5 py-3 border-b border-rule/30 flex justify-between items-baseline">
          <p className="font-display text-sm text-ink">Your passbook</p>
          <p className="font-mono text-xs text-muted">Page 1</p>
        </div>

        <LedgerRow date="Day 1" description="Lesson — What is a stock?" stamped />
        <LedgerRow date="Day 1" description="Bought 1 × TCS" amount="−₹3,842.00" negative />
        <LedgerRow date="Day 6" description="Lesson — Stop-losses" stamped />
        <LedgerRow date="Day 14" description="Reflection unlocked — 3 fast exits noticed" muted />
      </div>

      <a
        href="/signup"
        className="inline-block bg-stamp text-paper px-7 py-3 rounded-sm font-body font-medium hover:opacity-90 transition-opacity"
      >
        Open your passbook — start with ₹1,00,000 fake
      </a>

      <p className="mt-6 font-body text-sm text-muted max-w-md">
        Simulated portfolio only. Prices are delayed ~15 minutes and sourced
        for educational use. Nothing here is investment advice.
      </p>
    </main>
  );
}

function LedgerRow({
  date,
  description,
  amount,
  stamped,
  negative,
  muted,
}: {
  date: string;
  description: string;
  amount?: string;
  stamped?: boolean;
  negative?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-rule/15 last:border-b-0">
      {stamped !== undefined ? (
        <div className="scale-[0.55] -ml-2">
          <Stamp label={description} earned={stamped} />
        </div>
      ) : (
        <span className="w-11 shrink-0" />
      )}
      <span className="font-mono text-xs text-muted w-14 shrink-0">{date}</span>
      <span className={`font-body text-sm flex-1 ${muted ? "text-muted" : "text-ink"}`}>
        {description}
      </span>
      {amount && (
        <span className={`font-mono tabular-nums text-sm ${negative ? "text-loss" : "text-gain"}`}>
          {amount}
        </span>
      )}
    </div>
  );
}
