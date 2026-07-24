import WebSocket from "ws";
import * as emoji from "node-emoji";
import { getUser, getDb } from "./db";
import { decrypt } from "./encryption";
import { restoreUserFromCloud } from "./cloudDb";

export interface StrayConfig {
  token: string;
  status: string;
  device: string;
  webhookUrl?: string;
  custom_status?: { text: string; emoji?: string };
  rich_presence?: {
    enabled: boolean;
    type?: number;
    url?: string;
    client_id: string;
    name: string;
    state: string;
    details: string;
    large_image: string;
    large_text: string;
    small_image: string;
    small_text: string;
  };
  rotationEnabled?: boolean;
  rotationInterval?: number;
  rotationStatus1Text?: string | null;
  rotationStatus1Emoji?: string | null;
  rotationStatus2Text?: string | null;
  rotationStatus2Emoji?: string | null;
  rotationStatus3Text?: string | null;
  rotationStatus3Emoji?: string | null;
}

declare global {
  var strayLogs: Map<string, string[]> | undefined;
  var activeStrayClients: Map<string, StrayClient> | undefined;
  var hasBootRestored: boolean | undefined;
  var activeQuestStatus: Map<string, { isProcessing: boolean; activeQuestName?: string; progressPct?: number; appId?: string; startTime?: number }> | undefined;
}

if (!globalThis.strayLogs) {
  globalThis.strayLogs = new Map();
}

if (!globalThis.activeStrayClients) {
  globalThis.activeStrayClients = new Map();
}

if (!globalThis.activeQuestStatus) {
  globalThis.activeQuestStatus = new Map();
}

const activeClients = globalThis.activeStrayClients;

export function setQuestProcessingStatus(userId: string, isProcessing: boolean, activeQuestName?: string, progressPct?: number, appId?: string) {
  if (isProcessing) {
    const existing = globalThis.activeQuestStatus?.get(userId);
    const startTime = existing?.startTime || Date.now();
    globalThis.activeQuestStatus?.set(userId, { isProcessing: true, activeQuestName, progressPct, appId, startTime });
  } else {
    globalThis.activeQuestStatus?.delete(userId);
  }

  const client = activeClients?.get(userId);
  if (client) {
    client.triggerPresenceUpdate();
  }
}

export function getQuestProcessingStatus(userId: string) {
  return globalThis.activeQuestStatus?.get(userId) || null;
}

export function addLog(userId: string, message: string) {
  const logs = globalThis.strayLogs?.get(userId) || [];
  const time = new Date().toLocaleTimeString();
  logs.push(`[${time}] ${message}`);
  if (logs.length > 50) logs.shift();
  globalThis.strayLogs?.set(userId, logs);

  const user = getUser(userId);
  if (user?.webhookUrl) {
    fetch(user.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `\`\`\`[${time}] ${message}\`\`\``,
        username: "Stray Alley Logs",
        avatar_url: "https://stray.bcnstudio.tech/Stray.png",
      }),
    }).catch(() => {});
  }
}

function parseEmoji(emojiStr: string) {
  if (!emojiStr) return null;
  const trimmed = emojiStr.trim();
  const customEmojiRegex = /^<a?:?([a-zA-Z0-9_]+):([0-9]+)>$/;
  const match = trimmed.match(customEmojiRegex);
  if (match) {
    return {
      name: match[1],
      id: match[2],
      animated: trimmed.startsWith("<a:"),
    };
  }

  if (trimmed.startsWith(":") && trimmed.endsWith(":")) {
    const code = trimmed.slice(1, -1);
    const resolved = emoji.get(code);
    if (resolved && resolved !== code) {
      return {
        name: resolved,
        id: null,
        animated: false,
      };
    }
  }

  return {
    name: trimmed,
    id: null,
    animated: false,
  };
}

class StrayClient {
  private userId: string;
  private config: StrayConfig;
  private ws: WebSocket | null = null;
  private heartbeatInterval: any = null;
  private reconnectTimeout: any = null;
  private rotationIntervalTimer: any = null;
  private currentRotationIndex: number = 0;
  private sequence: number | null = null;
  private active: boolean = true;
  private lastLargeImage: string = "";
  private lastSmallImage: string = "";

  constructor(userId: string, config: StrayConfig) {
    this.userId = userId;
    this.config = config;
  }

  async connect() {
    if (!this.active) return;
    addLog(this.userId, "Initiating gateway connection...");
    try {
      let largeImage = this.config.rich_presence?.large_image || "";
      let smallImage = this.config.rich_presence?.small_image || "";

      if (this.config.rich_presence?.enabled && this.config.rich_presence.client_id) {
        const token = this.config.token;
        const clientId = this.config.rich_presence.client_id;
        if (largeImage.startsWith("http")) {
          addLog(this.userId, "Registering large rich presence asset...");
          largeImage = await registerAsset(token, clientId, largeImage);
        }
        if (smallImage.startsWith("http")) {
          addLog(this.userId, "Registering small rich presence asset...");
          smallImage = await registerAsset(token, clientId, smallImage);
        }
      }

      this.lastLargeImage = largeImage;
      this.lastSmallImage = smallImage;

      this.ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      this.ws.on("open", () => {
        addLog(this.userId, "Connection established. Awaiting gateway hello...");
      });

      this.ws.on("message", (data: any) => {
        try {
          const msg = JSON.parse(data.toString());
          this.handleMessage(msg, largeImage, smallImage);
        } catch (err: any) {
          addLog(this.userId, `Failed to parse gateway message: ${err.message}`);
        }
      });

      this.ws.on("close", (code: number, reason: Buffer) => {
        const reasonStr = reason ? reason.toString() : "No reason provided";
        addLog(this.userId, `Connection closed (Code: ${code}, Reason: ${reasonStr})`);
        this.cleanupTimers();
        if (this.active) {
          if (code === 4004) {
            addLog(this.userId, "Token is invalid (Code 4004). Stopping client.");
            this.active = false;
            return;
          }
          if (code === 4005 || code === 4009) {
            addLog(this.userId, "Session conflict or timeout detected. Forcing immediate reconnect...");
            this.reconnectTimeout = setTimeout(() => this.connect(), 1000);
          } else {
            addLog(this.userId, "Reconnecting in 5 seconds...");
            this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
          }
        }
      });

      this.ws.on("error", (err: any) => {
        addLog(this.userId, `Gateway WebSocket error: ${err.message}`);
      });
    } catch (err: any) {
      addLog(this.userId, `Connection setup error: ${err.message}`);
    }
  }

  private handleMessage(msg: any, largeImage: string, smallImage: string) {
    if (msg.s !== null && msg.s !== undefined) {
      this.sequence = msg.s;
    }

    switch (msg.op) {
      case 10:
        const heartbeatIntervalMs = msg.d.heartbeat_interval;
        addLog(this.userId, `Received hello (Heartbeat interval: ${heartbeatIntervalMs}ms)`);
        this.startHeartbeat(heartbeatIntervalMs);
        this.sendIdentify(largeImage, smallImage);
        break;

      case 11:
        break;

      case 0:
        if (msg.t === "READY") {
          const tag = `${msg.d.user.username}#${msg.d.user.discriminator || "0"}`;
          addLog(this.userId, `Gateway session READY! Authenticated as ${tag} (ID: ${msg.d.user.id})`);
          this.startRotationLoop(largeImage, smallImage);
        }
        break;

      default:
        break;
    }
  }

  private startHeartbeat(intervalMs: number) {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ op: 1, d: this.sequence }));
      }
    }, intervalMs);
  }

  private sendIdentify(largeImage: string, smallImage: string) {
    let os = "Windows";
    let browser = "Chrome";
    let device = "";

    if (this.config.device === "mobile") {
      os = "Android";
      browser = "Discord Android";
      device = "Discord Android";
    } else if (this.config.device === "embedded") {
      os = "Xbox One";
      browser = "Discord Embedded";
      device = "Xbox One";
    }

    const activities: any[] = [];

    let customStatusText = this.config.custom_status?.text || "";
    let customStatusEmoji = this.config.custom_status?.emoji || "";

    if (this.config.rotationEnabled) {
      if (this.config.rotationStatus1Text || this.config.rotationStatus1Emoji) {
        customStatusText = this.config.rotationStatus1Text || "";
        customStatusEmoji = this.config.rotationStatus1Emoji || "";
      } else if (this.config.rotationStatus2Text || this.config.rotationStatus2Emoji) {
        customStatusText = this.config.rotationStatus2Text || "";
        customStatusEmoji = this.config.rotationStatus2Emoji || "";
      } else if (this.config.rotationStatus3Text || this.config.rotationStatus3Emoji) {
        customStatusText = this.config.rotationStatus3Text || "";
        customStatusEmoji = this.config.rotationStatus3Emoji || "";
      }
    }

    if (customStatusText || customStatusEmoji) {
      activities.push({
        type: 4,
        name: "Custom Status",
        state: customStatusText,
        emoji: customStatusEmoji ? parseEmoji(customStatusEmoji) : null,
      });
    }

    const rpcActivity = this.buildRpcActivity(largeImage, smallImage);
    if (rpcActivity) {
      activities.push(rpcActivity);
    }

    const payload = {
      op: 2,
      d: {
        token: this.config.token.trim(),
        properties: {
          os: os,
          browser: browser,
          device: device,
        },
        presence: {
          status: this.config.status,
          since: 0,
          activities,
          afk: false,
        },
      },
    };

    this.ws?.send(JSON.stringify(payload));
  }

  private startRotationLoop(largeImage: string, smallImage: string) {
    if (this.rotationIntervalTimer) {
      clearInterval(this.rotationIntervalTimer);
      this.rotationIntervalTimer = null;
    }

    if (this.config.rotationEnabled) {
      const statuses: { text: string; emoji: string }[] = [];
      if (this.config.rotationStatus1Text || this.config.rotationStatus1Emoji) {
        statuses.push({
          text: this.config.rotationStatus1Text || "",
          emoji: this.config.rotationStatus1Emoji || "",
        });
      }
      if (this.config.rotationStatus2Text || this.config.rotationStatus2Emoji) {
        statuses.push({
          text: this.config.rotationStatus2Text || "",
          emoji: this.config.rotationStatus2Emoji || "",
        });
      }
      if (this.config.rotationStatus3Text || this.config.rotationStatus3Emoji) {
        statuses.push({
          text: this.config.rotationStatus3Text || "",
          emoji: this.config.rotationStatus3Emoji || "",
        });
      }

      if (statuses.length > 0) {
        this.currentRotationIndex = 0;
        this.updateRotationPresence(statuses[0], largeImage, smallImage);

        const intervalMs = (this.config.rotationInterval || 10) * 1000;
        addLog(this.userId, `Starting status rotation loop (Interval: ${this.config.rotationInterval || 10}s)`);

        this.rotationIntervalTimer = setInterval(() => {
          this.currentRotationIndex = (this.currentRotationIndex + 1) % statuses.length;
          this.updateRotationPresence(statuses[this.currentRotationIndex], largeImage, smallImage);
        }, intervalMs);
        return;
      }
    }

    this.updatePresence(largeImage, smallImage);
  }

  private updateRotationPresence(currentStatus: { text: string; emoji: string }, largeImage: string, smallImage: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const activities: any[] = [];

    if (currentStatus.text || currentStatus.emoji) {
      activities.push({
        type: 4,
        name: "Custom Status",
        state: currentStatus.text,
        emoji: currentStatus.emoji ? parseEmoji(currentStatus.emoji) : null,
      });
    }

    const rpcActivity = this.buildRpcActivity(largeImage, smallImage);
    if (rpcActivity) {
      activities.push(rpcActivity);
    }

    const payload = {
      op: 3,
      d: {
        since: 0,
        activities,
        status: this.config.status,
        afk: false,
      },
    };

    this.ws.send(JSON.stringify(payload));
  }

  public triggerPresenceUpdate() {
    this.updatePresence(this.lastLargeImage, this.lastSmallImage);
  }

  private updatePresence(largeImage: string, smallImage: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const activities: any[] = [];

    if (this.config.custom_status?.text || this.config.custom_status?.emoji) {
      activities.push({
        type: 4,
        name: "Custom Status",
        state: this.config.custom_status?.text || "",
        emoji: this.config.custom_status?.emoji ? parseEmoji(this.config.custom_status.emoji) : null,
      });
    }

    const rpcActivity = this.buildRpcActivity(largeImage, smallImage);
    if (rpcActivity) {
      activities.push(rpcActivity);
    }

    const payload = {
      op: 3,
      d: {
        since: 0,
        activities,
        status: this.config.status,
        afk: false,
      },
    };

    this.ws.send(JSON.stringify(payload));
  }

  private buildRpcActivity(largeImage: string, smallImage: string) {
    const qStatus = getQuestProcessingStatus(this.userId);
    const user = getUser(this.userId);
    const isQuestRpcActive = user?.liveRpcQuests || qStatus?.isProcessing;

    if (isQuestRpcActive && qStatus?.activeQuestName) {
      const pct = qStatus.progressPct !== undefined ? `Progress: ${qStatus.progressPct}% | via Stray` : "In Progress | via Stray";
      return {
        name: qStatus.activeQuestName,
        type: 0,
        details: "Completing Discord Quest",
        state: pct,
        application_id: "1018195507560063039",
        buttons: ["Completing with Stray", "Get Stray"],
        metadata: {
          button_urls: ["https://stray.bcnstudio.tech", "https://github.com/BadCmdName/Stray"],
        },
        timestamps: { start: qStatus.startTime || Date.now() },
      };
    }

    if (!this.config.rich_presence?.enabled) return null;

    const rpc = this.config.rich_presence;
    const rpcType = Number(rpc.type) || 0;

    const activity: any = {
      name: rpc.name || "Stray",
      type: rpcType,
      timestamps: { start: Date.now() },
    };

    if (rpc.details) activity.details = rpc.details;
    if (rpc.state) activity.state = rpc.state;
    if (rpc.client_id) activity.application_id = rpc.client_id;
    if (rpcType === 1 && rpc.url) activity.url = rpc.url;

    if (largeImage || smallImage || rpc.large_text || rpc.small_text) {
      activity.assets = {};
      if (largeImage) activity.assets.large_image = largeImage;
      if (rpc.large_text) activity.assets.large_text = rpc.large_text;
      if (smallImage) activity.assets.small_image = smallImage;
      if (rpc.small_text) activity.assets.small_text = rpc.small_text;
    }

    return activity;
  }

  private cleanupTimers() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.rotationIntervalTimer) {
      clearInterval(this.rotationIntervalTimer);
      this.rotationIntervalTimer = null;
    }
  }

  goInvisibleAndStop() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        addLog(this.userId, "Going stealth (invisible)...");
        const payload = {
          op: 3,
          d: {
            since: 0,
            activities: [],
            status: "invisible",
            afk: false,
          },
        };
        this.ws.send(JSON.stringify(payload));
      } catch {}
    }
    this.stop();
  }

  stop() {
    this.active = false;
    this.cleanupTimers();
    if (this.ws) {
      try {
        addLog(this.userId, "Client stopped by dashboard user.");
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }
}

async function registerAsset(token: string, clientId: string, imageUrl: string): Promise<string> {
  try {
    const res = await fetch(`https://discord.com/api/v9/applications/${clientId}/external-assets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.trim(),
      },
      body: JSON.stringify({ urls: [imageUrl] }),
    });
    if (!res.ok) return imageUrl;
    const data = await res.json();
    return data[0]?.external_asset_path || imageUrl;
  } catch {
    return imageUrl;
  }
}

export function startDaemon(userId: string, config: StrayConfig) {
  stopDaemon(userId);
  const client = new StrayClient(userId, config);
  activeClients.set(userId, client);
  client.connect();
}

export function stopDaemon(userId: string) {
  const client = activeClients.get(userId);
  if (client) {
    client.goInvisibleAndStop();
    activeClients.delete(userId);
  }
}

export function getDaemonStatus(userId: string): boolean {
  return activeClients.has(userId);
}

export function isDaemonRunning(userId: string): boolean {
  return getDaemonStatus(userId);
}

export function getDaemonLogs(userId: string): string[] {
  return globalThis.strayLogs?.get(userId) || [];
}

export async function restoreAllDaemons() {
  const db = getDb();
  if (!db || !db.users) return;

  const isBoot = !globalThis.hasBootRestored;
  if (isBoot) {
    globalThis.hasBootRestored = true;
  }

  for (const [userId, user] of Object.entries(db.users)) {
    if (isBoot || (!user.discordToken && user.cloudSyncEnabled)) {
      await restoreUserFromCloud(userId);
    }

    const updatedUser = getUser(userId) || user;
    if (updatedUser.botEnabled && updatedUser.discordToken && !getDaemonStatus(userId)) {
      try {
        const token = decrypt(updatedUser.discordToken);
        if (token) {
          const config: StrayConfig = {
            token,
            status: updatedUser.status || "online",
            device: updatedUser.device || "desktop",
            webhookUrl: updatedUser.webhookUrl || "",
            rotationEnabled: updatedUser.rotationEnabled || false,
            rotationInterval: updatedUser.rotationInterval || 10,
            rotationStatus1Text: updatedUser.rotationStatus1Text || "",
            rotationStatus1Emoji: updatedUser.rotationStatus1Emoji || "",
            rotationStatus2Text: updatedUser.rotationStatus2Text || "",
            rotationStatus2Emoji: updatedUser.rotationStatus2Emoji || "",
            rotationStatus3Text: updatedUser.rotationStatus3Text || "",
            rotationStatus3Emoji: updatedUser.rotationStatus3Emoji || "",
            custom_status: {
              text: updatedUser.customStatusText || "",
              emoji: updatedUser.customStatusEmoji || "",
            },
            rich_presence: {
              enabled: updatedUser.rpcEnabled || false,
              type: updatedUser.rpcType ?? 0,
              url: updatedUser.rpcUrl || "",
              client_id: updatedUser.rpcClientId || "",
              name: updatedUser.rpcName || "",
              state: updatedUser.rpcState || "",
              details: updatedUser.rpcDetails || "",
              large_image: updatedUser.rpcLargeImage || "",
              large_text: updatedUser.rpcLargeText || "",
              small_image: updatedUser.rpcSmallImage || "",
              small_text: updatedUser.rpcSmallText || "",
            },
          };
          addLog(userId, "Auto-restoring gateway session from cloud storage on server boot...");
          startDaemon(userId, config);
        }
      } catch (err: any) {
        addLog(userId, `Failed to auto-restore session: ${err.message}`);
      }
    }
  }
}

export type { StrayClient };
