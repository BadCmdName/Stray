import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const SUPER_PROPERTIES = Buffer.from(
  JSON.stringify({
    os: "Windows",
    browser: "Discord Client",
    release_channel: "stable",
    client_version: "1.0.9236",
    os_version: "10.0.19045",
    os_arch: "x64",
    app_arch: "x64",
    system_locale: "en-US",
    has_client_mods: false,
    client_build_number: 539951,
    native_build_number: 81687,
    client_event_source: null,
    client_app_state: "focused",
  })
).toString("base64");

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ valid: false, error: "Token is required" }, { status: 400 });
    }

    const cleanToken = token.replace(/^["']|["']$/g, "").replace(/^Bot\s+/i, "").trim();
    if (!cleanToken) {
      return NextResponse.json({ valid: false, error: "Token is empty" }, { status: 400 });
    }

    const res = await fetch("https://discord.com/api/v9/users/@me", {
      headers: {
        Authorization: cleanToken,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9236 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36",
        "Accept-Language": "en-US",
        "x-discord-locale": "en-US",
        "x-super-properties": SUPER_PROPERTIES,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ valid: false, error: `Invalid Discord Token (HTTP ${res.status})` });
    }

    const user = await res.json();
    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
      },
    });
  } catch {
    return NextResponse.json({ valid: false, error: "Server error checking token" }, { status: 500 });
  }
}
