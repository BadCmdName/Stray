import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUser } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { QuestManager } from "@/lib/questManager";

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
    return NextResponse.json({ quests });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch quests";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
      return NextResponse.json({ success: true, message: `Started processing quest ${targetQuest.config.messages.quest_name}` });
    } else {
      manager.runAllQuests().catch(() => {});
      return NextResponse.json({ success: true, message: "Started processing all active quests" });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to process quests";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
