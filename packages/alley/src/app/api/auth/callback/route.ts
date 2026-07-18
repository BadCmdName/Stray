import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signSession, isUserAllowed } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", req.url).toString());
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "Missing OAuth2 environment settings" }, { status: 500 });
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
      return NextResponse.redirect(new URL("/?error=token_exchange_failed", req.url).toString());
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL("/?error=fetch_user_failed", req.url).toString());
    }

    const discordUser = await userResponse.json();
    const userId = discordUser.id;

    if (!isUserAllowed(userId)) {
      return NextResponse.redirect(new URL("/?error=not_allowed", req.url).toString());
    }

    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const sessionToken = signSession({
      userId,
      username: discordUser.username,
      avatar: discordUser.avatar,
      expires,
    });

    const cookieStore = await cookies();
    cookieStore.set("stray_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(expires),
    });

    await prisma.user.upsert({
      where: { id: userId },
      update: { username: discordUser.username },
      create: {
        id: userId,
        username: discordUser.username,
        discordToken: "",
      },
    });

    return NextResponse.redirect(new URL("/", req.url).toString());
  } catch {
    return NextResponse.redirect(new URL("/?error=internal_error", req.url).toString());
  }
}
