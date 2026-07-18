import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const proxyBase = process.env.NEXT_PUBLIC_STRAY_PROXY_URL || "https://stray.bcnstudio.tech";
  const proxyUrl = `${proxyBase}/api/login-proxy?origin=${encodeURIComponent(origin)}`;
  return NextResponse.redirect(proxyUrl);
}
