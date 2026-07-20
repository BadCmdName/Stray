import fs from "fs";
import path from "path";
import crypto from "crypto";

const dbPath = path.resolve(process.cwd(), "db.json");

export interface UserConfig {
  id: string;
  username: string;
  discordToken: string;
  status: string;
  device: string;
  customStatusText: string | null;
  customStatusEmoji: string | null;
  rpcEnabled: boolean;
  rpcClientId: string | null;
  rpcName: string | null;
  rpcState: string | null;
  rpcDetails: string | null;
  rpcLargeImage: string | null;
  rpcLargeText: string | null;
  rpcSmallImage: string | null;
  rpcSmallText: string | null;
  termsAccepted?: boolean;
  webhookUrl?: string | null;
  rotationEnabled?: boolean;
  rotationInterval?: number;
  rotationStatus1Text?: string | null;
  rotationStatus1Emoji?: string | null;
  rotationStatus2Text?: string | null;
  rotationStatus2Emoji?: string | null;
  rotationStatus3Text?: string | null;
  rotationStatus3Emoji?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Schema {
  encryptionKey: string;
  jwtSecret: string;
  users: Record<string, UserConfig>;
}

function initDb(): Schema {
  if (fs.existsSync(dbPath)) {
    try {
      const content = fs.readFileSync(dbPath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed.encryptionKey && parsed.jwtSecret && parsed.users) {
        return parsed;
      }
    } catch {}
  }

  const encryptionKey = crypto.randomBytes(32).toString("hex");
  const jwtSecret = crypto.randomBytes(32).toString("hex");
  const schema: Schema = { encryptionKey, jwtSecret, users: {} };
  fs.writeFileSync(dbPath, JSON.stringify(schema, null, 2), "utf-8");
  return schema;
}

export function getDb(): Schema {
  return initDb();
}

export function saveDb(data: Schema) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

export function getUser(userId: string): UserConfig | null {
  const db = getDb();
  return db.users[userId] || null;
}

export function saveUser(userId: string, data: Partial<UserConfig>) {
  const db = getDb();
  const existing = db.users[userId] || {
    id: userId,
    username: "",
    discordToken: "",
    status: "online",
    device: "desktop",
    customStatusText: null,
    customStatusEmoji: null,
    rpcEnabled: false,
    rpcClientId: null,
    rpcName: null,
    rpcState: null,
    rpcDetails: null,
    rpcLargeImage: null,
    rpcLargeText: null,
    rpcSmallImage: null,
    rpcSmallText: null,
    termsAccepted: false,
    webhookUrl: null,
    rotationEnabled: false,
    rotationInterval: 10,
    rotationStatus1Text: null,
    rotationStatus1Emoji: null,
    rotationStatus2Text: null,
    rotationStatus2Emoji: null,
    rotationStatus3Text: null,
    rotationStatus3Emoji: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users[userId] = {
    ...existing,
    ...data,
    id: userId,
    updatedAt: new Date().toISOString(),
  };
  saveDb(db);
}
