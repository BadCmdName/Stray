import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDaemonStatus, getLogs } from "@/lib/daemon";
import { decrypt } from "@/lib/encryption";
import { getUser } from "@/lib/db";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function getGitInfo() {
  try {
    const remoteUrl = execSync("git remote -v", { encoding: "utf-8" });
    if (remoteUrl && !remoteUrl.includes("BadCmdName/Stray")) {
      return { isFork: true };
    }
  } catch {}
  return { isFork: false };
}

async function getOfficialVersion(): Promise<string | null> {
  try {
    const res = await fetch("https://raw.githubusercontent.com/BadCmdName/Stray/main/Alley/package.json", {
      headers: { "User-Agent": "Stray-Alley" },
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      return data.version || null;
    }
  } catch {}
  return null;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = getUser(session.userId);

  let token = "";
  if (user?.discordToken) {
    try {
      token = decrypt(user.discordToken);
    } catch {}
  }

  const officialVersion = await getOfficialVersion();
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  let currentVersion = "1.1.0";
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    currentVersion = pkg.version;
  } catch {}

  const hasUpdate = officialVersion && officialVersion !== currentVersion;

  return NextResponse.json({
    isRunning: getDaemonStatus(session.userId),
    logs: getLogs(session.userId),
    updateNotification: hasUpdate ? {
      latestVersion: `v${officialVersion}`,
      isFork: getGitInfo().isFork,
    } : null,
    config: user
      ? {
          token,
          status: user.status,
          device: user.device,
          termsAccepted: user.termsAccepted || false,
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
            enabled: user.rpcEnabled,
            type: user.rpcType ?? 0,
            url: user.rpcUrl || "",
            client_id: user.rpcClientId || "",
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
