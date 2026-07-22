import { addLog } from "./daemon";
import { getUser } from "./db";

export interface QuestTask {
  target: number;
}

export interface QuestConfig {
  id: string;
  config: {
    messages: {
      quest_name: string;
    };
    application: {
      id: string;
      name: string;
    };
    task_config_v2: {
      tasks: Record<string, QuestTask>;
    };
    rewards_config?: {
      platforms: number[];
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

export class QuestManager {
  private token: string;
  private userId: string;

  constructor(userId: string, token: string) {
    this.userId = userId;
    this.token = token.replace(/^["']|["']$/g, "").trim();
  }

  private getHeaders(isAndroid = false): Record<string, string> {
    return {
      Authorization: this.token,
      "Content-Type": "application/json",
      "User-Agent": isAndroid
        ? "Discord-Android/316011;RNA"
        : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9236 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36",
    };
  }

  async fetchQuests(): Promise<QuestConfig[]> {
    try {
      const res = await fetch("https://discord.com/api/v9/users/@me/quests", {
        headers: this.getHeaders(),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.quests || [];
    } catch {
      return [];
    }
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
    const questName = quest.config.messages.quest_name;
    let currentDone = secondsDone;

    addLog(this.userId, `[DQACS] Video quest starting for “${questName}” (${secondsNeeded}s needed)...`);

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
          if (data.completed_at) {
            addLog(this.userId, `[DQACS] Quest “${questName}” completed! Rewards can only be claimed via the official Discord client.`);
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

    addLog(this.userId, `[DQACS] Quest “${questName}” video progress completed!`);
    return true;
  }

  async completePlayQuest(quest: QuestConfig, secondsNeeded: number, taskName: string): Promise<boolean> {
    const questName = quest.config.messages.quest_name;
    const appName = quest.config.application.name;
    let completed = false;

    addLog(this.userId, `[DQACS] Spoofing presence for “${questName}” (${appName})...`);

    while (!completed) {
      try {
        const res = await fetch(`https://discord.com/api/v9/quests/${quest.id}/heartbeat`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            application_id: quest.config.application.id,
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
          const remainingMins = Math.max(1, Math.ceil((secondsNeeded - done) / 60));
          addLog(this.userId, `[DQACS] Spoofing ${appName}. ${remainingMins} min(s) remaining...`);
        }
      } catch {}

      await new Promise((r) => setTimeout(r, 20000));
    }

    try {
      await fetch(`https://discord.com/api/v9/quests/${quest.id}/heartbeat`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          application_id: quest.config.application.id,
          terminal: true,
        }),
      });
    } catch {}

    addLog(this.userId, `[DQACS] Quest “${questName}” play task completed! Rewards can only be claimed via the official Discord client.`);
    return true;
  }

  async processQuest(quest: QuestConfig): Promise<boolean> {
    const questName = quest.config.messages.quest_name;

    if (quest.user_status?.completed_at) {
      if (!quest.user_status.claimed_at) {
        addLog(this.userId, `[DQACS] Quest “${questName}” is 100% completed. Rewards can only be claimed via the official Discord client.`);
      }
      return true;
    }

    const tasks = quest.config.task_config_v2.tasks;
    const isAndroid = Boolean(tasks.WATCH_VIDEO_ON_MOBILE) && !Boolean(tasks.WATCH_VIDEO);

    if (!quest.user_status?.enrolled_at) {
      addLog(this.userId, `[DQACS] Enrolling in quest “${questName}”...`);
      const enrolled = await this.enrollQuest(quest.id, isAndroid);
      if (!enrolled) {
        addLog(this.userId, `[DQACS] Failed to enroll in quest “${questName}”.`);
        return false;
      }
    }

    const taskName = Object.keys(tasks)[0];
    if (!taskName) return false;

    const secondsNeeded = tasks[taskName].target;
    const secondsDone = quest.user_status?.progress?.[taskName]?.value || 0;

    let success = false;
    if (taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") {
      success = await this.completeVideoQuest(quest, secondsNeeded, secondsDone);
    } else {
      success = await this.completePlayQuest(quest, secondsNeeded, taskName);
    }

    if (success) {
      addLog(this.userId, `[DQACS] Quest “${questName}” 100% complete! Rewards can only be claimed via the official Discord client.`);
    }

    return success;
  }

  async runAllQuests(): Promise<void> {
    const quests = await this.fetchQuests();
    const activeQuests = quests.filter((q) => !q.user_status?.completed_at);
    addLog(this.userId, `[DQACS] Found ${activeQuests.length} active quest(s) to process.`);

    for (const quest of activeQuests) {
      await this.processQuest(quest);
    }
  }
}
