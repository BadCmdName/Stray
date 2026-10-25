import { addLog, setQuestProcessingStatus, triggerDaemonPresenceUpdate } from "./daemon";
import { getUser, saveUser } from "./db";

const activeAborts = new Set<string>();

export function stopQuestProcessing(userId: string) {
  activeAborts.add(userId);
  setQuestProcessingStatus(userId, false);
  addLog(userId, "[DQACS] Quest processing stopped by user.");
}

export function clearQuestAbort(userId: string) {
  activeAborts.delete(userId);
}

export function isQuestAborted(userId: string): boolean {
  return activeAborts.has(userId);
}

export interface QuestTask {
  target: number;
}

export interface QuestReward {
  type?: number;
  sku_id?: string;
  orb_quantity?: number;
  messages?: {
    name?: string;
    name_with_article?: string;
  };
}

export type QuestTier = "ORBS_VIDEO" | "ORBS_GAME" | "DECORATION_OTHER";

export interface QuestHierarchyInfo {
  tier: QuestTier;
  priority: number;
  label: string;
  badge: string;
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
      rewards?: QuestReward[];
    };
    video_metadata?: any;
  };
  user_status?: {
    enrolled_at?: string | null;
    completed_at?: string | null;
    claimed_at?: string | null;
    progress?: Record<string, { value: number }>;
  } | null;
  raw?: any;
  hierarchy?: QuestHierarchyInfo;
}

export function isOrbQuest(quest: QuestConfig | any): boolean {
  const rewards: QuestReward[] =
    quest.config?.rewards_config?.rewards ||
    quest.raw?.config?.rewards_config?.rewards ||
    [];

  for (const r of rewards) {
    if (r.orb_quantity && Number(r.orb_quantity) > 0) return true;
    const name = `${r.messages?.name || ""} ${r.messages?.name_with_article || ""}`.toLowerCase();
    if (/\borbs?\b/.test(name)) return true;
    if (r.sku_id && /orb/i.test(String(r.sku_id))) return true;
  }

  const qName = `${quest.config?.messages?.quest_name || ""} ${quest.config?.messages?.game_title || ""}`.toLowerCase();
  if (/\borbs?\b/.test(qName)) return true;

  return false;
}

export function isVideoQuest(quest: QuestConfig | any): boolean {
  const tasks =
    quest.config?.task_config_v2?.tasks ||
    quest.raw?.config?.task_config_v2?.tasks ||
    {};

  if (Boolean(tasks.WATCH_VIDEO) || Boolean(tasks.WATCH_VIDEO_ON_MOBILE)) return true;
  if (quest.config?.video_metadata || quest.raw?.config?.video_metadata) return true;

  for (const key of Object.keys(tasks)) {
    if (/video/i.test(key)) return true;
  }
  return false;
}

export function categorizeQuest(quest: QuestConfig | any): QuestHierarchyInfo {
  const isOrb = isOrbQuest(quest);
  const isVideo = isVideoQuest(quest);

  if (isOrb && isVideo) {
    return {
      tier: "ORBS_VIDEO",
      priority: 1,
      label: "Orbs (Video)",
      badge: "Tier 1: Orbs (Video)",
    };
  }

  if (isOrb && !isVideo) {
    return {
      tier: "ORBS_GAME",
      priority: 2,
      label: "Orbs (Games)",
      badge: "Tier 2: Orbs (Games)",
    };
  }

  return {
    tier: "DECORATION_OTHER",
    priority: 3,
    label: "Decoration & Other",
    badge: "Tier 3: Decoration / Other",
  };
}

export function sortQuestsByHierarchy(quests: QuestConfig[]): QuestConfig[] {
  return [...quests].sort((a, b) => {
    const priorityA = a.hierarchy?.priority ?? categorizeQuest(a).priority;
    const priorityB = b.hierarchy?.priority ?? categorizeQuest(b).priority;
    return priorityA - priorityB;
  });
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

    let retries = 0;
    const maxRetries = 3;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: this.getHeaders(),
          cache: "no-store",
        });

        if (res.status === 401 || res.status === 403) {
          addLog(this.userId, "[DQACS] Error: Discord API returned HTTP 401/403 Unauthorized. Check your Discord token.");
          return [];
        }

        if (res.status === 429) {
          if (retries >= maxRetries) {
             addLog(this.userId, `[DQACS] Max retries (${maxRetries}) reached for rate limits on fetchQuests. Aborting.`);
             return [];
          }
          retries++;
          let retryAfter = 10;
          try {
            const data = await res.json();
            if (data.retry_after) retryAfter = Math.ceil(data.retry_after);
          } catch {
            const h = res.headers.get("retry-after");
            if (h) retryAfter = parseInt(h, 10) || 10;
          }
          addLog(this.userId, `[DQACS] Discord API Rate Limited (HTTP 429). Retrying quest fetch after ${retryAfter}s (Attempt ${retries}/${maxRetries})...`);
          await new Promise((r) => setTimeout(r, retryAfter * 1000));
          continue;
        }

        if (res.ok) {
          const data = await res.json();
          let questsList: QuestConfig[] = [];

          if (Array.isArray(data)) {
            questsList = data;
          } else if (data && Array.isArray(data.quests)) {
            questsList = data.quests;
          }

          const now = Date.now();
          const activeQuests = questsList
            .filter((q) => {
              if (!q || !q.id) return false;
              if (q.user_status?.claimed_at || q.user_status?.completed_at) return false;
              if (q.config?.expires_at) {
                const expires = new Date(q.config.expires_at).getTime();
                if (!isNaN(expires) && expires < now) return false;
              }
              return true;
            })
            .map((q) => ({
              ...q,
              hierarchy: categorizeQuest(q),
            }));

          const sorted = sortQuestsByHierarchy(activeQuests);

          const orbVideoCount = sorted.filter((q) => q.hierarchy?.tier === "ORBS_VIDEO").length;
          const orbGameCount = sorted.filter((q) => q.hierarchy?.tier === "ORBS_GAME").length;
          const decorCount = sorted.filter((q) => q.hierarchy?.tier === "DECORATION_OTHER").length;

          addLog(
            this.userId,
            `[DQACS] Hierarchy sorted: ${sorted.length} uncompleted quests (${orbVideoCount} Orbs Video [1st], ${orbGameCount} Orbs Games [2nd], ${decorCount} Decoration/Other [3rd]).`
          );
          return sorted;
        }
      } catch {}
    }

    addLog(this.userId, "[DQACS] TOTAL UNCOMPLETED QUESTS: 0");
    return [];
  }

  async enrollQuest(questId: string, isAndroid = false, retries = 0): Promise<boolean> {
    const maxRetries = 3;
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

      if (res.status === 401 || res.status === 403) {
        addLog(this.userId, "[DQACS] Error: Quest enrollment returned HTTP 401/403 Unauthorized.");
        return false;
      }

      if (res.status === 429) {
        if (retries >= maxRetries) {
          addLog(this.userId, `[DQACS] Max retries (${maxRetries}) reached for rate limits on enrollQuest. Aborting.`);
          return false;
        }
        let retryAfter = 10;
        try {
          const data = await res.json();
          if (data.retry_after) retryAfter = Math.ceil(data.retry_after);
        } catch {
          const h = res.headers.get("retry-after");
          if (h) retryAfter = parseInt(h, 10) || 10;
        }
        addLog(this.userId, `[DQACS] Rate limited on quest enrollment (HTTP 429). Retrying in ${retryAfter}s (Attempt ${retries + 1}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        return this.enrollQuest(questId, isAndroid, retries + 1);
      }

      return res.ok;
    } catch {
      return false;
    }
  }

  async completeVideoQuest(quest: QuestConfig, secondsNeeded: number, secondsDone: number): Promise<boolean> {
    const questName = quest.config?.messages?.quest_name || quest.config?.messages?.game_title || "Discord Quest";
    const appId = quest.config?.application?.id || "1527635163591348254";
    let currentDone = secondsDone;
    let retries = 0;
    const maxRetries = 3;

    addLog(this.userId, `[DQACS] Video quest starting for “${questName}” (${secondsNeeded}s)...`);

    while (currentDone < secondsNeeded) {
      if (isQuestAborted(this.userId)) {
        return false;
      }

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

        if (res.status === 401 || res.status === 403) {
          addLog(this.userId, `[DQACS] Error: Quest returned HTTP ${res.status} Unauthorized for “${questName}”. Aborting.`);
          return false;
        }

        if (res.status === 429) {
          if (retries >= maxRetries) {
             addLog(this.userId, `[DQACS] Max retries (${maxRetries}) reached for rate limits on completeVideoQuest. Aborting.`);
             return false;
          }
          retries++;
          let retryAfter = 10;
          try {
            const data = await res.json();
            if (data.retry_after) retryAfter = Math.ceil(data.retry_after);
          } catch {
            const h = res.headers.get("retry-after");
            if (h) retryAfter = parseInt(h, 10) || 10;
          }
          addLog(this.userId, `[DQACS] Rate limited (HTTP 429). Retrying in ${retryAfter}s (Attempt ${retries}/${maxRetries})...`);
          await new Promise((r) => setTimeout(r, retryAfter * 1000));
          continue;
        }

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
    const appId = quest.config?.application?.id || "1527635163591348254";
    let completed = false;
    let retries = 0;
    const maxRetries = 3;

    addLog(this.userId, `[DQACS] Starting game quest “${questName}” (${appName})...`);

    while (!completed) {
      if (isQuestAborted(this.userId)) {
        return false;
      }

      try {
        const res = await fetch(`https://discord.com/api/v9/quests/${quest.id}/heartbeat`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            application_id: quest.config?.application?.id,
            terminal: false,
          }),
        });

        if (res.status === 401 || res.status === 403) {
          addLog(this.userId, `[DQACS] Error: Quest returned HTTP ${res.status} Unauthorized for “${questName}”. Aborting.`);
          return false;
        }

        if (res.status === 429) {
          if (retries >= maxRetries) {
             addLog(this.userId, `[DQACS] Max retries (${maxRetries}) reached for rate limits on completePlayQuest. Aborting.`);
             return false;
          }
          retries++;
          let retryAfter = 30;
          try {
            const data = await res.json();
            if (data.retry_after) retryAfter = Math.ceil(data.retry_after);
          } catch {
            const h = res.headers.get("retry-after");
            if (h) retryAfter = parseInt(h, 10) || 30;
          }
          addLog(this.userId, `[DQACS] Rate limited (HTTP 429). Pausing for ${retryAfter}s (Attempt ${retries}/${maxRetries})...`);
          await new Promise((r) => setTimeout(r, retryAfter * 1000));
          continue;
        }

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
        } else {
          addLog(this.userId, `[DQACS] Warning: Server response HTTP ${res.status} for “${questName}”`);
        }
      } catch (err: any) {
        addLog(this.userId, `[DQACS] Error processing “${questName}”: ${err.message || err}`);
      }

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
    if (isQuestAborted(this.userId)) return false;

    const questName = quest.config?.messages?.quest_name || quest.config?.messages?.game_title || "Discord Quest";
    const appId = quest.config?.application?.id || "1527635163591348254";

    if (quest.config?.expires_at) {
      const expires = new Date(quest.config.expires_at).getTime();
      if (!isNaN(expires) && expires < Date.now()) {
        addLog(this.userId, `[DQACS] Skipping expired quest: “${questName}”.`);
        return false;
      }
    }

    if (quest.user_status?.completed_at || quest.user_status?.claimed_at) {
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

  async runAllQuests(includeOptional = true): Promise<void> {
    clearQuestAbort(this.userId);

    const allQuests = await this.fetchQuests();
    const quests = includeOptional
      ? allQuests
      : allQuests.filter((q) => q.hierarchy?.tier !== "DECORATION_OTHER");

    const tier1 = quests.filter((q) => q.hierarchy?.tier === "ORBS_VIDEO");
    const tier2 = quests.filter((q) => q.hierarchy?.tier === "ORBS_GAME");
    const tier3 = quests.filter((q) => q.hierarchy?.tier === "DECORATION_OTHER");

    const total = quests.length;
    addLog(
      this.userId,
      `[DQACS] Hierarchy Mode active (${total} quests in queue): Stage 1: ${tier1.length} Orbs (Video, 1st) | Stage 2: ${tier2.length} Orbs (Games, 2nd) | Stage 3: ${tier3.length} Decoration/Other ${includeOptional ? "(optional, 3rd)" : "(skipped by preference)"}.`
    );

    if (total === 0) {
      setQuestProcessingStatus(this.userId, false);
      addLog(this.userId, "[DQACS] No uncompleted quests in chosen hierarchy queue.");
      return;
    }

    let completedCount = 0;
    for (let i = 0; i < quests.length; i++) {
      if (isQuestAborted(this.userId)) {
        addLog(this.userId, "[DQACS] Quest processing aborted by user.");
        break;
      }

      const q = quests[i];
      const name = q.config?.messages?.quest_name || q.config?.messages?.game_title || `Quest ${i + 1}`;
      const tierBadge = q.hierarchy?.badge || "Quest";
      addLog(this.userId, `[DQACS] [${tierBadge}] Processing ${i + 1}/${total}: “${name}”...`);
      const success = await this.processQuest(q);
      if (success || q.user_status?.completed_at) {
        completedCount++;
        addLog(this.userId, `[DQACS] [${tierBadge}] Progress: ${completedCount}/${total} completed`);
      } else {
        if (isQuestAborted(this.userId)) break;
      }
    }

    setQuestProcessingStatus(this.userId, false);
    addLog(this.userId, `[DQACS] Finished processing! Completed ${completedCount}/${total} quests in hierarchy order!`);

    const user = getUser(this.userId);
    if (user) {
      saveUser(this.userId, { liveRpcQuests: false, rpcEnabled: true });
      triggerDaemonPresenceUpdate(this.userId);
    }
  }
}
