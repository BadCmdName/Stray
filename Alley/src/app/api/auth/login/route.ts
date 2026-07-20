import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { signSession, isUserAllowed } from "@/lib/auth";
import { saveUser } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: "Missing Stray Key" }, { status: 400 });
    }

    const parts = key.split(".");
    if (parts.length !== 2) {
      return NextResponse.json({ error: "Invalid Key format" }, { status: 400 });
    }

    const [data, sig] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", "stray_auth_shared_secret")
      .update(data)
      .digest("hex");

    if (sig !== expectedSignature) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }

    const payload = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    if (Date.now() > payload.expires) {
      return NextResponse.json({ error: "Key has expired" }, { status: 400 });
    }

    if (!isUserAllowed(payload.id)) {
      return NextResponse.json({ error: "User ID is not authorized" }, { status: 403 });
    }

    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const sessionToken = signSession({
      userId: payload.id,
      username: payload.username,
      avatar: payload.avatar || undefined,
      expires,
      keyExpires: payload.expires,
    });

    const cookieStore = await cookies();
    cookieStore.set("stray_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(expires),
    });

    saveUser(payload.id, {
      username: payload.username,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
