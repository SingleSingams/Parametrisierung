import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Minimaler Health-Check zum Debuggen (z. B. Vercel-403 vs. App-Routing). */
export function GET() {
  return NextResponse.json({
    ok: true,
    service: "bav-parametrisierung-poc",
    time: new Date().toISOString(),
  });
}
