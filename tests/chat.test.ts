import { describe, it, expect } from "vitest";
import { POST } from "../src/app/api/chat/route";
import { NextRequest } from "next/server";

describe("Nivesh AI Chat API (/api/chat)", () => {
  it("returns error 400 if user message is empty", async () => {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "" }] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("refuses to give financial advice or stock tips", async () => {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Which stock should I buy today?" }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toContain("cannot recommend specific stock purchases");
  });

  it("handles queries via dynamic LLM route or prompts for active key", async () => {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Explain stock market fundamentals" }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toBeDefined();
  });
});
