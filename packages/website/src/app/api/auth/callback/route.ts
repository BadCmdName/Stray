import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  const cookieStore = await cookies();
  const origin = cookieStore.get("stray_login_origin")?.value;

  if (!code || !origin) {
    return NextResponse.json({ error: "Missing code or origin" }, { status: 400 });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
  }

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: "Failed to exchange OAuth token" }, { status: 500 });
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to retrieve user details" }, { status: 500 });
    }

    const discordUser = await userResponse.json();
    const id = discordUser.id;
    const username = discordUser.username;
    const avatar = discordUser.avatar || "";

    const signature = crypto
      .createHmac("sha256", "stray_auth_shared_secret")
      .update(`${id}:${username}:${avatar}`)
      .digest("hex");

    cookieStore.delete("stray_login_origin");

    const targetUrl = new URL("/api/auth/callback", origin);
    targetUrl.searchParams.set("id", id);
    targetUrl.searchParams.set("username", username);
    if (avatar) {
      targetUrl.searchParams.set("avatar", avatar);
    }
    targetUrl.searchParams.set("sig", signature);

    return NextResponse.redirect(targetUrl.toString());
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
