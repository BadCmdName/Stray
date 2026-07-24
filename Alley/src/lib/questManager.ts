import { addLog, setQuestProcessingStatus } from "./daemon";

export interface QuestTask {
  target: number;
}

export interface QuestConfig {
  id: string;
  config: {
    expires_at?: string;
    messages?: {
      quest_name?: string;
      game_title?: string;
    };
    application?: {
      id?: string;
      name?: string;
    };
    task_config_v2?: {
      tasks?: Record<string, QuestTask>;
    };
    assets?: {
      hero?: string;
      quest_bar_hero?: string;
      game_tile?: string;
    };
    rewards_config?: {
      platforms?: number[];
    };
  };
  user_status?: {
    enrolled_at?: string | null;
    completed_at?: string | null;
    claimed_at?: string | null;
    progress?: Record<string, { value: number }>;
  } | null;
  raw?: any;
}

const SUPER_PROPERTIES = Buffer.from(
  JSON.stringify({
    os: "Windows",
    browser: "Discord Client",
    release_channel: "stable",
    client_version: "1.0.9236",
    os_version: "10.0.19045",
    os_arch: "x64",
    app_arch: "x64",
    system_locale: "en-US",
    has_client_mods: false,
    client_build_number: 539951,
    native_build_number: 81687,
    client_event_source: null,
    client_app_state: "focused",
  })
).toString("base64");

export class QuestManager {
  private token: string;
  private userId: string;

  constructor(userId: string, token: string) {
    this.userId = userId;
    this.token = token.replace(/^["']|["']$/g, "").replace(/^Bot\s+/i, "").trim();
  }

  private getHeaders(isAndroid = false): Record<string, string> {
    return {
      Authorization: this.token,
      "Content-Type": "application/json",
      "Accept-Language": "en-US",
      "x-discord-locale": "en-US",
      "x-super-properties": SUPER_PROPERTIES,
      Origin: "https://discord.com",
      Referer: "https://discord.com/channels/@me",
      "User-Agent": isAndroid
        ? "Discord-Android/316011;RNA"
        : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9236 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36",
    };
  }

  async fetchQuests(): Promise<QuestConfig[]> {
    if (!this.token) {
      addLog(this.userId, "[DQACS] Error: No Discord token configured.");
      return [];
    }

    const endpoints = [
      "https://discord.com/api/v10/quests/@me",
      "https://discord.com/api/v9/quests/@me",
      "https://discord.com/api/v9/users/@me/quests",
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: this.getHeaders(),
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          let questsList: QuestConfig[] = [];

          if (Array.isArray(data)) {
            questsList = data;
          } else if (data && Array.isArray(data.quests)) {
            questsList = data.quests;
          }

          const now = Date.now();
          const activeQuests = questsList.filter((q) => {
            if (!q || !q.id) return false;
            if (q.user_status?.claimed_at) return false;
            if (q.config?.expires_at) {
              const expires = new Date(q.config.expires_at).getTime();
              if (!isNaN(expires) && expires < now) return false;
            }
            return true;
          });

          addLog(this.userId, `[DQACS] TOTAL QUESTS: ${activeQuests.length}`);
          return activeQuests;
        }
      } catch {}
    }

    addLog(this.userId, "[DQACS] TOTAL QUESTS: 0");
    return [];
  }

  async enrollQuest(questId: string, isAndroid = false): Promise<boolean> {
    try {
      const res = await fetch(`https://discord.com/api/v9/quests/${questId}/enroll`, {
        method: "POST",
        headers: this.getHeaders(isAndroid),
        body: JSON.stringify({
          location: isAndroid ? 12 : 11,
          is_targeted: false,
          metadata_sealed: null,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async completeVideoQuest(quest: QuestConfig, secondsNeeded: number, secondsDone: number): Promise<boolean> {
    const questName = quest.config?.messages?.quest_name || quest.config?.messages?.game_title || "Discord Quest";
    const appId = quest.config?.application?.id || "1018195507560063039";
    let currentDone = secondsDone;

    addLog(this.userId, `[DQACS] Video quest starting for “${questName}” (${secondsNeeded}s)...`);

    while (currentDone < secondsNeeded) {
      const speed = 7;
      const timestamp = Math.min(secondsNeeded, currentDone + speed);

      try {
        const res = await fetch(`https://discord.com/api/v9/quests/${quest.id}/video-progress`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            timestamp: timestamp + Math.random(),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          currentDone = timestamp;
          const pct = Math.floor((currentDone / secondsNeeded) * 100);
          setQuestProcessingStatus(this.userId, true, questName, pct, appId);
          addLog(this.userId, `[DQACS] Progress: ${pct}% (${Math.floor(currentDone)}s / ${secondsNeeded}s) for “${questName}”`);
          if (data.completed_at) {
            return true;
          }
        }
      } catch {}

      await new Promise((r) => setTimeout(r, 7000));
    }

    try {
      await fetch(`https://discord.com/api/v9/quests/${quest.id}/video-progress`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ timestamp: secondsNeeded }),
      });
    } catch {}

    return true;
  }

  async completePlayQuest(quest: QuestConfig, secondsNeeded: number, taskName: string): Promise<boolean> {
    const questName = quest.config?.messages?.quest_name || quest.config?.messages?.game_title || "Discord Quest";
    const appName = quest.config?.application?.name || questName;
    const appId = quest.config?.application?.id || "1018195507560063039";
    let completed = false;

    addLog(this.userId, `[DQACS] Heartbeat / Presence starting for “${questName}” (${appName})...`);

    while (!completed) {
      try {
        const res = await fetch(`https://discord.com/api/v9/quests/${quest.id}/heartbeat`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            application_id: quest.config?.application?.id,
            terminal: false,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.completed_at) {
            completed = true;
            break;
          }
          const done = data.progress?.[taskName]?.value || 0;
          const pct = secondsNeeded > 0 ? Math.floor((done / secondsNeeded) * 100) : 0;
          setQuestProcessingStatus(this.userId, true, questName, pct, appId);
          addLog(this.userId, `[DQACS] Progress: ${pct}% for “${questName}”`);
        }
      } catch {}

      await new Promise((r) => setTimeout(r, 20000));
    }

    try {
      await fetch(`https://discord.com/api/v9/quests/${quest.id}/heartbeat`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          application_id: quest.config?.application?.id,
          terminal: true,
        }),
      });
    } catch {}

    return true;
  }

  async processQuest(quest: QuestConfig): Promise<boolean> {
    const questName = quest.config?.messages?.quest_name || quest.config?.messages?.game_title || "Discord Quest";
    const appId = quest.config?.application?.id || "1018195507560063039";

    if (quest.user_status?.completed_at) {
      return true;
    }

    const tasks = quest.config?.task_config_v2?.tasks || {};
    const isAndroid = Boolean(tasks.WATCH_VIDEO_ON_MOBILE) && !Boolean(tasks.WATCH_VIDEO);

    if (!quest.user_status?.enrolled_at) {
      const enrolled = await this.enrollQuest(quest.id, isAndroid);
      if (!enrolled) {
        addLog(this.userId, `[DQACS] Failed to enroll in quest “${questName}”.`);
        return false;
      }
    }

    const taskName = Object.keys(tasks)[0];
    if (!taskName) return false;

    const secondsNeeded = tasks[taskName]?.target || 0;
    const secondsDone = quest.user_status?.progress?.[taskName]?.value || 0;

    setQuestProcessingStatus(this.userId, true, questName, 0, appId);

    let result = false;
    if (taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") {
      result = await this.completeVideoQuest(quest, secondsNeeded, secondsDone);
    } else {
      result = await this.completePlayQuest(quest, secondsNeeded, taskName);
    }

    return result;
  }

  async runAllQuests(): Promise<void> {
    const quests = await this.fetchQuests();
    const total = quests.length;
    addLog(this.userId, `[DQACS] TOTAL QUESTS: ${total}`);

    let completedCount = 0;
    for (let i = 0; i < quests.length; i++) {
      const q = quests[i];
      const name = q.config?.messages?.quest_name || q.config?.messages?.game_title || `Quest ${i + 1}`;
      addLog(this.userId, `[DQACS] Processing ${i + 1}/${total}: “${name}”...`);
      const success = await this.processQuest(q);
      if (success || q.user_status?.completed_at) {
        completedCount++;
        addLog(this.userId, `[DQACS] Progress: ${completedCount}/${total} completed`);
      }
    }

    setQuestProcessingStatus(this.userId, false);
    addLog(this.userId, `[DQACS] Completed ${completedCount}/${total} quests!`);
  }
}
