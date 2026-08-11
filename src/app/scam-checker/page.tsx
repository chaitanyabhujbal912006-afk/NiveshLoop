import Link from "next/link";
import { ScamChecker } from "@/components/ScamChecker";

export const metadata = {
  title: "SEBI Scam & Tip Checker — NiveshLoop",
  description: "Scan stock tips and WhatsApp forwards against SEBI fraud advisories.",
};

export default function ScamCheckerPage() {
  return (
    <div className="min-h-screen bg-paper py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="font-mono text-xs text-muted hover:text-ink transition-colors uppercase tracking-widest"
        >
          ← Home
        </Link>
        <Link
          href="/dashboard"
          className="font-mono text-xs text-stamp hover:underline uppercase tracking-widest"
        >
          Dashboard →
        </Link>
      </div>

      <ScamChecker />

      <div className="max-w-3xl mx-auto mt-8 text-center">
        <p className="font-mono text-[9px] text-muted uppercase tracking-widest">
          Simulated Educational Tool · Based on SEBI Public Fraud Advisories · Not Personal Advice
        </p>
      </div>
    </div>
  );
}
