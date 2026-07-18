import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { startDaemon, stopDaemon } from "@/lib/daemon";
import { encrypt } from "@/lib/encryption";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, config } = body;

    if (config) {
      const encryptedToken = config.token ? encrypt(config.token) : "";
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          discordToken: encryptedToken,
          status: config.status,
          device: config.device,
          customStatusText: config.custom_status?.text || null,
          rpcEnabled: config.rich_presence?.enabled || false,
          rpcClientId: config.rich_presence?.client_id || null,
          rpcName: config.rich_presence?.name || null,
          rpcState: config.rich_presence?.state || null,
          rpcDetails: config.rich_presence?.details || null,
          rpcLargeImage: config.rich_presence?.large_image || null,
          rpcLargeText: config.rich_presence?.large_text || null,
          rpcSmallImage: config.rich_presence?.small_image || null,
          rpcSmallText: config.rich_presence?.small_text || null,
        },
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
