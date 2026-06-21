import { NextResponse } from "next/server";
import { logInfo } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    logInfo("Web vitals metric received", payload);
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
