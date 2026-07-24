import { getUser, saveUser, UserConfig, getDb, saveDb } from "./db";
import { addLog } from "./daemon";

const CLOUD_PROXY_URL = process.env.CLOUD_PROXY_URL || "https://stray.bcnstudio.tech";

const lastSyncedHash = new Map<string, string>();

export async function syncUserToCloud(userId: string): Promise<boolean> {
  const user = getUser(userId);
  if (!user || !user.cloudSyncEnabled) return false;

  const db = getDb();
  const dataToSync = {
    ...user,
    encryptionKey: db.encryptionKey,
    termsAccepted: user.termsAccepted ?? true,
    cloudTermsAccepted: user.cloudTermsAccepted ?? true,
  };

  const serialized = JSON.stringify(dataToSync);
  if (lastSyncedHash.get(userId) === serialized) {
    return true;
  }

  try {
    addLog(userId, "Testing connection to Cloud DB (Stray-DB)...");
    const res = await fetch(`${CLOUD_PROXY_URL}/api/db/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        encryptedData: dataToSync,
      }),
    });

    if (res.ok) {
      lastSyncedHash.set(userId, serialized);
      saveUser(userId, { lastSyncTimestamp: new Date().toISOString() });
      addLog(userId, "Cloud DB Auto-Backup connected successfully to Stray-DB.");
      return true;
    } else {
      const errJson = await res.json().catch(() => ({}));
      addLog(userId, `Cloud DB connection warning: ${errJson.error || "Failed to commit backup"}`);
    }
  } catch (err: any) {
    addLog(userId, `Cloud DB connection error: ${err.message || "Proxy endpoint unreachable"}`);
  }
  return false;
}

export async function silentSyncUserToCloud(userId: string): Promise<boolean> {
  const user = getUser(userId);
  if (!user || !user.cloudSyncEnabled) return false;

  const db = getDb();
  const dataToSync = {
    ...user,
    encryptionKey: db.encryptionKey,
    termsAccepted: user.termsAccepted ?? true,
    cloudTermsAccepted: user.cloudTermsAccepted ?? true,
  };

  const serialized = JSON.stringify(dataToSync);
  if (lastSyncedHash.get(userId) === serialized) {
    return true;
  }

  try {
    const res = await fetch(`${CLOUD_PROXY_URL}/api/db/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        encryptedData: dataToSync,
      }),
    });

    if (res.ok) {
      lastSyncedHash.set(userId, serialized);
      saveUser(userId, { lastSyncTimestamp: new Date().toISOString() });
      return true;
    }
  } catch {}
  return false;
}

export async function restoreUserFromCloud(userId: string): Promise<UserConfig | null> {
  try {
    const res = await fetch(`${CLOUD_PROXY_URL}/api/db/restore?userId=${encodeURIComponent(userId)}`, {
      headers: { "Cache-Control": "no-cache" },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.encryptedData) {
        const { encryptionKey, ...restoredData } = data.encryptedData;
        if (encryptionKey) {
          const db = getDb();
          db.encryptionKey = encryptionKey;
          saveDb(db);
        }
        const restoredConfig: UserConfig = {
          ...restoredData,
          termsAccepted: true,
          cloudTermsAccepted: true,
          cloudSyncEnabled: true,
        };
        saveUser(userId, restoredConfig);
        lastSyncedHash.set(userId, JSON.stringify({
          ...restoredConfig,
          encryptionKey,
          termsAccepted: true,
          cloudTermsAccepted: true,
        }));
        addLog(userId, "Restored profile parameters and policy acceptance from Stray-DB.");
        return getUser(userId);
      }
    }
  } catch {}
  return null;
}
