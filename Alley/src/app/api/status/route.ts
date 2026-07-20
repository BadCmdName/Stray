import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDaemonStatus, getLogs } from "@/lib/daemon";
import { decrypt } from "@/lib/encryption";
import { getUser } from "@/lib/db";

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

  return NextResponse.json({
    isRunning: getDaemonStatus(session.userId),
    logs: getLogs(session.userId),
    config: user
      ? {
          token,
          status: user.status,
          device: user.device,
          termsAccepted: user.termsAccepted || false,
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
