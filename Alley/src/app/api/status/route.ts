import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isDaemonRunning, getDaemonLogs, restoreAllDaemons, getQuestProcessingStatus } from "@/lib/daemon";
import { getUser } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { restoreUserFromCloud } from "@/lib/cloudDb";
import pkg from "../../../../package.json";

const ORIGINAL_REPO = "BadCmdName/Stray";
const CURRENT_REPO = process.env.VERCEL_GIT_REPO_SLUG || process.env.RENDER_GIT_REPO_SLUG || "BadCmdName/Stray";

let cachedLatestVersion = "";
let lastFetchTime = 0;

function isVersionNewer(latest: string, current: string): boolean {
  const parse = (v: string) => v.replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  const l = parse(latest);
  const c = parse(current);
  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    const lNum = l[i] || 0;
    const cNum = c[i] || 0;
    if (lNum > cNum) return true;
    if (lNum < cNum) return false;
  }
  return false;
}

async function getLatestRemoteVersion(): Promise<string> {
  const now = Date.now();
  if (now - lastFetchTime < 60000 && cachedLatestVersion) {
    return cachedLatestVersion;
  }
  try {
    const res = await fetch("https://raw.githubusercontent.com/BadCmdName/Stray/main/Alley/package.json", {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.version) {
        cachedLatestVersion = data.version;
        lastFetchTime = now;
      }
    }
  } catch {}
  return cachedLatestVersion || pkg.version || "2.3.3";
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  restoreAllDaemons();

  let user = getUser(session.userId);
  if (!user || !user.discordToken) {
    await restoreUserFromCloud(session.userId);
    user = getUser(session.userId);
  }

  const isRunning = isDaemonRunning(session.userId);
  const logs = getDaemonLogs(session.userId);

  const questStatus = getQuestProcessingStatus(session.userId);
  const isProcessingQuests = Boolean(questStatus?.isProcessing);
  const activeQuestRpc = questStatus?.activeQuestName
    ? {
        name: questStatus.activeQuestName,
        details: "Completing Discord Quest",
        state: questStatus.progressPct !== undefined ? `Progress: ${questStatus.progressPct}% | via Stray` : "In Progress | via Stray",
        application_id: questStatus.appId || "1527635163591348254",
      }
    : null;

  let token = "";
  if (user?.discordToken) {
    try {
      token = decrypt(user.discordToken);
    } catch {}
  }

  const currentVersion = pkg.version || "2.3.3";
  const latestVersion = await getLatestRemoteVersion();
  const hasUpdate = isVersionNewer(latestVersion, currentVersion);

  const isFork = CURRENT_REPO.toLowerCase() !== ORIGINAL_REPO.toLowerCase();
  const updateNotification = hasUpdate
    ? { latestVersion: `v${latestVersion}`, currentVersion: `v${currentVersion}`, isFork }
    : null;

  return NextResponse.json({
    authenticated: true,
    isRunning,
    logs,
    updateNotification,
    isProcessingQuests,
    activeQuestRpc,
    config: user
      ? {
          token,
          status: user.status || "online",
          device: user.device || "desktop",
          termsAccepted: user.termsAccepted || false,
          cloudSyncEnabled: user.cloudSyncEnabled || false,
          cloudTermsAccepted: user.cloudTermsAccepted || false,
          lastSyncTimestamp: user.lastSyncTimestamp || null,
          autoQuestsEnabled: user.autoQuestsEnabled || false,
          liveRpcQuests: user.liveRpcQuests || false,
          webhookEnabled: user.webhookEnabled || false,
          webhookUrl: user.webhookUrl || "",
          rotationEnabled: user.rotationEnabled || false,
          rotationInterval: user.rotationInterval || 10,
          rotationStatus1Text: user.rotationStatus1Text || "",
          rotationStatus1Emoji: user.rotationStatus1Emoji || "",
          rotationStatus2Text: user.rotationStatus2Text || "",
          rotationStatus2Emoji: user.rotationStatus2Emoji || "",
          rotationStatus3Text: user.rotationStatus3Text || "",
          rotationStatus3Emoji: user.rotationStatus3Emoji || "",
          custom_status: {
            text: user.customStatusText || "",
            emoji: user.customStatusEmoji || "",
          },
          rich_presence: {
            enabled: user.rpcEnabled || false,
            type: user.rpcType ?? 0,
            url: user.rpcUrl || "",
            client_id: user.rpcClientId || "1527635163591348254",
            name: user.rpcName || "",
            state: user.rpcState || "",
            details: user.rpcDetails || "",
            large_image: user.rpcLargeImage || "",
            large_text: user.rpcLargeText || "",
            small_image: user.rpcSmallImage || "",
            small_text: user.rpcSmallText || "",
          },
        }
      : null,
  });
}
