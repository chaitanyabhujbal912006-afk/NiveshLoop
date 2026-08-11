import { NextResponse } from "next/server";
import { analyzeTip } from "@/lib/scam-checker";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text : "";

    const analysis = analyzeTip(text);
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to analyze tip text" },
      { status: 500 }
    );
  }
}
