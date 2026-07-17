import { watch } from "fs";
import { join } from "path";

interface Config {
  token: string;
  status: string;
  device: string;
  custom_status?: {
    text: string;
    emoji?: any;
  };
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
    start_time?: any;
  };
}

let configPath = join(process.cwd(), "stray.config.json");
let currentConfig: Config | null = null;
let client: GatewayClient | null = null;

async function fetchExternalAsset(token: string, clientId: string, assetUrl: string): Promise<string | null> {
  if (!assetUrl || !assetUrl.startsWith("https://")) {
    return assetUrl || null;
  }
  try {
    const response = await fetch(`https://discord.com/api/v9/applications/${clientId}/external-assets`, {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ urls: [assetUrl] })
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json() as Array<{ external_asset_path: string }>;
    if (data && data[0] && data[0].external_asset_path) {
      return `mp:${data[0].external_asset_path}`;
    }
  } catch {
    return null;
  }
  return null;
}

class GatewayClient {
  private ws: WebSocket | null = null;
  private heartbeatInterval: any = null;
  private heartbeatAck = true;
  private lastSeq: number | null = null;
  private sessionId: string | null = null;
  private resumeGatewayUrl: string | null = null;
  private reconnectTimeout: any = null;
  private reconnectDelay = 1000;
  private activeToken: string;
  private deviceProperties: any = {};
  private startTime = Date.now();

  constructor(private cfg: Config) {
    this.activeToken = cfg.token;
    this.setupDeviceProperties();
  }

  private setupDeviceProperties() {
    const dev = this.cfg.device ? this.cfg.device.toLowerCase() : "desktop";
    if (dev === "mobile") {
      this.deviceProperties = {
        os: "Android",
        browser: "Discord Android",
        device: "emu64x",
        system_locale: "en-GB",
        has_client_mods: false,
        client_version: "267.0 - rn",
        release_channel: "alpha",
        device_vendor_id: crypto.randomUUID(),
        design_id: 2,
        browser_user_agent: "",
        browser_version: "",
        os_version: "34",
        client_build_number: 3616,
        client_event_source: null
      };
    } else if (dev === "web") {
      this.deviceProperties = {
        $os: "Windows",
        $browser: "Chrome",
        $device: "Windows"
      };
    } else if (dev === "embedded") {
      this.deviceProperties = {
        $os: "Xbox",
        $browser: "Discord Embedded",
        $device: "Xbox"
      };
    } else {
      this.deviceProperties = {
        $os: "Windows",
        $browser: "Discord Client",
        $device: "Windows"
      };
    }
  }

  public connect() {
    this.clearHeartbeat();
    const url = this.resumeGatewayUrl && this.sessionId ? this.resumeGatewayUrl : "wss://gateway.discord.gg/?v=9&encoding=json";
    
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectDelay = 1000;
    };

    this.ws.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data as string);
        const { op, d, t, s } = payload;

        if (s !== undefined && s !== null) {
          this.lastSeq = s;
        }

        if (op === 10) {
          this.heartbeatAck = true;
          this.startHeartbeat(d.heartbeat_interval);

          if (this.sessionId) {
            this.sendResume();
          } else {
            await this.sendIdentify();
          }
        } else if (op === 11) {
          this.heartbeatAck = true;
        } else if (op === 1) {
          this.sendHeartbeat();
        } else if (op === 9) {
          this.sessionId = null;
          this.resumeGatewayUrl = null;
          await this.sendIdentify();
        } else if (op === 0) {
          if (t === "READY") {
            this.sessionId = d.session_id;
            this.resumeGatewayUrl = d.resume_gateway_url;
            console.log(`Stray: Logged in as ${d.user.username}#${d.user.discriminator}`);
          }
        }
      } catch (err) {
        console.error("Stray: Error processing gateway message:", err);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`Stray: Gateway disconnected. Code: ${event.code}, Reason: ${event.reason}`);
      this.clearHeartbeat();

      if (event.code === 4004 || event.code >= 4010) {
        console.error("Stray: Terminal close code received. Exiting.");
        process.exit(1);
      }

      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error("Stray: Gateway socket error:", err);
    };
  }

  private startHeartbeat(interval: number) {
    this.clearHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (!this.heartbeatAck) {
        console.warn("Heartbeat missed. Reconnecting.");
        this.ws?.close();
        return;
      }
      this.heartbeatAck = false;
      this.sendHeartbeat();
    }, interval);
  }

  private clearHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private sendHeartbeat() {
    this.sendJson({
      op: 1,
      d: this.lastSeq
    });
  }

  private async sendIdentify() {
    const activities = await this.buildActivities();
    const payload = {
      op: 2,
      d: {
        token: this.activeToken,
        capabilities: 16381,
        properties: this.deviceProperties,
        presence: {
          status: this.cfg.status || "online",
          since: 0,
          activities: activities,
          afk: false
        },
        compress: false,
        client_state: {
          guild_versions: {},
          highest_last_message_id: "0",
          read_state_version: 0,
          user_guild_settings_version: -1,
          user_settings_version: -1,
          private_channels_version: "0",
          api_code_version: 0
        }
      }
    };
    this.sendJson(payload);
  }

  private sendResume() {
    const payload = {
      op: 6,
      d: {
        token: this.activeToken,
        session_id: this.sessionId,
        seq: this.lastSeq
      }
    };
    this.sendJson(payload);
  }

  public async updatePresence(newConfig: Config) {
    this.cfg = newConfig;
    this.setupDeviceProperties();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const activities = await this.buildActivities();
      this.sendJson({
        op: 3,
        d: {
          since: 0,
          activities: activities,
          status: this.cfg.status || "online",
          afk: false
        }
      });
    }
  }

  private async buildActivities() {
    const activities: any[] = [];
    if (this.cfg.custom_status && this.cfg.custom_status.text) {
      activities.push({
        name: "Custom Status",
        type: 4,
        state: this.cfg.custom_status.text,
        emoji: this.cfg.custom_status.emoji || null
      });
    }

    if (this.cfg.rich_presence && this.cfg.rich_presence.enabled) {
      const rpc = this.cfg.rich_presence;
      let largeImageResolved: string | null = null;
      let smallImageResolved: string | null = null;

      if (rpc.client_id) {
        if (rpc.large_image) {
          largeImageResolved = await fetchExternalAsset(this.activeToken, rpc.client_id, rpc.large_image);
        }
        if (rpc.small_image) {
          smallImageResolved = await fetchExternalAsset(this.activeToken, rpc.client_id, rpc.small_image);
        }
      }

      activities.push({
        name: rpc.name || "Stray Cat",
        type: 0,
        application_id: rpc.client_id || null,
        state: rpc.state || null,
        details: rpc.details || null,
        assets: {
          large_image: largeImageResolved,
          large_text: rpc.large_text || null,
          small_image: smallImageResolved,
          small_text: rpc.small_text || null
        },
        timestamps: {
          start: this.startTime
        }
      });
    }

    return activities;
  }

  private sendJson(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    console.log(`Stray: Reconnecting in ${this.reconnectDelay}ms...`);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
      this.connect();
    }, this.reconnectDelay);
  }

  public disconnect() {
    this.clearHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }
}

async function loadConfig(): Promise<Config | null> {
  try {
    const file = Bun.file(configPath);
    if (await file.exists()) {
      const text = await file.text();
      return JSON.parse(text) as Config;
    }
  } catch (err) {
    console.error("Stray: Failed to load config file:", err);
  }

  if (process.env.DISCORD_TOKEN) {
    return {
      token: process.env.DISCORD_TOKEN,
      status: process.env.STATUS_TYPE || "online",
      device: process.env.DEVICE_TYPE || "desktop",
      custom_status: process.env.CUSTOM_STATUS ? { text: process.env.CUSTOM_STATUS } : undefined,
      rich_presence: process.env.RPC_ENABLED === "true" ? {
        enabled: true,
        client_id: process.env.RPC_CLIENT_ID || "",
        name: process.env.RPC_NAME || "",
        state: process.env.RPC_STATE || "",
        details: process.env.RPC_DETAILS || "",
        large_image: process.env.RPC_LARGE_IMAGE || "",
        large_text: process.env.RPC_LARGE_TEXT || "",
        small_image: process.env.RPC_SMALL_IMAGE || "",
        small_text: process.env.RPC_SMALL_TEXT || ""
      } : undefined
    };
  }

  return null;
}

async function start() {
  const loaded = await loadConfig();
  if (!loaded || !loaded.token) {
    console.error("Stray: No authorization token configured. Exiting.");
    process.exit(1);
  }

  currentConfig = loaded;
  client = new GatewayClient(currentConfig as Config);
  client.connect();

  try {
    watch(configPath, async (event: string) => {
      if (event === "change") {
        const next = await loadConfig();
        if (next && client) {
          console.log("Stray: Config change detected. Updating presence...");
          currentConfig = next;
          await client.updatePresence(currentConfig);
        }
      }
    });
  } catch {}
}

start();

process.stdin.setEncoding("utf-8");
process.stdin.on("data", async (chunk: string) => {
  const lines = chunk.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const msg = JSON.parse(trimmed);
      if (msg.type === "UPDATE_PRESENCE" && msg.data) {
        if (client) {
          console.log("Stray: Updating presence via process message...");
          await client.updatePresence(msg.data);
        }
      } else if (msg.type === "STOP") {
        console.log("Stray: Stop request received. Exiting.");
        if (client) {
          client.disconnect();
        }
        process.exit(0);
      }
    } catch {}
  }
});
