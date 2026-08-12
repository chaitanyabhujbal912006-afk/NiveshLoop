"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { FeatureSandbox } from "@/components/FeatureSandbox";
import { MoneyVaultWidget } from "@/components/MoneyVaultWidget";
import { LanguageToggle } from "@/components/LanguageToggle";
import { TRANSLATIONS, getStoredLanguage, type Language } from "@/lib/i18n";

/* ─── Ticker data ────────────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  { sym: "TCS.NS", val: "₹3,845.20", chg: "+1.2%", up: true },
  { sym: "INFY.NS", val: "₹1,542.75", chg: "-0.8%", up: false },
  { sym: "RELIANCE.NS", val: "₹2,967.40", chg: "+2.1%", up: true },
  { sym: "HDFC.NS", val: "₹1,673.60", chg: "+0.4%", up: true },
  { sym: "WIPRO.NS", val: "₹456.30", chg: "-1.3%", up: false },
  { sym: "BAJFINANCE.NS", val: "₹6,721.50", chg: "+3.2%", up: true },
  { sym: "NIFTY 50", val: "22,147.90", chg: "+0.6%", up: true },
  { sym: "SENSEX", val: "73,212.40", chg: "+0.7%", up: true },
];

/* ─── Demo passbook rows ─────────────────────────────────────────────────── */
const DEMO_ROWS = [
  { date: "01 Aug", code: "L-01", text: "Lesson — What is a stock?",           amount: null,      sign: null, type: "lesson"  },
  { date: "01 Aug", code: "T-01", text: "Bought 5 × TCS.NS",                  amount: "₹19,275", sign: "−",  type: "trade"   },
  { date: "08 Aug", code: "L-05", text: "Lesson — Stop-losses",                amount: null,      sign: null, type: "lesson"  },
  { date: "09 Aug", code: "T-04", text: "Bought 3 × INFY.NS · stop-loss set", amount: "₹42,660", sign: "−",  type: "trade"   },
  { date: "14 Aug", code: "T-07", text: "Sold 2 × TCS.NS · cooled down",      amount: "₹8,364",  sign: "+",  type: "trade"   },
  { date: "15 Aug", code: "R-02", text: "Reflection — 3 panic exits found",   amount: null,      sign: null, type: "insight" },
  { date: "20 Aug", code: "L-09", text: "Lesson — Diversification",            amount: null,      sign: null, type: "lesson"  },
  { date: "21 Aug", code: "T-11", text: "Bought HDFC.NS + WIPRO.NS",          amount: "₹31,900", sign: "−",  type: "trade"   },
];

/* ─── Candlestick visual — hero accent ──────────────────────────────────── */
function CandlestickVisual() {
  // A static but tasteful candlestick chart illustration for the hero
  const candles = [
    { open: 62, close: 78, low: 55, high: 84, up: true },
    { open: 78, close: 70, low: 65, high: 82, up: false },
    { open: 70, close: 85, low: 66, high: 90, up: true },
    { open: 85, close: 80, low: 74, high: 88, up: false },
    { open: 80, close: 92, low: 76, high: 96, up: true },
    { open: 92, close: 88, low: 82, high: 95, up: false },
    { open: 88, close: 100, low: 84, high: 104, up: true },
    { open: 100, close: 94, low: 88, high: 106, up: false },
    { open: 94, close: 110, low: 90, high: 115, up: true },
  ];
  const maxH = 120;
  const W = 180;
  const candleW = 14;
  const gap = 6;

  return (
    <svg
      viewBox={`0 0 ${W} ${maxH + 20}`}
      className="w-full h-full"
      aria-hidden
      style={{ overflow: "visible" }}
    >
      {candles.map((c, i) => {
        const x = i * (candleW + gap) + 4;
        const scale = maxH / 120;
        const bodyTop = Math.min(c.open, c.close) * scale;
        const bodyH = Math.abs(c.close - c.open) * scale;
        const wickTop = c.low * scale;
        const wickBot = c.high * scale;
        const color = c.up ? "#2F6B4F" : "#8C2F39";
        const yOff = maxH;
        return (
          <g key={i}>
            {/* wick */}
            <line
              x1={x + candleW / 2} y1={yOff - wickBot}
              x2={x + candleW / 2} y2={yOff - wickTop}
              stroke={color} strokeWidth={1.5} opacity={0.6}
            />
            {/* body */}
            <rect
              x={x} y={yOff - bodyTop - bodyH}
              width={candleW} height={Math.max(bodyH, 2)}
              fill={color} opacity={c.up ? 0.75 : 0.6}
              rx={1}
            />
          </g>
        );
      })}
      {/* moving average line */}
      <polyline
        points={candles.map((c, i) => {
          const x = i * (candleW + gap) + 4 + candleW / 2;
          const y = maxH - ((c.open + c.close) / 2) * (maxH / 120);
          return `${x},${y}`;
        }).join(" ")}
        fill="none"
        stroke="#5C7A63"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        opacity={0.5}
      />
    </svg>
  );
}

/* ─── Canvas price chart background ─────────────────────────────────────── */
function PriceChartCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Local vars capture the non-null refs for use inside closures
    const c = canvas;
    const x2d = ctx;

    let animFrame: number;
    let t = 0;

    const lines = [
      { color: "rgba(47,107,79,0.35)",  baseY: 0.55, amp: 0.12, freq: 0.018, phase: 0 },
      { color: "rgba(140,47,57,0.25)",  baseY: 0.65, amp: 0.09, freq: 0.022, phase: 1.4 },
      { color: "rgba(92,122,99,0.18)",  baseY: 0.45, amp: 0.07, freq: 0.013, phase: 2.8 },
    ];

    function resize() {
      c.width = c.offsetWidth * window.devicePixelRatio;
      c.height = c.offsetHeight * window.devicePixelRatio;
      x2d.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function draw() {
      const W = c.offsetWidth;
      const H = c.offsetHeight;
      x2d.clearRect(0, 0, W, H);

      lines.forEach(line => {
        const pts: [number, number][] = [];
        for (let x = 0; x <= W; x += 4) {
          const noise = Math.sin(x * line.freq + t + line.phase) * line.amp
                      + Math.sin(x * line.freq * 2.3 + t * 1.4 + line.phase) * (line.amp * 0.4)
                      + Math.sin(x * line.freq * 0.4 + t * 0.7 + line.phase) * (line.amp * 0.6);
          pts.push([x, H * (line.baseY + noise)]);
        }

        // Area fill
        x2d.beginPath();
        x2d.moveTo(0, H);
        pts.forEach(([px, py]) => x2d.lineTo(px, py));
        x2d.lineTo(W, H);
        x2d.closePath();
        const grad = x2d.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, line.color);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        x2d.fillStyle = grad;
        x2d.fill();

        // Line
        x2d.beginPath();
        pts.forEach(([px, py], i) => i === 0 ? x2d.moveTo(px, py) : x2d.lineTo(px, py));
        x2d.strokeStyle = line.color.replace("0.35", "0.7").replace("0.25", "0.55").replace("0.18", "0.4");
        x2d.lineWidth = 1.5;
        x2d.stroke();
      });

      // Ledger grid lines
      x2d.setLineDash([4, 8]);
      x2d.strokeStyle = "rgba(92,122,99,0.08)";
      x2d.lineWidth = 1;
      for (let y = 0; y < H; y += 48) {
        x2d.beginPath();
        x2d.moveTo(0, y);
        x2d.lineTo(W, y);
        x2d.stroke();
      }
      x2d.setLineDash([]);

      t += 0.006;
      animFrame = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden />;
}

/* ─── 3D Passbook ────────────────────────────────────────────────────────── */
function PassbookWidget() {
  const [hovering, setHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setMousePos({ x, y });
  }

  return (
    <div
      ref={ref}
      className="relative cursor-default"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setMousePos({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        animate={{
          rotateY: hovering ? mousePos.x : -2,
          rotateX: hovering ? mousePos.y : 1.5,
        }}
        transition={{ type: "spring", stiffness: 180, damping: 28 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Shadow layers — depth illusion */}
        <div className="absolute inset-0 translate-x-4 translate-y-4 bg-ink/10 rounded-sm blur-xl" />
        <div className="absolute inset-0 translate-x-2 translate-y-2"
          style={{ background: "rgba(30,42,68,0.06)", transform: "translate(10px,10px) scaleX(0.98)" }}
        />

        {/* Page stack behind */}
        {[3, 2, 1].map(n => (
          <div key={n}
            className="absolute inset-0 border border-rule/20"
            style={{
              background: `rgba(233,239,231,${0.5 + n * 0.1})`,
              transform: `translate(${n * 4}px, ${n * 3}px)`,
              zIndex: -n,
            }}
          />
        ))}

        {/* Main passbook body */}
        <div
          className="relative border border-rule/40 bg-paper overflow-hidden"
          style={{
            boxShadow: `
              -4px 0 0 #8C2F39,
              0 0 0 1px rgba(92,122,99,0.2),
              0 32px 64px rgba(30,42,68,0.22),
              0 8px 24px rgba(30,42,68,0.12)
            `,
            minWidth: 340,
          }}
        >
          {/* Ledger lines texture on passbook */}
          <div className="absolute inset-0 ledger-bg opacity-60 pointer-events-none" />

          {/* Red binding spine */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-stamp via-stamp/90 to-stamp" />

          {/* Paper grain */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Header */}
          <div className="ml-1 px-5 pt-5 pb-4 border-b-2 border-rule/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-muted/70 mb-1">NiveshLoop · Simulated Portfolio</p>
                <p className="font-display text-lg font-semibold text-ink leading-tight">Savings Passbook</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[8px] text-muted/60 mb-0.5">Page 01</p>
                <p className="font-mono text-[8px] text-muted/60">A/C: DEMO-001</p>
                {/* Tiny watermark stamp */}
                <div className="mt-1 inline-flex items-center gap-1 border border-stamp/30 px-1.5 py-0.5">
                  <span className="font-mono text-[6px] uppercase tracking-widest text-stamp/60">Simulated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column headers */}
          <div className="ml-1 grid grid-cols-[2.4rem_3.2rem_1fr_auto] px-5 py-2 border-b border-rule/15 bg-rule/[0.035]">
            {["", "REF", "PARTICULARS", "AMOUNT"].map(h => (
              <span key={h} className="font-mono text-[7px] uppercase tracking-[0.22em] text-muted/60">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="ml-1 px-5 pb-3">
            {DEMO_ROWS.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className={[
                  "grid items-center grid-cols-[2.4rem_3.2rem_1fr_auto] py-2.5 border-b border-rule/10 last:border-0",
                  row.type === "insight" ? "opacity-55" : "",
                ].join(" ")}
              >
                {/* Status indicator */}
                <div className="flex items-center justify-start h-6 w-6">
                  {row.type === "lesson" ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 -rotate-[5deg]" aria-hidden>
                      <defs>
                        <filter id={`ink-${i}`}>
                          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" result="noise" />
                          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
                        </filter>
                      </defs>
                      <circle cx="12" cy="12" r="9" fill="none" stroke="#8C2F39" strokeWidth="1.5" filter={`url(#ink-${i})`} />
                      <path d="M7.5 12 L10.5 15 L16.5 9" fill="none" stroke="#8C2F39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter={`url(#ink-${i})`} />
                    </svg>
                  ) : row.type === "insight" ? (
                    <span className="font-mono text-[7px] text-muted border border-rule/40 px-1 py-px">↻</span>
                  ) : (
                    <span className={`h-2 w-2 rounded-full block ${row.sign === "+" ? "bg-gain" : "bg-loss"}`} style={{ boxShadow: row.sign === "+" ? "0 0 6px rgba(47,107,79,0.5)" : "0 0 6px rgba(166,73,63,0.5)" }} />
                  )}
                </div>

                <span className="font-mono text-[8px] text-muted/60 tabular-nums">{row.code}</span>
                <span className="font-body text-[11px] text-ink truncate pr-2">{row.text}</span>
                {row.amount ? (
                  <span className={`font-mono tabular-nums text-[11px] font-semibold text-right ${row.sign === "+" ? "text-gain" : "text-loss"}`}>
                    {row.sign}{row.amount}
                  </span>
                ) : <span />}
              </motion.div>
            ))}
          </div>

          {/* Balance footer */}
          <div className="ml-1 border-t-2 border-rule/25 px-5 py-3 flex justify-between items-center bg-rule/[0.04]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted">Closing balance</span>
            <span className="font-mono tabular-nums text-base font-semibold text-ink" style={{ textShadow: "0 0 20px rgba(47,107,79,0.15)" }}>
              ₹52,015.00
            </span>
          </div>

          {/* Diagonal watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
            <svg viewBox="0 0 320 200" className="w-full opacity-[0.028]">
              <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle"
                fontFamily="Fraunces" fontSize="52" fontWeight="700" fill="#8C2F39"
                transform="rotate(-22, 160, 100)" letterSpacing="6">
                SIMULATED
              </text>
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Live blink dot ─────────────────────────────────────────────────────── */
function LiveDot({ color = "#2F6B4F" }: { color?: string }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
        style={{ background: color, animationDuration: "1.8s" }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
    </span>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(233,239,231,0)", "rgba(233,239,231,0.96)"]);
  const navBorder = useTransform(scrollY, [0, 80], ["rgba(92,122,99,0)", "rgba(92,122,99,0.2)"]);

  useEffect(() => {
    setMounted(true);
    setLang(getStoredLanguage());

    function handleLangChange(e: Event) {
      const newLang = (e as CustomEvent<Language>).detail;
      setLang(newLang);
    }
    window.addEventListener("niveshloop_lang_changed", handleLangChange);
    return () => window.removeEventListener("niveshloop_lang_changed", handleLangChange);
  }, []);

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-parchment-base grid-bg bg-grid-pattern text-on-background overflow-x-hidden flex flex-col relative">
      {/* Rotated Background Watermark */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 z-0 text-watermark font-display pointer-events-none">
        निवेशलूप
      </div>

      {/* ══ TOP TICKER BAR ════════════════════════════════════════════════ */}
      <div className="w-full bg-ink text-paper font-mono text-xs py-1.5 overflow-hidden relative z-50 border-b-2 border-stamp shadow-sm">
        <div className="flex whitespace-nowrap animate-ticker">
          <span className="mx-6 flex items-center gap-1.5">BSE SENSEX 73,730.16 <span className="text-loss font-semibold">▼ -0.5%</span></span>
          <span className="mx-6 flex items-center gap-1.5">NIFTY 50 22,419.95 <span className="text-gain font-semibold">▲ +0.2%</span></span>
          <span className="mx-6 flex items-center gap-1.5">RELIANCE 2,930.50 <span className="text-loss font-semibold">▼ -1.2%</span></span>
          <span className="mx-6 flex items-center gap-1.5">TCS 3,845.00 <span className="text-gain font-semibold">▲ +0.8%</span></span>
          <span className="mx-6 flex items-center gap-1.5">HDFC BANK 1,530.20 <span className="text-loss font-semibold">▼ -0.3%</span></span>
          {/* Infinite loop copy */}
          <span className="mx-6 flex items-center gap-1.5">BSE SENSEX 73,730.16 <span className="text-loss font-semibold">▼ -0.5%</span></span>
          <span className="mx-6 flex items-center gap-1.5">NIFTY 50 22,419.95 <span className="text-gain font-semibold">▲ +0.2%</span></span>
          <span className="mx-6 flex items-center gap-1.5">RELIANCE 2,930.50 <span className="text-loss font-semibold">▼ -1.2%</span></span>
          <span className="mx-6 flex items-center gap-1.5">TCS 3,845.00 <span className="text-gain font-semibold">▲ +0.8%</span></span>
          <span className="mx-6 flex items-center gap-1.5">HDFC BANK 1,530.20 <span className="text-loss font-semibold">▼ -0.3%</span></span>
        </div>
      </div>

      {/* ══ NAV BAR ══════════════════════════════════════════════════════ */}
      <motion.nav
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="sticky top-0 inset-x-0 z-40 border-b-2 border-ink shadow-md backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex justify-between items-center h-16">
          <Link href="/" className="font-display text-ink font-bold text-2xl tracking-tight flex items-center gap-1">
            Nivesh<span className="text-stamp">Loop</span>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            <Link href="/lessons" className="text-ink font-mono text-xs uppercase tracking-widest hover:text-stamp hover:-translate-y-0.5 transition-all">
              Curriculum
            </Link>
            <Link href="/dashboard" className="text-ink font-mono text-xs uppercase tracking-widest hover:text-stamp hover:-translate-y-0.5 transition-all">
              Dashboard
            </Link>
            <Link href="/scam-checker" className="text-ink font-mono text-xs uppercase tracking-widest hover:text-stamp hover:-translate-y-0.5 transition-all">
              Scam Checker
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link href="/login"
              className="font-mono text-xs text-muted hover:text-ink transition-colors uppercase tracking-widest px-3 py-2">
              {t.signIn}
            </Link>
            <Link href="/signup"
              className="font-mono text-xs font-bold bg-stamp text-paper px-5 py-2.5 hover:opacity-90 transition-opacity uppercase tracking-widest inline-flex items-center gap-2 shadow-sm">
              {t.openPassbook}
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ══ HERO — full screen, canvas BG, 3D passbook ════════════════ */}
      <section className="relative min-h-[85vh] flex flex-col justify-center pt-8 overflow-hidden z-10">
        {/* Rich layered background */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 120% 90% at 65% 40%, rgba(140,47,57,0.06) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 20% 70%, rgba(47,107,79,0.05) 0%, transparent 60%)" }} />
        <PriceChartCanvas />

        {/* Ledger lines over canvas */}
        <div className="absolute inset-0 ledger-bg opacity-40 pointer-events-none" />

        {/* Deep vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(233,239,231,0.7) 100%)" }}
        />

        {/* Left edge stamp spine decoration */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-stamp/0 via-stamp to-stamp/0" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-16 items-center w-full py-20">

          {/* Left: headline */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-3 mb-10"
            >
              <LiveDot />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
                {lang === "hi" ? "शुरुआती लोगों के लिए · भारतीय बाज़ार · मुफ़्त" : "For beginners · Indian markets · Free"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`font-display text-ink mb-8 selection:bg-stamp/20 ${lang === "hi" ? "display-xl" : "display-giant"}`}
              style={{ textShadow: "0 2px 40px rgba(30,42,68,0.06)" }}
            >
              {lang === "hi" ? (
                <>
                  सीखें.<br />
                  <span className="italic">ट्रेड करें.</span><br />
                  <span className="text-stamp ink-underline">समझें.</span>
                </>
              ) : (
                <>
                  Learn.<br />
                  <span className="italic">Trade.</span><br />
                  <span className="text-stamp ink-underline">Reflect.</span>
                </>
              )}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="border-l-[3px] border-stamp/50 pl-5 mb-12"
            >
              <p className="font-body text-lg text-ink/75 leading-relaxed max-w-[440px]">
                {lang === "hi" ? (
                  <>
                    एकमात्र ऐसा ऐप जो हर पाठ को सीधे एक{" "}
                    <strong className="font-semibold text-ink">सिम्युलेटेड ट्रेड</strong> से
                    जोड़ता है — फिर पासबुक वापस देकर दिखाता है कि आप{" "}
                    <strong className="font-semibold text-ink">वास्तव में</strong> कैसे निवेश कर रहे हैं।
                  </>
                ) : (
                  <>
                    The only investing app that connects every lesson directly to a{" "}
                    <strong className="font-semibold text-ink">simulated trade</strong> —
                    then hands the passbook back and shows you the pattern
                    in how you&apos;re <strong className="font-semibold text-ink">actually</strong> investing.
                  </>
                )}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-4 bg-stamp text-paper font-body font-semibold text-base px-10 py-5 hover:opacity-90 active:scale-[0.99] transition-all duration-100"
                style={{ boxShadow: "0 8px 32px rgba(140,47,57,0.28), 0 2px 8px rgba(140,47,57,0.15)" }}
              >
                {lang === "hi" ? "अपनी पासबुक खोलें" : "Open your passbook"}
                <span className="font-mono text-sm opacity-70 border-l border-paper/30 pl-4">{t.virtualMoneyDesc.split(".")[0]}</span>
              </Link>

              {/* Stat pills */}
              <div className="mt-10 flex flex-wrap gap-6">
                {[
                  { v: "₹0", l: lang === "hi" ? "वास्तविक पैसा नहीं" : "real money needed" },
                  { v: "15",   l: lang === "hi" ? "पाठ" : "lessons" },
                  { v: lang === "hi" ? "मुफ़्त" : "Free", l: lang === "hi" ? "हमेशा, कोई विज्ञापन नहीं" : "forever, no ads" },
                  { v: "100%", l: lang === "hi" ? "सिम्युलेटेड" : "simulated" },
                ].map(({ v, l }) => (
                  <div key={l} className="flex flex-col">
                    <span className="font-mono tabular-nums text-3xl font-semibold text-ink leading-none">{v}</span>
                    <span className="font-mono text-[10px] text-muted uppercase tracking-widest mt-1.5">{l}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: 3D Passbook + Candlestick accent */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 3 }}
            animate={mounted ? { opacity: 1, y: 0, rotate: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:self-center w-full"
          >
            <PassbookWidget />

            {/* Candlestick accent below passbook on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={mounted ? { opacity: 0.6, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="hidden lg:block mt-6 px-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[8px] uppercase tracking-widest text-muted/50">Simulated price chart</span>
                <span className="flex-1 h-px bg-rule/20" />
              </div>
              <div className="h-20">
                <CandlestickVisual />
              </div>
              <p className="font-mono text-[7px] text-muted/30 mt-1">Delayed prices · Educational only</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ delay: 1.4 }}
          className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted/40">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-rule/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* ══ LIVE TICKER ══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-ink border-y border-white/5 py-4">
        {/* Fade edges */}
        <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />

        <div className="ticker-track" aria-hidden>
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-8 shrink-0">
              <span className="font-mono text-[11px] font-medium text-paper/80 uppercase tracking-wider">{item.sym}</span>
              <span className="font-mono text-[11px] tabular-nums text-paper/60">{item.val}</span>
              <span className={`font-mono text-[11px] tabular-nums font-semibold ${item.up ? "text-gain" : "text-loss"}`}>
                {item.chg}
              </span>
              <span className="w-px h-4 bg-rule/30 mx-2" />
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 2 — THE PROBLEM ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 lg:gap-20 items-start">
          {/* Left Column: Money Vault Widget */}
          <div className="hidden lg:block sticky top-24">
            <MoneyVaultWidget />
          </div>

          <div>
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted mb-6"
            >
              § 02 — The problem
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.65 }}
              className="font-display display-xl text-ink mb-16"
            >
              Every other app teaches<br />
              <span className="italic text-muted/60">without making you do.</span>
            </motion.h2>

            <div className="space-y-0 border-t border-rule/20">
              {[
                { n: "01", title: "Articles & videos",    body: "Perfect theory. But when you close the tab — nothing changes. You still don't know what you'd do with ₹50,000 on a volatile Monday." },
                { n: "02", title: "Paper-trading apps",   body: "Let you trade without context. No lesson connected to the order form. You can buy HDFC without knowing what HDFC is." },
                { n: "03", title: "Real money, too fast", body: "Most beginners who open a Zerodha account lose money in the first month. The gap between reading and doing is real and it's expensive." },
              ].map((item, i) => (
                <motion.div
                  key={item.n}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="grid grid-cols-[4.5rem_1fr] gap-8 py-10 border-b border-rule/15 group cursor-default"
                >
                  <span className="font-mono text-6xl font-semibold tabular-nums leading-none text-rule/15 group-hover:text-rule/30 transition-colors mt-1">
                    {item.n}
                  </span>
                  <div>
                    <p className="font-display text-2xl font-semibold text-ink mb-3">{item.title}</p>
                    <p className="font-body text-base text-ink/60 leading-relaxed max-w-2xl">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 3 — HOW IT WORKS (dark, full bleed) ═══════════════ */}
      <section className="relative bg-ink overflow-hidden">
        {/* Torn paper edges */}
        <div className="torn-top h-8 bg-paper absolute top-0 inset-x-0 z-10" />
        <div className="torn-bottom h-8 bg-paper absolute bottom-0 inset-x-0 z-10" />

        {/* Rich gradient background */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 60% at 15% 50%, rgba(140,47,57,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 85% 40%, rgba(47,107,79,0.10) 0%, transparent 60%)"
        }} />

        {/* Ledger lines */}
        <div className="absolute inset-0"
          style={{ backgroundImage: "repeating-linear-gradient(transparent,transparent 47px,rgba(92,122,99,0.07) 47px,rgba(92,122,99,0.07) 48px)" }}
        />

        <div className="relative z-0 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-24">
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex items-end mb-12 border-b-2 border-paper/20 pb-4"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-paper -rotate-1">
              The Audit Loop
            </h2>
            <span className="font-mono text-xs text-stamp ml-4 mb-1 tracking-widest">// STANDARD PROCEDURE V.1</span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {[
              {
                n: "01", head: "Read the lesson",
                body: "4 minutes. One focused concept, explained plainly — no jargon, no assumed knowledge.",
                accent: "#5C7A63",
                icon: (
                  <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" aria-hidden>
                    <rect x="6" y="8" width="24" height="32" rx="2" stroke="#5C7A63" strokeWidth="1.8" fill="rgba(92,122,99,0.08)"/>
                    <rect x="18" y="8" width="24" height="32" rx="2" stroke="#5C7A63" strokeWidth="1.8" fill="rgba(92,122,99,0.12)"/>
                    <line x1="22" y1="18" x2="36" y2="18" stroke="#5C7A63" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="22" y1="23" x2="36" y2="23" stroke="#5C7A63" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="22" y1="28" x2="30" y2="28" stroke="#5C7A63" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                )
              },
              {
                n: "02", head: "Execute a trade",
                body: "The lesson ends with a live order form connected to your ₹1,00,000 simulated portfolio. Real delayed prices.",
                accent: "#8C2F39",
                icon: (
                  <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" aria-hidden>
                    <polyline points="6,38 16,26 24,30 38,10" stroke="#8C2F39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="38" cy="10" r="3" fill="#8C2F39" opacity="0.8"/>
                    <rect x="6" y="36" width="8" height="6" rx="1" fill="rgba(140,47,57,0.2)" stroke="#8C2F39" strokeWidth="1.2"/>
                    <rect x="20" y="28" width="8" height="14" rx="1" fill="rgba(140,47,57,0.15)" stroke="#8C2F39" strokeWidth="1.2"/>
                    <rect x="34" y="20" width="8" height="22" rx="1" fill="rgba(140,47,57,0.25)" stroke="#8C2F39" strokeWidth="1.2"/>
                  </svg>
                )
              },
              {
                n: "03", head: "See your pattern",
                body: "After 8–10 trades, the passbook opens: your behavior in plain words. Never a recommendation. Just a mirror.",
                accent: "#2F6B4F",
                icon: (
                  <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" aria-hidden>
                    <ellipse cx="24" cy="24" rx="14" ry="18" stroke="#2F6B4F" strokeWidth="1.8" fill="rgba(47,107,79,0.08)"/>
                    <ellipse cx="24" cy="24" rx="7" ry="9" stroke="#2F6B4F" strokeWidth="1.4" fill="rgba(47,107,79,0.12)"/>
                    <circle cx="24" cy="24" r="3" fill="#2F6B4F" opacity="0.6"/>
                    <line x1="10" y1="8" x2="38" y2="40" stroke="#2F6B4F" strokeWidth="1" opacity="0.25" strokeDasharray="3 3"/>
                  </svg>
                )
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.15 }}
                className="relative p-8 border group cursor-default"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
                  borderColor: `${step.accent}25`,
                  boxShadow: `0 0 0 1px ${step.accent}12, inset 0 1px 0 rgba(255,255,255,0.04)`,
                }}
              >
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: `${step.accent}80` }}>{step.n}</span>
                  <div className="h-px flex-1 mx-4" style={{ background: `linear-gradient(to right, ${step.accent}30, transparent)` }} />
                </div>

                {/* SVG icon */}
                <div className="mb-5">{step.icon}</div>

                <p className="font-display text-xl font-semibold mb-3" style={{ color: step.accent }}>{step.head}</p>
                <p className="font-body text-sm text-paper/50 leading-relaxed">{step.body}</p>

                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b"
                  style={{ background: `linear-gradient(to right, ${step.accent}, transparent)` }}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex items-center justify-center gap-6"
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-rule/20" />
            <span className="font-mono text-[10px] text-paper/20 uppercase tracking-widest">↺ then back to 01</span>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-rule/20" />
          </motion.div>
        </div>
      </section>

      {/* ══ SECTION 4 — FEATURES CARDS ═════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted mb-3">§ 04 — What makes it different</p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="font-display display-lg text-ink"
            >
              Designed against<br /><span className="italic text-muted/60">bad investing habits.</span>
            </motion.h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              feat: "Lesson → Trade, directly",
              why: "The form changes as you learn. Complete the stop-loss lesson — stop-loss field appears. The UI proves you learned.",
              color: "#5C7A63",
              icon: (
                <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" aria-hidden>
                  <path d="M4 16h8l4-8 4 16 4-8h4" stroke="#5C7A63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            },
            {
              feat: "10-second cooldown nudge",
              why: "Panic-selling? A breath screen appears. Not a block — just a pause. The button still works.",
              color: "#8C2F39",
              icon: (
                <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" aria-hidden>
                  <circle cx="16" cy="16" r="11" stroke="#8C2F39" strokeWidth="2"/>
                  <path d="M16 10v6l4 2" stroke="#8C2F39" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )
            },
            {
              feat: "Behavioral reflection",
              why: "After 8–10 trades: plain language describing your own patterns. No advice, just a mirror.",
              color: "#2F6B4F",
              icon: (
                <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" aria-hidden>
                  <path d="M8 4h10a6 6 0 010 12H8V4z" stroke="#2F6B4F" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M8 16h12a6 6 0 010 12H8V16z" stroke="#2F6B4F" strokeWidth="2" strokeLinejoin="round" opacity="0.5"/>
                </svg>
              )
            },
            {
              feat: "Progressive unlocks",
              why: "Market orders only at first. Limit orders, stop-losses, sector analysis unlock as lessons are completed.",
              color: "#7A5C2F",
              icon: (
                <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" aria-hidden>
                  <rect x="8" y="14" width="16" height="12" rx="2" stroke="#7A5C2F" strokeWidth="2"/>
                  <path d="M11 14v-4a5 5 0 0110 0v4" stroke="#7A5C2F" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="16" cy="20" r="1.5" fill="#7A5C2F"/>
                </svg>
              )
            },
            {
              feat: "Zero real money. Ever.",
              why: "No brokerage link, no UPI, no 'upgrade to trade real'. The virtual ₹1,00,000 is the entire point.",
              color: "#4F2F7A",
              icon: (
                <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" aria-hidden>
                  <circle cx="16" cy="16" r="11" stroke="#4F2F7A" strokeWidth="2"/>
                  <path d="M12 12l8 8M20 12l-8 8" stroke="#4F2F7A" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )
            },
            {
              feat: "No streak mechanics",
              why: "No 'come back or lose your streak'. Habits are celebrated, not daily engagement or profitable returns.",
              color: "#2F5A7A",
              icon: (
                <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" aria-hidden>
                  <path d="M16 6l2.5 5 5.5 0.8-4 3.9 0.9 5.5L16 18.5l-4.9 2.7 0.9-5.5-4-3.9 5.5-0.8z" stroke="#2F5A7A" strokeWidth="1.8" strokeLinejoin="round"/>
                  <line x1="6" y1="26" x2="26" y2="6" stroke="#2F5A7A" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )
            },
          ].map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group relative p-6 border border-rule/20 bg-paper hover:border-rule/40 transition-all duration-200 cursor-default"
              style={{ boxShadow: "0 2px 20px rgba(30,42,68,0.04)" }}
            >
              {/* Spine accent */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l" style={{ background: row.color, opacity: 0.6 }} />

              <div className="mb-4 flex items-center gap-3">
                <div className="p-2 rounded" style={{ background: `${row.color}10` }}>
                  {row.icon}
                </div>
              </div>

              <p className="font-display text-base font-semibold text-ink mb-2 group-hover:text-stamp transition-colors">{row.feat}</p>
              <p className="font-body text-sm text-ink/55 leading-relaxed">{row.why}</p>
            </motion.div>
          ))}
        </div>

        {/* Live Interactive Feature Sandbox */}
        <FeatureSandbox />
      </section>

      {/* ══ SECTION 5 — THE STAMP MOMENT ═════════════════════════════ */}
      <section className="relative overflow-hidden border-y border-rule/20">
        <div className="absolute inset-0 ledger-bg opacity-40" />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 80% at 20% 50%, rgba(140,47,57,0.04) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-28">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-16 items-center">

            {/* Giant stamp with ink filter */}
            <motion.div
              initial={{ scale: 1.8, opacity: 0, rotate: -18 }}
              whileInView={{ scale: 1, opacity: 1, rotate: -7 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: [0.25, 0, 0, 1] }}
              className="flex justify-center lg:justify-start"
            >
              <svg viewBox="0 0 220 220" className="h-56 w-56 sm:h-72 sm:w-72" aria-label="Lesson completed stamp">
                <defs>
                  <filter id="ink-bleed-hero">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
                  </filter>
                </defs>
                <g filter="url(#ink-bleed-hero)" opacity="0.92">
                  <circle cx="110" cy="110" r="98" fill="none" stroke="#8C2F39" strokeWidth="6" />
                  <circle cx="110" cy="110" r="88" fill="none" stroke="#8C2F39" strokeWidth="1.5" />
                  <circle cx="110" cy="110" r="84" fill="none" stroke="#8C2F39" strokeWidth="0.5" strokeDasharray="4 6" />
                  <path d="M72 110 L96 136 L150 80" fill="none" stroke="#8C2F39" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  <path id="topArcHero" d="M28,110 A82,82 0 0,1 192,110" fill="none" />
                  <text fontFamily="'Fraunces', serif" fontSize="12" fill="#8C2F39" letterSpacing="5">
                    <textPath href="#topArcHero" startOffset="14%">LESSON COMPLETED</textPath>
                  </text>
                  <path id="botArcHero" d="M192,110 A82,82 0 0,1 28,110" fill="none" />
                  <text fontFamily="'IBM Plex Mono', monospace" fontSize="9" fill="#8C2F39" letterSpacing="3.5">
                    <textPath href="#botArcHero" startOffset="16%">NIVESHLOOP · SIMULATED</textPath>
                  </text>
                </g>
              </svg>
            </motion.div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted mb-5">§ 05 — The stamp</p>
              <motion.h2
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="font-display display-lg text-ink mb-6"
              >
                Completion means<br />something here.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="font-body text-base text-ink/65 leading-relaxed max-w-lg mb-8"
              >
                When you finish a lesson, a stamp presses onto your passbook —
                slightly tilted, slightly imperfect, the way a real stamp always
                lands. It appears <strong className="text-ink font-semibold">exactly once</strong>. It marks
                the moment you did the reading. It <em>never</em> marks a profitable trade.
              </motion.p>

              {/* Three insight pills */}
              <div className="flex flex-wrap gap-3">
                {["Earned, not given", "Habit, not profit", "Once, not repeated"].map(t => (
                  <span key={t}
                    className="font-mono text-[10px] uppercase tracking-widest border border-stamp/25 text-stamp/70 px-3 py-1.5"
                  >{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 6 — HONESTY + FINAL CTA ══════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-32">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-20 items-start">

          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted mb-5">§ 06 — Honesty</p>
            <h2 className="font-display display-lg text-ink mb-10">
              This is a<br />
              <span className="italic text-muted/55">simulator.</span>
            </h2>

            <div className="border-t border-rule/20">
              {[
                "Simulated portfolio — not a brokerage account.",
                "Prices delayed ~15 minutes, not real-time.",
                "Nothing here is personalized financial advice.",
                "Insights describe your own past behavior only.",
                "Free, no ads, no upsell. Just free.",
              ].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-5 py-4 border-b border-rule/12 group"
                >
                  <span className="font-mono text-stamp/40 mt-0.5 shrink-0 text-lg group-hover:text-stamp/70 transition-colors">—</span>
                  <p className="font-body text-base text-ink/75">{line}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Final CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="relative overflow-hidden border border-rule/30 bg-paper"
            style={{ boxShadow: "8px 8px 0 rgba(92,122,99,0.1), 0 24px 64px rgba(30,42,68,0.08)" }}
          >
            {/* Ledger BG */}
            <div className="absolute inset-0 ledger-bg opacity-50" />
            {/* Stamp spine */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-stamp/80" />

            <div className="relative px-10 py-12">
              {/* Decorative stamp watermark */}
              <div className="absolute top-6 right-6 opacity-[0.06] pointer-events-none select-none" aria-hidden>
                <svg viewBox="0 0 120 120" className="h-20 w-20">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#8C2F39" strokeWidth="5" />
                  <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle"
                    fontFamily="Fraunces" fontSize="10" fill="#8C2F39" letterSpacing="3">SIMULATED</text>
                </svg>
              </div>

              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-7">
                {lang === "hi" ? "तैयार हैं?" : "Ready?"}
              </p>
              <h3 className="font-display text-6xl font-semibold text-ink leading-[0.95] mb-7">
                {lang === "hi" ? (
                  <>{"अपनी"}<br /><span className="text-stamp">पासबुक खोलें.</span></>
                ) : (
                  <>Open your<br /><span className="text-stamp">passbook.</span></>
                )}
              </h3>
              <p className="font-body text-sm text-ink/55 mb-10 leading-relaxed max-w-xs">
                {lang === "hi"
                  ? "₹1,00,000 वर्चुअल कैश। कोई क्रेडिट कार्ड नहीं। वास्तविक पैसा कभी नहीं। 15 पाठ।"
                  : "₹1,00,000 in virtual cash. No credit card. No real money, ever. 15 lessons. Starts today."}
              </p>
              <Link
                href="/signup"
                className="w-full flex items-center justify-center gap-3 bg-stamp text-paper font-body font-semibold text-base py-5 hover:opacity-90 transition-opacity"
                style={{ boxShadow: "0 8px 24px rgba(140,47,57,0.25)" }}
              >
                {t.startForFree}
              </Link>
              <p className="mt-5 font-mono text-[9px] text-muted text-center">
                {t.disclaimer}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="border-t border-rule/20 py-12 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <span className="font-display text-ink font-semibold text-xl tracking-tight">
              Nivesh<span className="text-stamp">Loop</span>
            </span>
            <p className="font-mono text-[10px] text-muted mt-1.5">{t.learnTradeReflect}</p>
          </div>
          <p className="font-mono text-[9px] text-muted uppercase tracking-widest max-w-md text-right leading-relaxed">
            {t.disclaimer}<br />
            {lang === "hi" ? "केवल शैक्षिक उपयोग · निवेश सलाह नहीं · ब्रोकरेज नहीं" : "Educational use only · Not investment advice · Not a brokerage"}
          </p>
        </div>
      </footer>
    </div>
  );
}
