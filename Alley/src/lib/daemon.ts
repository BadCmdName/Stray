import WebSocket from "ws";
import * as emoji from "node-emoji";
import { getUser } from "./db";

export interface StrayConfig {
  token: string;
  status: string;
  device: string;
  custom_status?: { text: string; emoji?: string };
  rich_presence?: {
    enabled: boolean;
    client_id: string;
    name: string;
    state: string;
    details: string;
    large_image: string;
    large_text: string;
    small_image: string;
    small_text: string;
  };
}

declare global {
  var strayLogs: Map<string, string[]> | undefined;
  var activeStrayClients: Map<string, StrayClient> | undefined;
}

if (!globalThis.strayLogs) {
  globalThis.strayLogs = new Map();
}

if (!globalThis.activeStrayClients) {
  globalThis.activeStrayClients = new Map();
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

export function getLogs(userId: string): string[] {
  return globalThis.strayLogs?.get(userId) || [];
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
  private sequence: number | null = null;
  private active: boolean = true;

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
        addLog(this.userId, `Socket connection error: ${err.message}`);
      });
    } catch (err: any) {
      addLog(this.userId, `Failed to connect: ${err.message}`);
      if (this.active) {
        this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
      }
    }
  }

  private handleMessage(msg: any, largeImage: string, smallImage: string) {
    if (msg.s !== undefined && msg.s !== null) {
      this.sequence = msg.s;
    }

    if (msg.t === "READY") {
      addLog(this.userId, `Gateway session is READY. User: ${msg.d.user.username}`);
      this.updatePresence(largeImage, smallImage);
    }

    switch (msg.op) {
      case 10:
        const interval = msg.d.heartbeat_interval;
        addLog(this.userId, `Hello received. Starting heartbeat every ${interval}ms`);
        this.heartbeatInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ op: 1, d: this.sequence }));
          }
        }, interval);
        this.identify(largeImage, smallImage);
        break;
      case 11:
        break;
    }
  }

  private identify(largeImage: string, smallImage: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    addLog(this.userId, "Identifying with Discord gateway...");

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

    if (this.config.custom_status?.text || this.config.custom_status?.emoji) {
      activities.push({
        type: 4,
        name: "Custom Status",
        state: this.config.custom_status?.text || "",
        emoji: this.config.custom_status?.emoji ? parseEmoji(this.config.custom_status.emoji) : null,
      });
    }

    if (this.config.rich_presence?.enabled) {
      activities.push({
        type: 0,
        name: this.config.rich_presence.name,
        application_id: this.config.rich_presence.client_id,
        state: this.config.rich_presence.state,
        details: this.config.rich_presence.details,
        assets: {
          large_image: largeImage || undefined,
          large_text: this.config.rich_presence.large_text || undefined,
          small_image: smallImage || undefined,
          small_text: this.config.rich_presence.small_text || undefined,
        },
        timestamps: {
          start: Date.now(),
        },
      });
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

    this.ws.send(JSON.stringify(payload));
  }

  private updatePresence(largeImage: string, smallImage: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    addLog(this.userId, "Broadcasting presence update payload...");

    const activities: any[] = [];

    if (this.config.custom_status?.text || this.config.custom_status?.emoji) {
      activities.push({
        type: 4,
        name: "Custom Status",
        state: this.config.custom_status?.text || "",
        emoji: this.config.custom_status?.emoji ? parseEmoji(this.config.custom_status.emoji) : null,
      });
    }

    if (this.config.rich_presence?.enabled) {
      activities.push({
        type: 0,
        name: this.config.rich_presence.name,
        application_id: this.config.rich_presence.client_id,
        state: this.config.rich_presence.state,
        details: this.config.rich_presence.details,
        assets: {
          large_image: largeImage || undefined,
          large_text: this.config.rich_presence.large_text || undefined,
          small_image: smallImage || undefined,
          small_text: this.config.rich_presence.small_text || undefined,
        },
        timestamps: {
          start: Date.now(),
        },
      });
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

  private cleanupTimers() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
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

const activeClients = globalThis.activeStrayClients;

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
export type { StrayClient };
