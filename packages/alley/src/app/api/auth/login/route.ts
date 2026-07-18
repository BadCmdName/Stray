import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const proxyUrl = `https://stray.bcnstudio.tech/api/login-proxy?origin=${encodeURIComponent(origin)}`;
  return NextResponse.redirect(proxyUrl);
}
