import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin");

  if (!origin) {
    return NextResponse.json({ error: "Missing origin parameter" }, { status: 400 });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Proxy missing environment variables" }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set("stray_login_origin", origin, {
    httpOnly: true,
    secure: true,
    path: "/",
    expires: new Date(Date.now() + 15 * 60 * 1000),
  });

  const authorizeUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
  return NextResponse.redirect(authorizeUrl);
}
