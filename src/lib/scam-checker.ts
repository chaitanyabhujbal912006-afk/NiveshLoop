/**
 * SEBI Scam & Tip Checker Engine
 * Analyzes stock tips, WhatsApp/Telegram forwards, and SMS claims
 * against SEBI's published fraud & red-flag advisories.
 */

export interface RedFlag {
  id: string;
  category: "guaranteed_returns" | "unregistered_channel" | "fomo_urgency" | "pump_and_dump" | "fake_sebi_claim" | "secrecy";
  title: string;
  description: string;
  severity: "high" | "critical" | "medium";
  sebiReference: string;
  matchedText?: string;
}

export interface ScamAnalysisResult {
  riskScore: number; // 0 to 100
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  summary: string;
  flags: RedFlag[];
  recommendation: string;
  analyzedAt: string;
}

const RED_FLAG_RULES: {
  id: string;
  category: RedFlag["category"];
  title: string;
  description: string;
  severity: RedFlag["severity"];
  sebiReference: string;
  weight: number;
  patterns: RegExp[];
}[] = [
  {
    id: "guaranteed_returns",
    category: "guaranteed_returns",
    title: "Guaranteed or Fixed Returns Claim",
    description: "Equities inherently carry market risk. Promising guaranteed, fixed, or risk-free profits in stocks is illegal under SEBI regulations.",
    severity: "critical",
    sebiReference: "SEBI Prohibition of Fraudulent and Unfair Trade Practices (PFUTP) Regulations",
    weight: 35,
    patterns: [
      /guarantee(d|s)?\b/i,
      /fixed (profit|returns?|yield|income)\b/i,
      /zero risk\b/i,
      /risk[\s-]*free\b/i,
      /100%\s*(sure|safe|profit|return|win)\b/i,
      /sure shot\b/i,
      /jackpot (call|tip|stock)\b/i,
      /daily (profit|returns?|income|yield)\b/i,
      /double your (money|capital|investment)\b/i,
    ],
  },
  {
    id: "unregistered_channel",
    category: "unregistered_channel",
    title: "Unregistered Social Media / Messaging Channel",
    description: "SEBI mandates that stock recommendations can only be provided by SEBI-registered Research Analysts (RAs) or Investment Advisers (IAs).",
    severity: "high",
    sebiReference: "SEBI (Research Analysts) Regulations, 2014 & Public Notice on Unregistered Advisory",
    weight: 25,
    patterns: [
      /telegram (channel|group|link|vip|call)\b/i,
      /whatsapp (group|channel|tip|link)\b/i,
      /vip (group|channel|signals?|calls?)\b/i,
      /join (our|my) (group|channel)\b/i,
      /inside (info|information|tip|source)\b/i,
      /dm for (tips|calls|profits?)\b/i,
      /paid (calls?|group|service)\b/i,
    ],
  },
  {
    id: "fomo_urgency",
    category: "fomo_urgency",
    title: "Artificially Induced Urgency & FOMO",
    description: "Scammers create artificial panic to force quick decisions before investors can research company fundamentals.",
    severity: "medium",
    sebiReference: "SEBI Cautionary Advisory on Unfair Trading Practices",
    weight: 20,
    patterns: [
      /buy (now|today|fast|immediately|before 9:15)\b/i,
      /don'?t miss (this|out)\b/i,
      /upper circuit (tomorrow|guaranteed|target)\b/i,
      /once in a (lifetime|year) opportunity\b/i,
      /rocket stock\b/i,
      /multibagger (alert|confirm|today)\b/i,
      /limited (time|seats?|slots?)\b/i,
    ],
  },
  {
    id: "pump_and_dump",
    category: "pump_and_dump",
    title: "Classic Pump-and-Dump Language",
    description: "Promoters artificially inflate illiquid smallcap or penny stocks before dumping their shares on retail investors.",
    severity: "critical",
    sebiReference: "SEBI Orders on Bulk SMS & Social Media Stock Manipulation Scheme",
    weight: 30,
    patterns: [
      /target (10x|5x|1000%|500%)\b/i,
      /penny stock (rocket|jackpot|boom)\b/i,
      /operator (stock|game|entry|call)\b/i,
      /microcap (boom|secret)\b/i,
      /buy bulk (qty|shares)\b/i,
      /hidden (gem|jewel|stock)\b/i,
    ],
  },
  {
    id: "fake_sebi_claim",
    category: "fake_sebi_claim",
    title: "Suspect SEBI Registration Claim",
    description: "Fraudsters often misuse fake SEBI registration numbers or claim SEBI approval (SEBI does not approve stock tips).",
    severity: "high",
    sebiReference: "SEBI Advisory on Misuse of Registration Numbers",
    weight: 25,
    patterns: [
      /100%\s*sebi (approved|registered)\b/i,
      /sebi (approved|certified) (tips?|calls?)\b/i,
      /government (approved|backed) stock\b/i,
    ],
  },
  {
    id: "secrecy",
    category: "secrecy",
    title: "Secrecy & Private Distribution Pressure",
    description: "Legitimate equity research is transparent. Demands for secrecy prevent second opinions from certified advisors.",
    severity: "medium",
    sebiReference: "SEBI Investor Education Guidelines",
    weight: 15,
    patterns: [
      /don'?t share (with anyone|this message)\b/i,
      /keep (this|it) secret\b/i,
      /private (call|leak)\b/i,
      /delete after reading\b/i,
    ],
  },
];

/**
 * Analyzes a stock tip text and calculates risk score + matched red flags.
 */
export function analyzeTip(text: string): ScamAnalysisResult {
  if (!text || text.trim().length === 0) {
    return {
      riskScore: 0,
      riskLevel: "Low",
      summary: "No tip text provided to analyze.",
      flags: [],
      recommendation: "Paste a stock message, WhatsApp forward, or Telegram tip to analyze.",
      analyzedAt: new Date().toISOString(),
    };
  }

  const matchedFlags: RedFlag[] = [];
  let totalScore = 0;

  for (const rule of RED_FLAG_RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        matchedFlags.push({
          id: rule.id,
          category: rule.category,
          title: rule.title,
          description: rule.description,
          severity: rule.severity,
          sebiReference: rule.sebiReference,
          matchedText: match[0],
        });
        totalScore += rule.weight;
        break; // Only trigger each rule once
      }
    }
  }

  const normalizedScore = Math.min(100, Math.round(totalScore));

  let riskLevel: ScamAnalysisResult["riskLevel"] = "Low";
  let summary = "This message appears to be standard news or factual text with no obvious scam indicators.";
  let recommendation = "Always verify company fundamentals on NSE/BSE before making investment decisions.";

  if (normalizedScore >= 60) {
    riskLevel = "Critical";
    summary = "HIGH RISK OF FRAUD / PUMP & DUMP. Multiple SEBI red flags detected!";
    recommendation = "DO NOT BUY. Report this message to SEBI SCORES portal (scores.gov.in) and block the sender.";
  } else if (normalizedScore >= 35) {
    riskLevel = "High";
    summary = "Suspicious advisory detected with multiple pressure tactics or promises.";
    recommendation = "Do not trade on this tip. Verify if the sender has a valid SEBI Registration Number on sebi.gov.in.";
  } else if (normalizedScore >= 20) {
    riskLevel = "Moderate";
    summary = "Contains promotional or urgent phrasing. Exercise caution.";
    recommendation = "Cross-check financial reports on NSE/BSE instead of relying on third-party claims.";
  }

  return {
    riskScore: normalizedScore,
    riskLevel,
    summary,
    flags: matchedFlags,
    recommendation,
    analyzedAt: new Date().toISOString(),
  };
}
