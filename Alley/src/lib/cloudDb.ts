import { getUser, saveUser, UserConfig } from "./db";

const CLOUD_PROXY_URL = process.env.CLOUD_PROXY_URL || "https://stray.bcnstudio.tech";

export async function syncUserToCloud(userId: string): Promise<boolean> {
  const user = getUser(userId);
  if (!user || !user.cloudSyncEnabled) return false;

  try {
    const res = await fetch(`${CLOUD_PROXY_URL}/api/db/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        encryptedData: user,
      }),
    });

    if (res.ok) {
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
        saveUser(userId, data.encryptedData);
        return getUser(userId);
      }
    }
  } catch {}
  return null;
}
