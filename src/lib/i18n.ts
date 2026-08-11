/**
 * Regional Language i18n Dictionary & Helper
 * Supports English (en) and Hindi (hi) for Indian Stock Market beginners.
 */

export type Language = "en" | "hi";

export interface Translations {
  appName: string;
  tagline: string;
  openPassbook: string;
  signIn: string;
  curriculum: string;
  dashboard: string;
  simulatedPortfolio: string;
  cashBalance: string;
  portfolioValue: string;
  totalPnl: string;
  holdings: string;
  positions: string;
  trade: string;
  insights: string;
  scamChecker: string;
  startForFree: string;
  learnTradeReflect: string;
  virtualMoneyDesc: string;
  disclaimer: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: "NiveshLoop",
    tagline: "Learn. Trade. Reflect.",
    openPassbook: "Open passbook →",
    signIn: "Sign in",
    curriculum: "Curriculum",
    dashboard: "Dashboard",
    simulatedPortfolio: "Simulated Portfolio",
    cashBalance: "Cash Balance",
    portfolioValue: "Portfolio Value",
    totalPnl: "Total P&L",
    holdings: "Holdings",
    positions: "positions",
    trade: "Trade",
    insights: "Insights",
    scamChecker: "Scam Checker",
    startForFree: "Start for free →",
    learnTradeReflect: "Learn. Trade. Reflect.",
    virtualMoneyDesc: "₹1,00,000 in virtual cash. No real money, ever.",
    disclaimer: "Simulated portfolio · Delayed prices · Educational use only",
  },
  hi: {
    appName: "NiveshLoop (निवेशलूप)",
    tagline: "सीखें. ट्रेड करें. समझें.",
    openPassbook: "पासबुक खोलें →",
    signIn: "साइन इन करें",
    curriculum: "पाठ्यक्रम (Curriculum)",
    dashboard: "डैशबोर्ड (Dashboard)",
    simulatedPortfolio: "सिम्युलेटेड पोर्टफोलियो",
    cashBalance: "नकद शेष (Cash Balance)",
    portfolioValue: "पोर्टफोलियो मूल्य",
    totalPnl: "कुल लाभ/हानि (P&L)",
    holdings: "होल्डिंग्स (Holdings)",
    positions: "पोज़िशन्स",
    trade: "ट्रेड करें",
    insights: "व्यवहार अंतर्दृष्टि (Insights)",
    scamChecker: "स्कैम चेकर (Scam Checker)",
    startForFree: "मुफ़्त शुरू करें →",
    learnTradeReflect: "सीखें. ट्रेड करें. समझें.",
    virtualMoneyDesc: "₹1,00,000 मुफ़्त वर्चुअल कैश. वास्तविक पैसा कभी नहीं.",
    disclaimer: "सिम्युलेटेड पोर्टफोलियो · विलंबित दरें · केवल शैक्षिक उपयोग",
  },
};

const LANGUAGE_KEY = "niveshloop_lang";

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return stored === "hi" ? "hi" : "en";
}

export function setStoredLanguage(lang: Language) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_KEY, lang);
}
