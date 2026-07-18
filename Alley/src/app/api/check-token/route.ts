import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

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

    const res = await fetch("https://discord.com/api/v9/users/@me", {
      headers: {
        Authorization: token.trim(),
      },
    });

    if (!res.ok) {
      return NextResponse.json({ valid: false, error: "Invalid Discord Token" });
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
