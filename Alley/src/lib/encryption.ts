import crypto from "crypto";
import { getDb } from "./db";

const ALGORITHM = "aes-256-gcm";
const MASTER_KEY = "stray_master_encryption_key_v1";

export function encrypt(text: string): string {
  if (!text) return "";
  const db = getDb();
  const keySecret = db?.encryptionKey || process.env.ENCRYPTION_KEY || MASTER_KEY;
  const key = crypto.scryptSync(keySecret, "stray_salt", 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(hash: string): string {
  if (!hash) return "";
  if (!hash.includes(":")) {
    return hash;
  }
  const db = getDb();
  const keysToTry = [
    db?.encryptionKey,
    process.env.ENCRYPTION_KEY,
    MASTER_KEY,
  ].filter(Boolean) as string[];

  const [ivHex, authTagHex, encryptedText] = hash.split(":");
  if (!ivHex || !authTagHex || !encryptedText) {
    return hash;
  }

  for (const k of keysToTry) {
    try {
      const key = crypto.scryptSync(k, "stray_salt", 32);
      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      if (decrypted) return decrypted;
    } catch {}
  }

  return hash;
}
