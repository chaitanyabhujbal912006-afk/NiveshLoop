export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-body text-sm uppercase tracking-widest text-muted mb-4">
        Free · No ads · Simulated money only
      </p>

      <h1 className="font-display text-5xl leading-tight text-primary-dark mb-6">
        Learn to invest by actually investing —{" "}
        <span className="text-accent">with money that isn't real.</span>
      </h1>

      <p className="text-lg text-foreground/80 mb-12 max-w-xl">
        Most places teach you the theory, then leave you to figure out the doing.
        NiveshLoop connects the two: every lesson ends with a real simulated trade,
        and every few trades, we show you the patterns in how you're actually
        investing — not just your returns.
      </p>

      {/* Signature element: the loop itself, since it's the whole product thesis */}
      <div className="flex items-center gap-3 mb-14 font-display text-lg">
        <LoopStep label="Learn" />
        <Arrow />
        <LoopStep label="Simulate" />
        <Arrow />
        <LoopStep label="Reflect" />
        <Arrow />
        <span className="text-muted text-sm font-body">back to Learn</span>
      </div>

      <a
        href="/signup"
        className="inline-block bg-primary text-background px-6 py-3 rounded-sm font-body font-medium hover:bg-primary-dark transition-colors"
      >
        Start with ₹1,00,000 in fake money
      </a>

      <p className="mt-6 text-sm text-muted max-w-md">
        Simulated portfolio only. Prices are delayed ~15 minutes and sourced for
        educational use. Nothing here is investment advice.
      </p>
    </main>
  );
}

function LoopStep({ label }: { label: string }) {
  return (
    <div className="border border-primary/30 rounded-sm px-4 py-2 text-primary-dark">
      {label}
    </div>
  );
}

function Arrow() {
  return <span className="text-muted">→</span>;
}
