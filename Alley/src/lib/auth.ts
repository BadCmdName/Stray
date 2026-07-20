import { cookies } from "next/headers";
import crypto from "crypto";
import { getDb } from "./db";

export interface SessionPayload {
  userId: string;
  username: string;
  avatar?: string;
  expires: number;
  keyExpires?: number;
}

export function signSession(payload: SessionPayload): string {
  const db = getDb();
  const data = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto.createHmac("sha256", db.jwtSecret).update(data).digest("base64");
  return `${data}.${signature}`;
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const db = getDb();
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", db.jwtSecret).update(data).digest("base64");
    if (signature !== expectedSignature) return null;
    const payload: SessionPayload = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    if (Date.now() > payload.expires) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("stray_session")?.value;
  if (!token) return null;
  return verifySession(token);
}

export function isUserAllowed(userId: string): boolean {
  const allowedStr = process.env.ALLOWED_USER_IDS || "";
  const allowedList = allowedStr.split(",").map((id) => id.trim());
  return allowedList.includes(userId);
}
