import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { startDaemon, stopDaemon } from "@/lib/daemon";
import { encrypt } from "@/lib/encryption";
import { saveUser, getUser } from "@/lib/db";
import { syncUserToCloud } from "@/lib/cloudDb";

const userCooldowns = new Map<string, number>();
const COOLDOWN_MS = 30000;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, config } = body;

    if (action === "SAVE" || action === "PUBLISH") {
      const lastAction = userCooldowns.get(session.userId) || 0;
      const now = Date.now();
      if (now - lastAction < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - lastAction)) / 1000);
        return NextResponse.json(
          { error: `Please wait ${remaining} seconds before saving or publishing again.` },
          { status: 429 }
        );
      }
      userCooldowns.set(session.userId, now);
    }

    if (config) {
      saveUser(session.userId, {
        username: session.username,
        ...(config.token !== undefined ? { discordToken: config.token ? encrypt(config.token) : "" } : {}),
        ...(config.status !== undefined ? { status: config.status } : {}),
        ...(config.device !== undefined ? { device: config.device } : {}),
        ...(config.custom_status?.text !== undefined ? { customStatusText: config.custom_status.text } : {}),
        ...(config.custom_status?.emoji !== undefined ? { customStatusEmoji: config.custom_status.emoji } : {}),
        ...(config.rich_presence?.enabled !== undefined ? { rpcEnabled: config.rich_presence.enabled } : {}),
        ...(config.rich_presence?.type !== undefined ? { rpcType: Number(config.rich_presence.type) } : {}),
        ...(config.rich_presence?.url !== undefined ? { rpcUrl: config.rich_presence.url } : {}),
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
        ...(config.rotationEnabled !== undefined ? { rotationEnabled: config.rotationEnabled } : {}),
        ...(config.rotationInterval !== undefined ? { rotationInterval: config.rotationInterval } : {}),
        ...(config.rotationStatus1Text !== undefined ? { rotationStatus1Text: config.rotationStatus1Text } : {}),
        ...(config.rotationStatus1Emoji !== undefined ? { rotationStatus1Emoji: config.rotationStatus1Emoji } : {}),
        ...(config.rotationStatus2Text !== undefined ? { rotationStatus2Text: config.rotationStatus2Text } : {}),
        ...(config.rotationStatus2Emoji !== undefined ? { rotationStatus2Emoji: config.rotationStatus2Emoji } : {}),
        ...(config.rotationStatus3Text !== undefined ? { rotationStatus3Text: config.rotationStatus3Text } : {}),
        ...(config.rotationStatus3Emoji !== undefined ? { rotationStatus3Emoji: config.rotationStatus3Emoji } : {}),
        ...(config.cloudSyncEnabled !== undefined ? { cloudSyncEnabled: config.cloudSyncEnabled } : {}),
        ...(config.cloudTermsAccepted !== undefined ? { cloudTermsAccepted: config.cloudTermsAccepted } : {}),
      });

      const user = getUser(session.userId);
      if (user?.cloudSyncEnabled || action === "SYNC") {
        syncUserToCloud(session.userId).catch(() => {});
      }
    }

    if (action === "PUBLISH" && config) {
      saveUser(session.userId, { botEnabled: true });
      startDaemon(session.userId, config);
    } else if (action === "STOP") {
      saveUser(session.userId, { botEnabled: false });
      stopDaemon(session.userId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
