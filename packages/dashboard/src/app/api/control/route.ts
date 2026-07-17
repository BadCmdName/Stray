import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { startDaemon, stopDaemon, updateDaemonPresence } from "../../../lib/manager";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, config } = body;
    const configPath = path.resolve(process.cwd(), "../skeletal/stray.config.json");

    if (config) {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
    }

    if (action === "START") {
      startDaemon("default-user", config.token, config);
    } else if (action === "STOP") {
      stopDaemon("default-user");
    } else if (action === "UPDATE" && config) {
      updateDaemonPresence("default-user", config);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
