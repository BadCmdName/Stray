import { NextResponse } from "next/server";
import { restoreAllDaemons } from "@/lib/daemon";

export async function GET() {
  restoreAllDaemons();
  return NextResponse.json({
    status: "ok",
    timestamp: Date.now(),
  });
}
