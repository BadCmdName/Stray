import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUser, saveUser } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { QuestManager, QuestConfig } from "@/lib/questManager";
import { startDaemon, getDaemonStatus } from "@/lib/daemon";

const userQuestsCache = new Map<string, QuestConfig[]>();

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = getUser(session.userId);
  if (!user || !user.discordToken) {
    return NextResponse.json({ quests: [] });
  }

  try {
    const token = decrypt(user.discordToken);
    if (!token) return NextResponse.json({ quests: [] });

    const manager = new QuestManager(session.userId, token);
    const quests = await manager.fetchQuests();
    if (quests.length > 0) {
      userQuestsCache.set(session.userId, quests);
      return NextResponse.json({ quests });
    } else {
      const cached = userQuestsCache.get(session.userId) || [];
      return NextResponse.json({ quests: cached });
    }
  } catch (err: unknown) {
    const cached = userQuestsCache.get(session.userId) || [];
    return NextResponse.json({ quests: cached });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = getUser(session.userId);
  if (!user || !user.discordToken) {
    return NextResponse.json({ error: "Discord token not configured" }, { status: 400 });
  }

  try {
    const token = decrypt(user.discordToken);
    if (!token) {
      return NextResponse.json({ error: "Invalid Discord token" }, { status: 400 });
    }

    if (!getDaemonStatus(session.userId)) {
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
          client_id: "1527635163591348254",
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

    const body = await request.json().catch(() => ({}));
    const { questId } = body;

    const manager = new QuestManager(session.userId, token);
    const quests = await manager.fetchQuests();

    if (questId) {
      const targetQuest = quests.find((q) => q.id === questId);
      if (!targetQuest) {
        return NextResponse.json({ error: "Quest not found" }, { status: 404 });
      }
      manager.processQuest(targetQuest).catch(() => {});
      const questName = targetQuest.config?.messages?.quest_name || targetQuest.config?.messages?.game_title || "Discord Quest";
      return NextResponse.json({ success: true, message: `Started processing quest ${questName}` });
    } else {
      manager.runAllQuests().catch(() => {});
      return NextResponse.json({ success: true, message: "Started processing all active quests" });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to process quests";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
