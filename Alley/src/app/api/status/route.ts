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

async function getLatestReleaseTag(): Promise<string | null> {
  try {
    const res = await fetch("https://api.github.com/repos/BadCmdName/Stray/releases/latest", {
      headers: { "User-Agent": "Stray-Alley" },
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      return data.tag_name || null;
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

  const latestRelease = await getLatestReleaseTag();
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  let currentVersion = "v2.0.0";
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    currentVersion = `v${pkg.version}`;
  } catch {}

  const hasUpdate = latestRelease && latestRelease !== currentVersion;

  return NextResponse.json({
    isRunning: getDaemonStatus(session.userId),
    logs: getLogs(session.userId),
    updateNotification: hasUpdate ? {
      latestVersion: latestRelease,
      isFork: getGitInfo().isFork,
    } : null,
    config: user
      ? {
          token,
          status: user.status,
          device: user.device,
          termsAccepted: user.termsAccepted || false,
          webhookUrl: user.webhookUrl || "",
          custom_status: {
            text: user.customStatusText || "",
            emoji: user.customStatusEmoji || "",
          },
          rich_presence: {
            enabled: user.rpcEnabled,
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
