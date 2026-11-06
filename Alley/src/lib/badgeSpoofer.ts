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
import { execSync } from "child_process";
import { addLog, setDbsStatus } from "./daemon";
import { getUser, saveUser } from "./db";
import { decrypt } from "./encryption";

const FALLBACK_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9267 Chrome/152.0.7977.169 Electron/44.10.0 Safari/537.36";
const SCIENCE_URL = "https://discord.com/api/v9/science";
const GAMES_CDN_URL = "https://cdn.discordapp.com/detectables/games.json";
const PROPERTIES_URL = "https://cordapi.dolfi.es/api/v2/properties/windows";
const MAX_EVENTS_PER_BATCH = 45; // limit is 50 per /science request; 45 is the optimal safe ceiling
const BATCH_DELAY_MS = 1000; // 1s delay between batches

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

// In-memory cache for live Discord client super properties
let cachedCordProps: { superProps: string; userAgent: string; fetchedAt: number } | null = null;

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
      headers: { "User-Agent": FALLBACK_USER_AGENT },
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
 * Generates an authentic 146-byte obfuscated PE executable fingerprint bound to
 * the user's Discord ID and machine GUID. Discord requires this for verified
 * desktop games to credit Playtime Hours and Games Played badges.
 */
export function generateExecutableFingerprint(userId: string): string {
  if (process.platform === "win32") {
    try {
      const psCommand = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$UserId = '${userId}'; $Path = 'C:\\Windows\\System32\\notepad.exe'; $fs = [IO.File]::Open($Path, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite); try { $fileSize = [UInt64]$fs.Length; $readSize = [int][Math]::Min($fs.Length, 0x10000); $buf = [byte[]]::new($readSize); $read = $fs.Read($buf, 0, $readSize); if ($read -ne $readSize) { [Array]::Resize([ref]$buf, $read); } } finally { $fs.Dispose(); } $pe = [BitConverter]::ToInt32($buf, 0x3C); $fh = $pe + 4; $sections = [BitConverter]::ToUInt16($buf, $fh + 2); $timestamp = [BitConverter]::ToUInt32($buf, $fh + 4); $optSize = [BitConverter]::ToUInt16($buf, $fh + 16); $opt = $fh + 20; $sizeOfImage = [BitConverter]::ToUInt32($buf, $opt + 56); $sectionTable = $opt + $optSize; $sha256 = [Security.Cryptography.SHA256]::Create(); $headerHash = $sha256.ComputeHash([byte[]]$buf[0..($sectionTable - 1)]); $sectionHash = $sha256.ComputeHash([byte[]]$buf[$sectionTable..($sectionTable + $sections * 40 - 1)]); $machineGuid = (Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Cryptography' -Name MachineGuid).MachineGuid; $machineUserHash = $sha256.ComputeHash([Text.Encoding]::UTF8.GetBytes($machineGuid + $UserId)); $certHash = [byte[]]::new(32); $flags = 2; $out = [byte[]](@(1, [byte]$flags) + [BitConverter]::GetBytes($fileSize) + [BitConverter]::GetBytes($timestamp) + [BitConverter]::GetBytes($sizeOfImage) + $headerHash + $machineUserHash + $sectionHash + $certHash); $key = $sha256.ComputeHash([Text.Encoding]::UTF8.GetBytes($UserId + 'https://discord.com/careers')); for ($i = 1; $i -lt $out.Length; $i++) { $out[$i] = $out[$i] -bxor $key[($i - 1) -band 31]; } [Convert]::ToBase64String($out);"`;
      const res = execSync(psCommand, { encoding: "utf-8", timeout: 8000 }).trim();
      const lines = res.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const lastLine = lines[lines.length - 1];
      if (lastLine && lastLine.length > 50) return lastLine;
    } catch {}
  }

  // Pure TypeScript synthetic PE fingerprint generator matching Discord's exact schema
  const buf = Buffer.alloc(146);
  buf.writeUInt8(1, 0); // version 1
  buf.writeUInt8(2, 1); // flags: PE32+
  buf.writeBigUInt64LE(BigInt(4529888), 2); // realistic fileSize (~4.5MB)
  buf.writeUInt32LE(Math.floor(Date.now() / 1000) - 86400 * 30, 10); // TimeDateStamp
  buf.writeUInt32LE(5242880, 14); // SizeOfImage (~5MB)

  const headerHash = crypto.createHash("sha256").update(`pe_header_${userId}`).digest();
  headerHash.copy(buf, 18);

  const machineGuid = crypto.createHash("md5").update(`machine_${userId}`).digest("hex");
  const machineUserHash = crypto.createHash("sha256").update(machineGuid + userId).digest();
  machineUserHash.copy(buf, 50);

  const sectionHash = crypto.createHash("sha256").update(`pe_section_${userId}`).digest();
  sectionHash.copy(buf, 82);

  const certHash = Buffer.alloc(32, 0);
  certHash.copy(buf, 114);

  // XOR obfuscate with key = SHA256(userId + "https://discord.com/careers")
  const key = crypto.createHash("sha256").update(userId + "https://discord.com/careers").digest();
  for (let i = 1; i < buf.length; i++) {
    buf[i] = buf[i] ^ key[(i - 1) & 31];
  }

  return buf.toString("base64");
}

/**
 * Retrieves the latest Discord Windows client super properties from cordapi.dolfi.es
 * (with local caching and live fallback) so client build numbers are never rejected.
 */
export async function getSuperProperties(
  launchSig: string,
  heartbeatSession: string
): Promise<{ superProps: string; userAgent: string }> {
  const now = Date.now();
  if (cachedCordProps && now - cachedCordProps.fetchedAt < 3600000) {
    try {
      const parsed = JSON.parse(Buffer.from(cachedCordProps.superProps, "base64").toString("utf-8"));
      parsed.client_launch_id = crypto.randomUUID();
      parsed.launch_signature = launchSig;
      parsed.client_heartbeat_session_id = heartbeatSession;
      return {
        superProps: Buffer.from(JSON.stringify(parsed)).toString("base64"),
        userAgent: cachedCordProps.userAgent,
      };
    } catch {}
  }

  try {
    const res = await fetch(PROPERTIES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
      body: "{}",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.properties) {
        const props = data.properties;
        const ua = props.browser_user_agent || FALLBACK_USER_AGENT;
        props.client_launch_id = crypto.randomUUID();
        props.launch_signature = launchSig;
        props.client_heartbeat_session_id = heartbeatSession;
        const encoded = Buffer.from(JSON.stringify(props)).toString("base64");
        cachedCordProps = { superProps: encoded, userAgent: ua, fetchedAt: now };
        return { superProps: encoded, userAgent: ua };
      }
    }
  } catch (err: any) {
    console.warn("[DBS] Failed to fetch live client properties from cordapi:", err.message);
  }

  // Fallback with live 1.0.9267 client
  const fallbackProps = {
    os: "Windows",
    browser: "Discord Client",
    release_channel: "stable",
    client_version: "1.0.9267",
    os_version: "10.0.26100",
    os_arch: "x64",
    app_arch: "x64",
    system_locale: "en-US",
    has_client_mods: false,
    browser_user_agent: FALLBACK_USER_AGENT,
    browser_version: "44.10.0",
    os_sdk_version: "26100",
    client_build_number: 663810,
    native_build_number: 97793,
    client_event_source: null,
    client_app_state: "focused",
    client_launch_id: crypto.randomUUID(),
    launch_signature: launchSig,
    client_heartbeat_session_id: heartbeatSession,
  };
  const encoded = Buffer.from(JSON.stringify(fallbackProps)).toString("base64");
  return { superProps: encoded, userAgent: fallbackProps.browser_user_agent };
}

/**
 * Encodes realistic Discord Windows desktop client super properties (synchronous legacy wrapper).
 */
export function buildSuperProps(launchSig: string, heartbeatSession: string): string {
  const props = {
    os: "Windows",
    browser: "Discord Client",
    release_channel: "stable",
    client_version: "1.0.9267",
    os_version: "10.0.26100",
    os_arch: "x64",
    app_arch: "x64",
    system_locale: "en-US",
    has_client_mods: false,
    browser_user_agent: FALLBACK_USER_AGENT,
    browser_version: "44.10.0",
    os_sdk_version: "26100",
    client_build_number: 663810,
    native_build_number: 97793,
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
export async function fetchAnalyticsToken(
  token: string,
  superProps: string,
  userAgent: string = FALLBACK_USER_AGENT
): Promise<string> {
  const res = await fetch("https://discord.com/api/v9/users/@me?with_analytics_token=true", {
    headers: {
      authorization: token,
      "user-agent": userAgent,
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
 * Builds realistic game session events:
 * 1. Initial heartbeat (0 duration)
 * 2. Launch game event (with genuine PE executable_fingerprint)
 * 3. Final heartbeat (completed session duration)
 *
 * For large hour counts (> 24h), slices playtime across realistic daily sessions
 * so Discord's downstream anomaly filter does not drop impossible continuous blocks.
 */
export function buildGameSessionEvents(
  game: DbsGame,
  hours: number,
  sessionInfo: { heartbeatSession: string; launchSig: string },
  seqGen: () => number,
  fingerprint: string
): any[] {
  const now = Date.now();
  const events: any[] = [];

  // If hours <= 24, single session. If hours > 24, slice into realistic daily sessions of max 18h each.
  const maxSessionHours = 18;
  const sessionCount = hours <= 24 ? 1 : Math.min(14, Math.ceil(hours / maxSessionHours));
  const perSessionHours = hours / sessionCount;
  const durationMs = Math.round(perSessionHours * 3600 * 1000);

  for (let s = 0; s < sessionCount; s++) {
    const gameSessionId = crypto.randomUUID();
    const sessionEnd = now - s * 86400000;
    const sessionStart = sessionEnd - durationMs;

    // 1. Initial heartbeat
    events.push({
      type: "running_game_heartbeat",
      properties: {
        client_track_timestamp: sessionStart,
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
        discord_window_state: "focused",
        client_send_timestamp: sessionStart,
      },
    });

    // 2. Launch game event with authentic executable fingerprint
    events.push({
      type: "launch_game",
      properties: {
        client_track_timestamp: sessionEnd,
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
        is_overlay_game_source: "OOP_DEFAULT_DATABASE",
        fullscreen_type: "UNKNOWN",
        hardware_display_count: 1,
        overlay_method: "Disabled",
        activity_status_enabled: true,
        activity_status_shared_guilds: [],
        current_user_status: "online",
        game_detection_enabled: true,
        executable_path: game.exe,
        executable_fingerprint: fingerprint,
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
        discord_window_state: "focused",
        client_send_timestamp: sessionEnd,
      },
    });

    // 3. Final heartbeat
    events.push({
      type: "running_game_heartbeat",
      properties: {
        client_track_timestamp: sessionEnd,
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
        discord_window_state: "focused",
        client_send_timestamp: sessionEnd,
      },
    });
  }

  return events;
}

/**
 * Executes a full DBS spoofing run for a user.
 */
export async function runDbsSpoofer(
  userId: string,
  options: DbsRunOptions
): Promise<{ success: boolean; message: string }> {
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
  rawCookie = rawCookie.replace(/^["']|["']$/g, "").trim();

  // If user pasted key=value or full headers, extract just the cf_clearance value
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
  const hours = isHoursMode ? Math.max(0.1, options.hoursPerGame || 1) : 1 / 60; // 1 minute in games played count mode

  // Initialize session and dynamic super properties
  const heartbeatSession = crypto.randomUUID();
  const launchSig = crypto.randomUUID();
  addLog(userId, "[DBS] Syncing live Discord desktop client properties...");
  const { superProps, userAgent } = await getSuperProperties(launchSig, heartbeatSession);

  // Fetch analytics token
  addLog(userId, "[DBS] Requesting analytics authorization token from Discord...");
  let analyticsToken = "";
  try {
    analyticsToken = await fetchAnalyticsToken(decryptedToken, superProps, userAgent);
    addLog(userId, "[DBS] Analytics token acquired successfully.");
  } catch (err: any) {
    addLog(userId, `[DBS] Error acquiring analytics token: ${err.message}`);
    return { success: false, message: err.message };
  }

  // Resolve or generate genuine PE executable fingerprint
  let effectiveFingerprint = (options.fingerprint || user.dbsFingerprint || "").trim();
  if (!effectiveFingerprint) {
    addLog(userId, "[DBS] Generating authentic Windows PE executable fingerprint bound to your account...");
    effectiveFingerprint = generateExecutableFingerprint(userId);
    addLog(userId, "[DBS] PE executable fingerprint generated successfully.");
  }

  // Build telemetry events for all selected games
  let seq = 0;
  const seqGen = () => ++seq;
  const allEvents: any[] = [];

  for (const game of selectedGames) {
    const sessionEvents = buildGameSessionEvents(
      game,
      hours,
      { heartbeatSession, launchSig },
      seqGen,
      effectiveFingerprint
    );
    allEvents.push(...sessionEvents);
  }

  // Chunk events into batches of MAX_EVENTS_PER_BATCH (45 events)
  const totalBatches = Math.ceil(allEvents.length / MAX_EVENTS_PER_BATCH);
  let gamesProcessed = 0;
  let hoursClaimed = 0;
  const totalProjectedHours = isHoursMode ? selectedGames.length * hours : 0;

  addLog(
    userId,
    `[DBS] Starting queue: ${selectedGames.length} games across ${totalBatches} batches (${
      isHoursMode
        ? `${hours}h per game · ${totalProjectedHours.toLocaleString()}h total`
        : "Games Played count mode"
    }).`
  );

  setDbsStatus(userId, {
    isRunning: true,
    currentBatch: 0,
    totalBatches,
    gamesProcessed: 0,
    totalGames: selectedGames.length,
    hoursClaimed: 0,
    mode: options.mode,
    statusText: `Starting batch 1/${totalBatches}...`,
    startTime: Date.now(),
  });

  // Save latest options and generated fingerprint to user config in db
  saveUser(userId, {
    dbsCookie: cookieValue,
    dbsFingerprint: effectiveFingerprint,
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

    const chunkEvents = allEvents.slice(b * MAX_EVENTS_PER_BATCH, (b + 1) * MAX_EVENTS_PER_BATCH);

    setDbsStatus(userId, {
      isRunning: true,
      currentBatch: b + 1,
      totalBatches,
      gamesProcessed,
      totalGames: selectedGames.length,
      hoursClaimed,
      mode: options.mode,
      statusText: `Sending batch ${b + 1}/${totalBatches} (${chunkEvents.length} events)...`,
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
          "user-agent": userAgent,
          "x-debug-options": "bugReporterEnabled",
          "x-discord-locale": "en-US",
          "x-discord-timezone": "UTC",
          "x-super-properties": superProps,
        },
        body: JSON.stringify({
          token: analyticsToken,
          events: chunkEvents,
        }),
      });

      if (response.status === 204) {
        // Approximate processed games in this batch
        const approxGamesInBatch = Math.max(1, Math.round(chunkEvents.length / 3));
        gamesProcessed = Math.min(selectedGames.length, gamesProcessed + approxGamesInBatch);
        if (isHoursMode) {
          hoursClaimed = Math.min(totalProjectedHours, hoursClaimed + approxGamesInBatch * hours);
        }

        addLog(
          userId,
          `[DBS] Batch ${b + 1}/${totalBatches} accepted (204 No Content) · ${gamesProcessed}/${selectedGames.length} games registered.`
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
  const updatedGamesCount = (currentUser?.dbsTotalGamesClaimed || 0) + selectedGames.length;
  const updatedHoursCount = (currentUser?.dbsTotalHoursClaimed || 0) + (isHoursMode ? totalProjectedHours : 0);

  saveUser(userId, {
    dbsTotalGamesClaimed: updatedGamesCount,
    dbsTotalHoursClaimed: Math.round(updatedHoursCount * 10) / 10,
    dbsLastRunTimestamp: new Date().toISOString(),
  });

  setDbsStatus(userId, null);
  addLog(
    userId,
    `[DBS] Completed successfully! Credited ${selectedGames.length} games (${
      isHoursMode ? `${totalProjectedHours.toLocaleString()}h total` : "Games Played count"
    } dispatched to profile analytics). Badges update on Discord's backend cycle (24–48 hours).`
  );

  return {
    success: true,
    message: `Credited ${selectedGames.length} games successfully.`,
  };
}
