"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stamp } from "./Stamp";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const SUGGESTIONS = [
  "What is a Stop-Loss and how do I use it?",
  "Market Order vs Limit Order — what's the difference?",
  "Why should I invest in NIFTY 50 Index Funds?",
  "What is a P/E Ratio and why does it matter?",
  "How does NiveshLoop's Cooldown Nudge work?",
  "How do I diversify my portfolio across sectors?",
];

export function AiChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Namaste! I am **Nivesh AI**, your educational investing companion. Ask me anything about stock market concepts, lesson topics, order types, or app features!",
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  async function handleSend(textToSend?: string) {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch response");

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "I am having trouble connecting right now. Please try asking again in a moment!",
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto border-2 border-ink bg-paper deep-shadow p-4 sm:p-6 font-body">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-ink pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-stamp/10 p-2 rounded-xs border border-stamp/30">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
              Nivesh AI Mentor
              <Stamp label="educational" earned size="sm" />
            </h2>
            <p className="font-mono text-xs text-muted">
              Ask questions about stock market fundamentals & NiveshLoop features
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] uppercase bg-ink text-paper px-2.5 py-1 font-bold">
          24/7 AI Tutor
        </span>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="mb-4 pb-3 border-b border-ink/10">
        <p className="font-mono text-[10px] text-muted uppercase font-bold mb-2">Suggested Topics:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              disabled={loading}
              className="font-mono text-xs bg-ink/5 hover:bg-stamp hover:text-paper border border-ink/20 px-3 py-1.5 transition-all text-left disabled:opacity-50"
            >
              💡 {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="h-[380px] overflow-y-auto pr-2 space-y-4 mb-4 border border-ink/20 bg-paper/60 p-4 rounded-xs">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-2 mb-1 font-mono text-[10px] text-muted">
              <span>{m.sender === "user" ? "You" : "Nivesh AI"}</span>
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>
            <div
              className={`max-w-[85%] p-3.5 border-2 text-sm leading-relaxed ${
                m.sender === "user"
                  ? "bg-ink text-paper border-ink font-body"
                  : "bg-paper text-ink border-ink/30 shadow-xs font-body"
              }`}
            >
              <div
                className="prose prose-sm max-w-none text-current"
                dangerouslySetInnerHTML={{
                  __html: m.text
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>")
                    .replace(/\n/g, "<br />"),
                }}
              />
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex flex-col items-start">
            <div className="bg-paper text-muted border-2 border-ink/20 p-3 text-xs font-mono flex items-center gap-2 animate-pulse">
              <span className="h-2 w-2 bg-stamp rounded-full animate-ping" />
              Nivesh AI is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g. What is a P/E ratio? How does Stop-Loss work?)..."
          disabled={loading}
          className="flex-1 border-2 border-ink bg-paper px-4 py-3 font-mono text-sm text-ink focus:outline-none focus:border-stamp transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-stamp text-paper px-6 py-3 font-mono font-bold text-xs uppercase hover:opacity-90 transition-opacity disabled:opacity-50 border-2 border-ink shadow-[2px_2px_0_rgba(26,26,46,1)]"
        >
          Send →
        </button>
      </form>
    </div>
  );
}
