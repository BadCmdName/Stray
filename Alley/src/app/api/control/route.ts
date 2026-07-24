import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { startDaemon, stopDaemon, getDaemonStatus } from "@/lib/daemon";
import { encrypt, decrypt } from "@/lib/encryption";
import { saveUser, getUser } from "@/lib/db";
import { syncUserToCloud, restoreUserFromCloud } from "@/lib/cloudDb";

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

    if (action === "RESTORE") {
      await restoreUserFromCloud(session.userId);
      const restoredUser = getUser(session.userId);

      let token = "";
      if (restoredUser?.discordToken) {
        try {
          token = decrypt(restoredUser.discordToken);
        } catch {}
      }

      return NextResponse.json({
        success: true,
        config: restoredUser
          ? {
              token,
              status: restoredUser.status || "online",
              device: restoredUser.device || "desktop",
              termsAccepted: restoredUser.termsAccepted || false,
              cloudSyncEnabled: restoredUser.cloudSyncEnabled || false,
              cloudTermsAccepted: restoredUser.cloudTermsAccepted || false,
              lastSyncTimestamp: restoredUser.lastSyncTimestamp || null,
              autoQuestsEnabled: restoredUser.autoQuestsEnabled || false,
              liveRpcQuests: restoredUser.liveRpcQuests || false,
              webhookEnabled: restoredUser.webhookEnabled || false,
              webhookUrl: restoredUser.webhookUrl || "",
              rotationEnabled: restoredUser.rotationEnabled || false,
              rotationInterval: restoredUser.rotationInterval || 10,
              rotationStatus1Text: restoredUser.rotationStatus1Text || "",
              rotationStatus1Emoji: restoredUser.rotationStatus1Emoji || "",
              rotationStatus2Text: restoredUser.rotationStatus2Text || "",
              rotationStatus2Emoji: restoredUser.rotationStatus2Emoji || "",
              rotationStatus3Text: restoredUser.rotationStatus3Text || "",
              rotationStatus3Emoji: restoredUser.rotationStatus3Emoji || "",
              custom_status: {
                text: restoredUser.customStatusText || "",
                emoji: restoredUser.customStatusEmoji || "",
              },
              rich_presence: {
                enabled: restoredUser.rpcEnabled || false,
                type: restoredUser.rpcType ?? 0,
                url: restoredUser.rpcUrl || "",
                client_id: restoredUser.rpcClientId || "1018195507560063039",
                name: restoredUser.rpcName || "",
                state: restoredUser.rpcState || "",
                details: restoredUser.rpcDetails || "",
                large_image: restoredUser.rpcLargeImage || "",
                large_text: restoredUser.rpcLargeText || "",
                small_image: restoredUser.rpcSmallImage || "",
                small_text: restoredUser.rpcSmallText || "",
              },
            }
          : null,
      });
    }

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
      let rpcEnabled = config.rich_presence?.enabled;
      let liveRpcQuests = config.liveRpcQuests;

      if (liveRpcQuests === true) {
        rpcEnabled = false;
      } else if (rpcEnabled === true) {
        liveRpcQuests = false;
      }

      saveUser(session.userId, {
        username: session.username,
        ...(config.token !== undefined ? { discordToken: config.token ? encrypt(config.token) : "" } : {}),
        ...(config.status !== undefined ? { status: config.status } : {}),
        ...(config.device !== undefined ? { device: config.device } : {}),
        ...(config.custom_status?.text !== undefined ? { customStatusText: config.custom_status.text } : {}),
        ...(config.custom_status?.emoji !== undefined ? { customStatusEmoji: config.custom_status.emoji } : {}),
        ...(rpcEnabled !== undefined ? { rpcEnabled } : {}),
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
        ...(config.webhookEnabled !== undefined ? { webhookEnabled: config.webhookEnabled } : {}),
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
        ...(config.autoQuestsEnabled !== undefined ? { autoQuestsEnabled: config.autoQuestsEnabled } : {}),
        ...(liveRpcQuests !== undefined ? { liveRpcQuests } : {}),
      });

      const user = getUser(session.userId);
      if (user?.cloudSyncEnabled || action === "SYNC") {
        syncUserToCloud(session.userId).catch(() => {});
      }

      if (config.liveRpcQuests && user?.discordToken && !getDaemonStatus(session.userId)) {
        const token = decrypt(user.discordToken);
        if (token) {
          saveUser(session.userId, { botEnabled: true });
          startDaemon(session.userId, {
            token,
            status: user.status || "online",
            device: user.device || "desktop",
            webhookUrl: user.webhookUrl || "",
            rotationEnabled: user.rotationEnabled || false,
            custom_status: { text: user.customStatusText || "", emoji: user.customStatusEmoji || "" },
            rich_presence: {
              enabled: false,
              client_id: "1018195507560063039",
              name: "Stray",
              state: "",
              details: "",
              large_image: "",
              large_text: "",
              small_image: "",
              small_text: "",
            },
          });
        }
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
