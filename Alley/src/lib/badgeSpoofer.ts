/**
 * Stray Discord Badge Spoofer (DBS) Engine
 *
 * Stray's Badge Spoofer is built using DBS (https://github.com/revere-group/discord-badge-spoofer).
 * Massive thanks to the original creator.
 *
 * Posts verified launch_game and running_game_heartbeat events to Discord's /api/v9/science analytics
 * endpoint to inflate Discord profile badges (Playtime Hours and Games Played count).
 */

import crypto from "crypto";
import { addLog, setDbsStatus, DbsStatus } from "./daemon";
import { getUser, saveUser } from "./db";
import { decrypt } from "./encryption";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9253 Chrome/148.0.7778.280 Electron/42.7.1 Safari/537.36";
const SCIENCE_URL = "https://discord.com/api/v9/science";
const GAMES_CDN_URL = "https://cdn.discordapp.com/detectables/games.json";
const BATCH_SIZE = 15; // 15 games * 3 events = 45 events (limit is 50 per /science request)
const BATCH_DELAY_MS = 1200; // 1.2s delay between batches

export interface DbsGame {
  id: string;
  name: string;
  exe: string;
}

export interface DbsRunOptions {
  mode: "hours" | "games";
  gameCount: number;
  hoursPerGame: number;
  cookie: string;
  fingerprint?: string;
}

// In-memory cache for detectables list
let cachedGames: DbsGame[] | null = null;
let lastGamesFetch = 0;

// Abort control
const activeDbsAborts = new Set<string>();

export function stopDbsProcessing(userId: string) {
  activeDbsAborts.add(userId);
  setDbsStatus(userId, null);
  addLog(userId, "[DBS] Badge spoofer stopped by user.");
}

export function clearDbsAbort(userId: string) {
  activeDbsAborts.delete(userId);
}

export function isDbsAborted(userId: string): boolean {
  return activeDbsAborts.has(userId);
}

// Fallback games in case Discord detectables CDN is blocked or unavailable
const FALLBACK_GAMES: DbsGame[] = [
  { id: "356869127241072640", name: "League of Legends", exe: "LeagueClient.exe" },
  { id: "356875221078245376", name: "Counter-Strike 2", exe: "cs2.exe" },
  { id: "356875544077402112", name: "Minecraft", exe: "javaw.exe" },
  { id: "700140410793787473", name: "VALORANT", exe: "VALORANT-Win64-Shipping.exe" },
  { id: "769248443901771806", name: "Genshin Impact", exe: "GenshinImpact.exe" },
  { id: "534914774358786049", name: "Apex Legends", exe: "r5apex.exe" },
  { id: "356877703351238656", name: "Overwatch 2", exe: "Overwatch.exe" },
  { id: "356875888069050368", name: "Grand Theft Auto V", exe: "GTA5.exe" },
  { id: "461019623861878784", name: "Cyberpunk 2077", exe: "Cyberpunk2077.exe" },
  { id: "913915003927515177", name: "Elden Ring", exe: "eldenring.exe" },
  { id: "356876116813807616", name: "Rust", exe: "RustClient.exe" },
  { id: "356877232230236160", name: "Rocket League", exe: "RocketLeague.exe" },
  { id: "356876793875136512", name: "Tom Clancy's Rainbow Six Siege", exe: "RainbowSix.exe" },
  { id: "356876358359580672", name: "Team Fortress 2", exe: "hl2.exe" },
  { id: "437021666498019328", name: "Fortnite", exe: "FortniteClient-Win64-Shipping.exe" },
  { id: "888631526365851658", name: "Honkai: Star Rail", exe: "StarRail.exe" },
  { id: "356877014608773120", name: "Dota 2", exe: "dota2.exe" },
  { id: "557874895690760193", name: "Destiny 2", exe: "destiny2.exe" },
  { id: "403756885834170369", name: "Sea of Thieves", exe: "SoTGame.exe" },
  { id: "833446869550530590", name: "Phasmophobia", exe: "Phasmophobia.exe" },
];

/**
 * Loads the full list of detectable Discord games.
 */
export async function loadDbsGames(): Promise<DbsGame[]> {
  const now = Date.now();
  if (cachedGames && cachedGames.length > 0 && now - lastGamesFetch < 3600000) {
    return cachedGames;
  }

  try {
    const res = await fetch(GAMES_CDN_URL, {
      headers: { "User-Agent": USER_AGENT },
      cache: "force-cache",
    });

    if (res.ok) {
      const data = await res.json();
      const games: DbsGame[] = [];
      const seen = new Set<string>();

      for (const entry of data) {
        const gid = String(entry.id || "");
        if (!gid || !/^\d+$/.test(gid) || seen.has(gid)) continue;

        const winExe = (entry.executables || []).find(
          (e: any) => e?.os === "win32" && typeof e?.name === "string" && e.name.trim().length > 0
        );

        if (winExe) {
          seen.add(gid);
          games.push({
            id: gid,
            name: entry.name || "Unknown Game",
            exe: winExe.name,
          });
        }
      }

      if (games.length > 0) {
        cachedGames = games;
        lastGamesFetch = now;
        return games;
      }
    }
  } catch (err: any) {
    console.error("[DBS] Failed to fetch games list from CDN:", err.message);
  }

  cachedGames = FALLBACK_GAMES;
  return FALLBACK_GAMES;
}

/**
 * Encodes realistic Discord Windows desktop client super properties.
 */
export function buildSuperProps(launchSig: string, heartbeatSession: string): string {
  const props = {
    os: "Windows",
    browser: "Discord Client",
    release_channel: "stable",
    client_version: "1.0.9253",
    os_version: "10.0.26200",
    os_arch: "x64",
    app_arch: "x64",
    system_locale: "en-US",
    has_client_mods: false,
    browser_user_agent: USER_AGENT,
    browser_version: "42.7.1",
    os_sdk_version: "26200",
    client_build_number: 594031,
    native_build_number: 88414,
    client_event_source: null,
    client_app_state: "focused",
    client_launch_id: crypto.randomUUID(),
    launch_signature: launchSig,
    client_heartbeat_session_id: heartbeatSession,
  };
  return Buffer.from(JSON.stringify(props)).toString("base64");
}

/**
 * Fetches the user's ephemeral analytics token from Discord.
 */
export async function fetchAnalyticsToken(token: string, superProps: string): Promise<string> {
  const res = await fetch("https://discord.com/api/v9/users/@me?with_analytics_token=true", {
    headers: {
      authorization: token,
      "user-agent": USER_AGENT,
      "x-super-properties": superProps,
    },
  });

  if (!res.ok) {
    throw new Error(`Analytics token request rejected (HTTP ${res.status})`);
  }

  const data = await res.json();
  if (!data.analytics_token) {
    throw new Error("Discord API did not return an analytics_token");
  }

  return data.analytics_token;
}

/**
 * Builds the 3 events representing a played game session:
 * 1. Open heartbeat (0 duration)
 * 2. Launch game event
 * 3. Close heartbeat (full duration)
 */
function buildGameSessionEvents(
  game: DbsGame,
  durationMs: number,
  sessionInfo: { heartbeatSession: string; launchSig: string },
  seqGen: () => number,
  fingerprint?: string
): any[] {
  const now = Date.now();
  let start = now - durationMs;
  if (start < 0) start = now;

  const gameSessionId = crypto.randomUUID();

  // 1. Initial heartbeat
  const initialHb = {
    type: "running_game_heartbeat",
    properties: {
      client_track_timestamp: start,
      client_heartbeat_session_id: sessionInfo.heartbeatSession,
      event_sequence_number: seqGen(),
      game_id: game.id,
      game_name: game.name,
      game_metadata: null,
      game_executable: game.exe,
      game_detection_enabled: true,
      initial_heartbeat: true,
      final_heartbeat: false,
      game_session_id: gameSessionId,
      duration_tracked_ms: 0,
      rtc_connection_id: null,
      media_session_id: null,
      launch_signature: sessionInfo.launchSig,
      client_app_state: "focused",
      client_send_timestamp: start,
    },
  };

  // 2. Launch game event
  const launchProps: any = {
    client_track_timestamp: now,
    client_heartbeat_session_id: sessionInfo.heartbeatSession,
    event_sequence_number: seqGen(),
    game: game.name,
    game_id: game.id,
    verified: true,
    elevated: false,
    is_launcher: false,
    game_platform: "desktop",
    detection_method: "verified_game",
    is_overlay_enabled: false,
    is_overlay_game_enabled: true,
    is_overlay_game_source: "OOP_DEFAULT_DATABASE",
    fullscreen_type: "UNKNOWN",
    hardware_display_count: 1,
    overlay_method: "Disabled",
    activity_status_enabled: true,
    activity_status_shared_guilds: [],
    current_user_status: "online",
    game_detection_enabled: true,
    executable_path: game.exe,
    voice_channel_id: null,
    voice_channel_type: null,
    voice_channel_bitrate: null,
    voice_channel_guild_id: null,
    hidden_by_distributor: false,
    game_metadata: null,
    client_performance_cpu: null,
    client_performance_memory: null,
    cpu_core_count: null,
    accessibility_features: 0,
    rendered_locale: "en-US",
    launch_signature: sessionInfo.launchSig,
    client_rtc_state: null,
    client_app_state: "focused",
    client_send_timestamp: now,
  };

  if (fingerprint && fingerprint.trim().length > 0) {
    launchProps.executable_fingerprint = fingerprint.trim();
  }

  const launchEvent = {
    type: "launch_game",
    properties: launchProps,
  };

  // 3. Final heartbeat
  const finalHb = {
    type: "running_game_heartbeat",
    properties: {
      client_track_timestamp: now,
      client_heartbeat_session_id: sessionInfo.heartbeatSession,
      event_sequence_number: seqGen(),
      game_id: game.id,
      game_name: game.name,
      game_metadata: null,
      game_executable: game.exe,
      game_detection_enabled: true,
      initial_heartbeat: false,
      final_heartbeat: true,
      game_session_id: gameSessionId,
      duration_tracked_ms: durationMs,
      rtc_connection_id: null,
      media_session_id: null,
      launch_signature: sessionInfo.launchSig,
      client_app_state: "focused",
      client_send_timestamp: now,
    },
  };

  return [initialHb, launchEvent, finalHb];
}

/**
 * Executes a full DBS spoofing run for a user.
 */
export async function runDbsSpoofer(userId: string, options: DbsRunOptions): Promise<{ success: boolean; message: string }> {
  clearDbsAbort(userId);

  const user = getUser(userId);
  if (!user || !user.discordToken) {
    addLog(userId, "[DBS] Error: No user or Discord token found. Please save your token first.");
    return { success: false, message: "No Discord token configured." };
  }

  const decryptedToken = decrypt(user.discordToken);
  if (!decryptedToken) {
    addLog(userId, "[DBS] Error: Could not decrypt Discord token.");
    return { success: false, message: "Decryption failed." };
  }

  let rawCookie = (options.cookie || user.dbsCookie || "").trim();
  // Strip outer quotes if any
  rawCookie = rawCookie.replace(/^["']|["']$/g, "").trim();

  // If user pasted full cookie string or key=value, extract just the cf_clearance value
  const cfMatch = rawCookie.match(/cf_clearance=([^;\s]+)/i);
  const cookieValue = cfMatch ? cfMatch[1].trim() : rawCookie;

  if (!cookieValue) {
    addLog(userId, "[DBS] Error: Cloudflare clearance cookie (cf_clearance) is required for /api/v9/science.");
    return { success: false, message: "Missing Cloudflare cookie (cf_clearance)." };
  }

  const formattedCookie = `cf_clearance=${cookieValue}`;

  // Load detectable games
  addLog(userId, "[DBS] Initializing Discord Badge Spoofer (DBS)...");
  addLog(userId, "[DBS] Fetching Discord detectables database...");
  const allGames = await loadDbsGames();
  addLog(userId, `[DBS] Loaded ${allGames.length} detectable games.`);

  const requestedCount = Math.max(1, Math.min(options.gameCount || 50, allGames.length));
  const selectedGames = allGames.slice(0, requestedCount);

  const isHoursMode = options.mode === "hours";
  const hours = isHoursMode ? Math.max(0.1, options.hoursPerGame || 1) : (1 / 60); // 1 minute for games played mode
  const durationMs = Math.round(hours * 3600 * 1000);

  // Initialize session and super properties
  const heartbeatSession = crypto.randomUUID();
  const launchSig = crypto.randomUUID();
  const superProps = buildSuperProps(launchSig, heartbeatSession);

  // Fetch analytics token
  addLog(userId, "[DBS] Requesting analytics authorization token from Discord...");
  let analyticsToken = "";
  try {
    analyticsToken = await fetchAnalyticsToken(decryptedToken, superProps);
    addLog(userId, "[DBS] Analytics token acquired successfully.");
  } catch (err: any) {
    addLog(userId, `[DBS] Error acquiring analytics token: ${err.message}`);
    return { success: false, message: err.message };
  }

  // Calculate batches
  const totalGames = selectedGames.length;
  const totalBatches = Math.ceil(totalGames / BATCH_SIZE);
  let gamesProcessed = 0;
  let hoursClaimed = 0;
  let seq = 0;
  const seqGen = () => ++seq;

  const totalProjectedHours = isHoursMode ? totalGames * hours : 0;
  addLog(
    userId,
    `[DBS] Starting queue: ${totalGames} games across ${totalBatches} batches (${isHoursMode ? `${hours}h per game · ${totalProjectedHours.toLocaleString()}h total` : "Games Played count mode"}).`
  );

  setDbsStatus(userId, {
    isRunning: true,
    currentBatch: 0,
    totalBatches,
    gamesProcessed: 0,
    totalGames,
    hoursClaimed: 0,
    mode: options.mode,
    statusText: `Starting batch 1/${totalBatches}...`,
    startTime: Date.now(),
  });

  // Save latest options to user settings in db
  saveUser(userId, {
    dbsCookie: cookieValue,
    dbsFingerprint: options.fingerprint || user.dbsFingerprint,
    dbsHoursPerGame: isHoursMode ? hours : user.dbsHoursPerGame,
    dbsGameCount: requestedCount,
    dbsMode: options.mode,
  });

  for (let b = 0; b < totalBatches; b++) {
    if (isDbsAborted(userId)) {
      addLog(userId, "[DBS] Processing aborted by user.");
      setDbsStatus(userId, null);
      return { success: false, message: "Aborted by user." };
    }

    const chunk = selectedGames.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    const events: any[] = [];

    for (const game of chunk) {
      const sessionEvents = buildGameSessionEvents(
        game,
        durationMs,
        { heartbeatSession, launchSig },
        seqGen,
        options.fingerprint || user.dbsFingerprint || undefined
      );
      events.push(...sessionEvents);
    }

    setDbsStatus(userId, {
      isRunning: true,
      currentBatch: b + 1,
      totalBatches,
      gamesProcessed,
      totalGames,
      hoursClaimed,
      mode: options.mode,
      statusText: `Sending batch ${b + 1}/${totalBatches} (${chunk.length} games)...`,
      startTime: Date.now(),
    });

    try {
      const response = await fetch(SCIENCE_URL, {
        method: "POST",
        headers: {
          accept: "*/*",
          "accept-language": "en-US",
          authorization: decryptedToken,
          "content-type": "application/json",
          cookie: formattedCookie,
          origin: "https://discord.com",
          referer: "https://discord.com/channels/@me",
          "user-agent": USER_AGENT,
          "x-debug-options": "bugReporterEnabled",
          "x-discord-locale": "en-US",
          "x-discord-timezone": "UTC",
          "x-super-properties": superProps,
        },
        body: JSON.stringify({
          token: analyticsToken,
          events,
        }),
      });

      if (response.status === 204) {
        gamesProcessed += chunk.length;
        if (isHoursMode) {
          hoursClaimed += chunk.length * hours;
        }

        addLog(
          userId,
          `[DBS] Batch ${b + 1}/${totalBatches} accepted (204 No Content) · ${gamesProcessed}/${totalGames} games credited.`
        );
      } else if (response.status === 401 || response.status === 403) {
        addLog(
          userId,
          `[DBS] Error: Science authorization rejected (HTTP ${response.status}). Your cf_clearance cookie or token may have expired. Please refresh your cookie.`
        );
        setDbsStatus(userId, null);
        return { success: false, message: `Auth rejected (HTTP ${response.status}) - refresh cookie.` };
      } else if (response.status === 429) {
        let retryAfter = 15;
        try {
          const body = await response.json();
          if (body.retry_after) retryAfter = Math.ceil(body.retry_after);
        } catch {
          const h = response.headers.get("retry-after");
          if (h) retryAfter = parseInt(h, 10) || 15;
        }
        addLog(userId, `[DBS] Rate limited (HTTP 429). Pausing queue for ${retryAfter}s...`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        b--; // retry this batch
        continue;
      } else {
        addLog(userId, `[DBS] Warning: Science endpoint returned HTTP ${response.status} for batch ${b + 1}.`);
      }
    } catch (err: any) {
      addLog(userId, `[DBS] Network exception on batch ${b + 1}: ${err.message || err}`);
    }

    if (b < totalBatches - 1) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  // Update cumulative user stats in db
  const currentUser = getUser(userId);
  const updatedGamesCount = (currentUser?.dbsTotalGamesClaimed || 0) + gamesProcessed;
  const updatedHoursCount = (currentUser?.dbsTotalHoursClaimed || 0) + hoursClaimed;

  saveUser(userId, {
    dbsTotalGamesClaimed: updatedGamesCount,
    dbsTotalHoursClaimed: Math.round(updatedHoursCount * 10) / 10,
    dbsLastRunTimestamp: new Date().toISOString(),
  });

  setDbsStatus(userId, null);
  addLog(
    userId,
    `[DBS] Completed successfully! Credited ${gamesProcessed}/${totalGames} games (${isHoursMode ? `${hoursClaimed.toLocaleString()}h total` : "Games Played count"} sent to profile analytics). Badges update within 24-48 hours on Discord's cycle.`
  );

  return {
    success: true,
    message: `Credited ${gamesProcessed}/${totalGames} games successfully.`,
  };
}
