import { NextRequest, NextResponse } from "next/server";
import { getPrice } from "@/lib/prices";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol query param is required" }, { status: 400 });
  }

  try {
    const quote = await getPrice(symbol);
    return NextResponse.json(quote);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch price" },
      { status: 502 }
    );
  }
}
