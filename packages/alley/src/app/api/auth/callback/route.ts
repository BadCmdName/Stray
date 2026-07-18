import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { signSession, isUserAllowed } from "@/lib/auth";
import { saveUser } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const username = searchParams.get("username");
  const avatar = searchParams.get("avatar") || "";
  const sig = searchParams.get("sig");

  if (!id || !username || !sig) {
    return NextResponse.redirect(new URL("/?error=invalid_callback", req.url).toString());
  }

  const expectedSignature = crypto
    .createHmac("sha256", "stray_auth_shared_secret")
    .update(`${id}:${username}:${avatar}`)
    .digest("hex");

  if (sig !== expectedSignature) {
    return NextResponse.redirect(new URL("/?error=signature_mismatch", req.url).toString());
  }

  if (!isUserAllowed(id)) {
    return NextResponse.redirect(new URL("/?error=not_allowed", req.url).toString());
  }

  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const sessionToken = signSession({
    userId: id,
    username,
    avatar: avatar || undefined,
    expires,
  });

  const cookieStore = await cookies();
  cookieStore.set("stray_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });

  saveUser(id, {
    username,
  });

  return NextResponse.redirect(new URL("/", req.url).toString());
}
