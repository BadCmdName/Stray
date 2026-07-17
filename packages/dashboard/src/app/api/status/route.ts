import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isDaemonRunning } from "../../../lib/manager";

export async function GET() {
  const configPath = path.resolve(process.cwd(), "../skeletal/stray.config.json");
  let config = {};
  try {
    const text = await fs.readFile(configPath, "utf-8");
    config = JSON.parse(text);
  } catch {}

  const isRunning = isDaemonRunning("default-user");

  return NextResponse.json({
    isRunning,
    config
  });
}
