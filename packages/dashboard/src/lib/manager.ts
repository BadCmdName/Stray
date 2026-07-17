import { spawn, ChildProcess } from "child_process";
import path from "path";

const activeProcesses = new Map<string, ChildProcess>();

export function startDaemon(userId: string, token: string, config: any) {
  if (activeProcesses.has(userId)) {
    stopDaemon(userId);
  }

  const skeletalPath = path.resolve(process.cwd(), "../skeletal/index.ts");

  const child = spawn("bun", ["run", skeletalPath], {
    env: {
      ...process.env,
      DISCORD_TOKEN: token
    },
    stdio: ["pipe", "pipe", "pipe"]
  });

  child.stdout?.on("data", (data) => {
    console.log(`[Daemon ${userId}] stdout:`, data.toString().trim());
  });

  child.stderr?.on("data", (data) => {
    console.error(`[Daemon ${userId}] stderr:`, data.toString().trim());
  });

  child.on("close", (code) => {
    console.log(`[Daemon ${userId}] exited with code ${code}`);
    activeProcesses.delete(userId);
  });

  activeProcesses.set(userId, child);

  updateDaemonPresence(userId, config);
}

export function updateDaemonPresence(userId: string, config: any) {
  const child = activeProcesses.get(userId);
  if (child && child.stdin && !child.stdin.destroyed) {
    const payload = JSON.stringify({
      type: "UPDATE_PRESENCE",
      data: config
    }) + "\n";
    child.stdin.write(payload);
  }
}

export function stopDaemon(userId: string) {
  const child = activeProcesses.get(userId);
  if (child) {
    if (child.stdin && !child.stdin.destroyed) {
      child.stdin.write(JSON.stringify({ type: "STOP" }) + "\n");
    } else {
      child.kill("SIGTERM");
    }
    activeProcesses.delete(userId);
  }
}

export function isDaemonRunning(userId: string): boolean {
  return activeProcesses.has(userId);
}
