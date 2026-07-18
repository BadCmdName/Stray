import WebSocket from "ws";

export interface StrayConfig {
  token: string;
  status: string;
  device: string;
  custom_status?: { text: string };
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
    try {
      let largeImage = this.config.rich_presence?.large_image || "";
      let smallImage = this.config.rich_presence?.small_image || "";

      if (this.config.rich_presence?.enabled && this.config.rich_presence.client_id) {
        const token = this.config.token;
        const clientId = this.config.rich_presence.client_id;
        if (largeImage.startsWith("http")) {
          largeImage = await registerAsset(token, clientId, largeImage);
        }
        if (smallImage.startsWith("http")) {
          smallImage = await registerAsset(token, clientId, smallImage);
        }
      }

      this.ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      this.ws.on("open", () => {});

      this.ws.on("message", (data: any) => {
        const msg = JSON.parse(data.toString());
        this.handleMessage(msg, largeImage, smallImage);
      });

      this.ws.on("close", () => {
        this.cleanupTimers();
        if (this.active) {
          this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
        }
      });

      this.ws.on("error", () => {});
    } catch {
      if (this.active) {
        this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
      }
    }
  }

  private handleMessage(msg: any, largeImage: string, smallImage: string) {
    if (msg.s !== undefined && msg.s !== null) {
      this.sequence = msg.s;
    }

    switch (msg.op) {
      case 10:
        const interval = msg.d.heartbeat_interval;
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

    let os = "Windows";
    let browser = "Discord Client";
    let device = "Discord Client";

    if (this.config.device === "mobile") {
      os = "Android";
      browser = "Discord Android";
      device = "Discord Android";
    } else if (this.config.device === "web") {
      os = "Windows";
      browser = "Chrome";
      device = "";
    } else if (this.config.device === "embedded") {
      os = "Xbox One";
      browser = "Discord Embedded";
      device = "Xbox One";
    }

    const activities: any[] = [];

    if (this.config.custom_status?.text) {
      activities.push({
        type: 4,
        name: "Custom Status",
        state: this.config.custom_status.text,
        emoji: null,
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
        token: this.config.token,
        capabilities: 125,
        properties: {
          $os: os,
          $browser: browser,
          $device: device,
          $system_locale: "en-US",
          $browser_user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          $browser_version: "120.0",
          $os_version: "10",
          $referrer: "",
          $referring_domain: "",
          $referrer_current: "",
          $referring_domain_current: "",
          $release_channel: "stable",
          $client_build_number: 250000,
          $client_event_source: null,
        },
        presence: {
          status: this.config.status,
          since: 0,
          activities,
          afk: false,
        },
        compress: false,
        client_state: {
          guild_versions: {},
          highest_last_message_id: "0",
          read_state_version_0: 0,
          user_guild_settings_version: -1,
          user_settings_version: -1,
        },
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

  stop() {
    this.active = false;
    this.cleanupTimers();
    if (this.ws) {
      try {
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
        Authorization: token,
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

declare global {
  var activeStrayClients: Map<string, StrayClient> | undefined;
}

if (!globalThis.activeStrayClients) {
  globalThis.activeStrayClients = new Map();
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
    client.stop();
    activeClients.delete(userId);
  }
}

export function getDaemonStatus(userId: string): boolean {
  return activeClients.has(userId);
}
export type { StrayClient };
