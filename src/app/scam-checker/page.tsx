import Link from "next/link";
import { ScamChecker } from "@/components/ScamChecker";

export const metadata = {
  title: "SEBI Scam & Tip Checker — NiveshLoop",
  description: "Scan stock tips and WhatsApp forwards against SEBI fraud advisories.",
};

export default function ScamCheckerPage() {
  return (
    <div className="min-h-screen bg-parchment-base grid-bg bg-grid-pattern relative py-12 px-4 sm:px-8">
      {/* Background watermark */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 z-0 text-watermark font-display pointer-events-none select-none">
        सुरक्षा
      </div>
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
