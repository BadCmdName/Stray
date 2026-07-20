import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { startDaemon, stopDaemon } from "@/lib/daemon";
import { encrypt } from "@/lib/encryption";
import { saveUser } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, config } = body;

    if (config) {
      saveUser(session.userId, {
        username: session.username,
        ...(config.token !== undefined ? { discordToken: config.token ? encrypt(config.token) : "" } : {}),
        ...(config.status !== undefined ? { status: config.status } : {}),
        ...(config.device !== undefined ? { device: config.device } : {}),
        ...(config.custom_status?.text !== undefined ? { customStatusText: config.custom_status.text } : {}),
        ...(config.custom_status?.emoji !== undefined ? { customStatusEmoji: config.custom_status.emoji } : {}),
        ...(config.rich_presence?.enabled !== undefined ? { rpcEnabled: config.rich_presence.enabled } : {}),
        ...(config.rich_presence?.client_id !== undefined ? { rpcClientId: config.rich_presence.client_id } : {}),
        ...(config.rich_presence?.name !== undefined ? { rpcName: config.rich_presence.name } : {}),
        ...(config.rich_presence?.state !== undefined ? { rpcState: config.rich_presence.state } : {}),
        ...(config.rich_presence?.details !== undefined ? { rpcDetails: config.rich_presence.details } : {}),
        ...(config.rich_presence?.large_image !== undefined ? { rpcLargeImage: config.rich_presence.large_image } : {}),
        ...(config.rich_presence?.large_text !== undefined ? { rpcLargeText: config.rich_presence.large_text } : {}),
        ...(config.rich_presence?.small_image !== undefined ? { rpcSmallImage: config.rich_presence.small_image } : {}),
        ...(config.rich_presence?.small_text !== undefined ? { rpcSmallText: config.rich_presence.small_text } : {}),
        ...(config.termsAccepted !== undefined ? { termsAccepted: config.termsAccepted } : {}),
        ...(config.webhookUrl !== undefined ? { webhookUrl: config.webhookUrl } : {}),
      });
    }

    if (action === "PUBLISH" && config) {
      startDaemon(session.userId, config);
    } else if (action === "STOP") {
      stopDaemon(session.userId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
