import crypto from "crypto";
import { getDb } from "./db";

const ALGORITHM = "aes-256-gcm";

export function encrypt(text: string): string {
  const db = getDb();
  const key = crypto.scryptSync(db.encryptionKey, "stray_salt", 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(hash: string): string {
  const db = getDb();
  const key = crypto.scryptSync(db.encryptionKey, "stray_salt", 32);
  const [ivHex, authTagHex, encryptedText] = hash.split(":");
  if (!ivHex || !authTagHex || !encryptedText) {
    throw new Error("Invalid hash format");
  }
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
