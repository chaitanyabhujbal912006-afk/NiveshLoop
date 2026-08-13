import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role?: "user" | "assistant" | "system";
  sender?: "user" | "ai" | "assistant";
  content: string;
}

const DISCLAIMER = "\n\n*Note: I am Nivesh AI, an educational assistant for NiveshLoop simulation. I explain concepts and app mechanics, but do not provide financial advice or stock recommendations.*";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    if (!lastUserMessage.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    const lowerMsg = lastUserMessage.toLowerCase();

    // Safety check: Refuse personalized buy/sell stock recommendations
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
1. Answer ANY user question, greeting, or concept query naturally like a real AI chatbot (ChatGPT/Gemini/Grok).
2. Maintain context of the ongoing conversation.
3. Never give personalized financial advice, price predictions, or specific stock buy recommendations.
4. Use formatting (bullet points, bold text) for readability. Keep answers clear and under 250 words.`;

    const chatMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: (m.sender === "user" || m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));

    if (chatMessages.length === 0) {
      chatMessages.push({ role: "user", content: lastUserMessage });
    }

    // 1. Try Groq API if key starts with gsk_
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
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const text = groqData?.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({ reply: text + DISCLAIMER });
          }
        } else {
          const errText = await groqRes.text();
          console.error("Groq API error:", groqRes.status, errText);
          return NextResponse.json({
            reply: `⚠️ Groq API key error (${groqRes.status}): Please check your GROK_API_KEY in .env.local!` + DISCLAIMER,
          });
        }
      } catch (err) {
        console.error("Groq API error:", err);
      }
    }

    // 2. Try xAI Grok API if key is present
    if (grokKey && !grokKey.startsWith("gsk_")) {
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
        } else {
          const errText = await grokRes.text();
          console.error("xAI API error:", grokRes.status, errText);
        }
      } catch (err) {
        console.error("xAI API error:", err);
      }
    }

    // 3. Try Gemini API if GEMINI_API_KEY is available
    if (geminiKey) {
      try {
        const geminiContents = chatMessages.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

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
        } else {
          const errText = await geminiRes.text();
          console.error("Gemini API error:", geminiRes.status, errText);
          return NextResponse.json({
            reply: `⚠️ Gemini API error (${geminiRes.status}): Please check your GEMINI_API_KEY at aistudio.google.com/app/apikey!` + DISCLAIMER,
          });
        }
      } catch (err) {
        console.error("Gemini API error:", err);
      }
    }

    // If no valid API key is configured or all calls fail
    return NextResponse.json({
      reply: `⚠️ No active AI API Key found. To enable real-time dynamic AI chat, add a free \`GEMINI_API_KEY\` from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) or \`GROK_API_KEY\` from [console.groq.com/keys](https://console.groq.com/keys) to your \`.env.local\` file or Vercel environment variables!` + DISCLAIMER,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process message" },
      { status: 500 }
    );
  }
}
