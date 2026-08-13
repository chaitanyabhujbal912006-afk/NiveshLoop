import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role?: "user" | "assistant" | "system";
  sender?: "user" | "ai" | "assistant";
  content: string;
}

const DISCLAIMER = "\n\n*Note: I am Nivesh AI, an educational assistant for NiveshLoop simulation. I explain concepts and app mechanics, but do not provide financial advice or stock recommendations.*";

// Knowledge base of common beginner questions for instant, high-quality responses
const KNOWLEDGE_BASE: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ["stop loss", "stoploss", "stop-loss"],
    answer: "A **Stop-Loss** is an automated order rule that exits your position if the stock price drops to a specific level you choose. For example, if you buy RELIANCE at ₹2,900 and set a stop-loss at ₹2,750, your shares sell automatically to prevent bigger losses. In NiveshLoop, Lesson 5 unlocks the stop-loss option on your buy forms!",
  },
  {
    keywords: ["limit order", "market order", "order type"],
    answer: "A **Market Order** executes immediately at the current available market price. A **Limit Order** lets you set the maximum price you're willing to pay for a buy, or minimum price for a sell — the trade only executes if the market hits your target price. Lesson 3 in NiveshLoop covers this in detail!",
  },
  {
    keywords: ["index fund", "etf", "nifty 50"],
    answer: "An **Index Fund** or ETF pools money to buy all 50 stocks in the NIFTY 50 index in equal proportions. Instead of trying to guess individual winning stocks, you invest in the growth of the overall Indian economy with instant diversification and lower risk. Lesson 7 unlocks index fund tagging in search!",
  },
  {
    keywords: ["pe ratio", "p/e", "valuation", "price to earnings"],
    answer: "The **Price-to-Earnings (P/E) Ratio** measures how much investors are paying for every ₹1 of profit a company makes. A P/E of 20 means you pay ₹20 for ₹1 of annual earning. Comparing P/E across companies in the same sector helps identify whether a stock is relatively expensive or undervalued.",
  },
  {
    keywords: ["diversify", "diversification", "portfolio risk"],
    answer: "**Diversification** means spreading your investments across different sectors (IT, Banking, Energy, FMCG). If one sector experiences a temporary downturn, your other holdings help balance your portfolio. Lesson 4 unlocks concentration nudges if any stock exceeds 40% of your portfolio!",
  },
  {
    keywords: ["cooldown", "panic sell", "emotional investing"],
    answer: "The **Cooldown Nudge** is NiveshLoop's signature reflective pause. If you try to sell a stock that dropped 5%+ today, a 10-second pause screen asks you to take a breath. It doesn't block your sell — it just gives you friction to avoid knee-jerk panic selling. Lesson 9 unlocks this!",
  },
  {
    keywords: ["buy stock", "which stock", "recommend", "best stock", "should i buy"],
    answer: "As an educational tutor, I don't give stock tips or buy recommendations! Instead, look for companies with strong revenue growth, manageable debt, reasonable P/E ratios, and consistent market position. You can practice evaluating stocks risk-free with your ₹1,00,000 virtual balance in NiveshLoop!",
  },
  {
    keywords: ["sip", "systematic investment"],
    answer: "A **SIP (Systematic Investment Plan)** lets you invest a fixed amount regularly (e.g. ₹1,000 every month) instead of a lump sum. This helps you average out purchase costs across market highs and lows — a strategy called Rupee Cost Averaging.",
  },
  {
    keywords: ["cash balance", "virtual money", "real money"],
    answer: "NiveshLoop is 100% free and educational! Your ₹1,00,000 balance is virtual simulated money. No real money or brokerage accounts are involved — you can experiment, make mistakes, and learn habits completely risk-free.",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    if (!lastUserMessage.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    const lowerMsg = lastUserMessage.toLowerCase();

    // Safety check: Refuse personalized buy/sell directives
    if (
      lowerMsg.includes("which stock should i buy") ||
      lowerMsg.includes("give me stock tips") ||
      lowerMsg.includes("tell me what stock to buy") ||
      lowerMsg.includes("best stock to buy today")
    ) {
      return NextResponse.json({
        reply:
          "I am Nivesh AI, an educational mentor for NiveshLoop. I cannot recommend specific stock purchases or give financial advice. Instead, I can help you understand fundamental metrics like P/E ratios, revenue growth, sector diversification, and order types so you can form your own investment judgment!" +
          DISCLAIMER,
      });
    }

    const grokKey = (process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.GROQ_API_KEY || "").trim();
    const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();

    const systemInstruction = `You are Nivesh AI, an enthusiastic, highly intelligent, and helpful educational assistant for NiveshLoop (a free Indian stock market learning web app with simulated trading).
Answer the user's question dynamically, conversationally, and clearly in simple, engaging terms suitable for beginners.
Guidelines:
1. Explain stock market concepts (NSE/BSE, NIFTY 50, SIP, P/E ratio, Stop-Loss, Index Funds, Limit Orders, Market Orders, Technical Analysis, Financial News).
2. Maintain context of the ongoing conversation like a real AI assistant.
3. Never give personalized financial advice, price predictions, or specific stock buy recommendations.
4. Use formatting (bullet points, bold text) for readability. Keep answers clear and under 200 words.`;

    const chatMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: (m.sender === "user" || m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));

    if (chatMessages.length === 0) {
      chatMessages.push({ role: "user", content: lastUserMessage });
    }

    // 1. If key is a Groq key (starts with gsk_) or GROQ_API_KEY
    if (grokKey.startsWith("gsk_")) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${grokKey}`,
          },
          body: JSON.stringify({
            messages: [{ role: "system", content: systemInstruction }, ...chatMessages],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const text = groqData?.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({ reply: text + DISCLAIMER });
          }
        }
      } catch (err) {
        console.warn("Groq API call failed, falling back to xAI/Gemini", err);
      }
    }

    // 2. Try xAI Grok API if key is present
    if (grokKey) {
      try {
        const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${grokKey}`,
          },
          body: JSON.stringify({
            messages: [{ role: "system", content: systemInstruction }, ...chatMessages],
            model: "grok-2-latest",
            temperature: 0.7,
          }),
        });

        if (grokRes.ok) {
          const grokData = await grokRes.json();
          const text = grokData?.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({ reply: text + DISCLAIMER });
          }
        }
      } catch (err) {
        console.warn("xAI API call failed, trying Gemini / fallback", err);
      }
    }

    // 3. Try Gemini API if GEMINI_API_KEY is available
    const geminiContents = chatMessages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemInstruction }],
              },
              contents: geminiContents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return NextResponse.json({ reply: text + DISCLAIMER });
          }
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to smart educational engine", err);
      }
    }

    // Dynamic educational response generator fallback (when API key is not configured)
    const matched = KNOWLEDGE_BASE.find((item) =>
      item.keywords.some((kw) => lowerMsg.includes(kw))
    );

    if (matched) {
      return NextResponse.json({ reply: matched.answer + DISCLAIMER });
    }

    // Dynamic contextual assistant response
    const dynamicReply = `That's an interesting question about **"${lastUserMessage}"**!

In stock market investing, here are key fundamentals to consider:
- **Understand the Core Business**: Look at what the company actually sells and its earnings growth.
- **Risk Management**: Always use Stop-Loss protection and diversify across multiple sectors (e.g. IT, Banking, Energy).
- **Long-Term Thinking**: Focus on business quality rather than short-term price noise.

Feel free to ask me to explain any specific concept like **P/E ratio**, **Stop-Loss**, **Limit Orders**, or **Index Funds**!` + DISCLAIMER;

    return NextResponse.json({ reply: dynamicReply });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process message" },
      { status: 500 }
    );
  }
}
