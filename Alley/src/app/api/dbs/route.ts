import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUser, saveUser } from "@/lib/db";
import { getDbsStatus } from "@/lib/daemon";
import {
  runDbsSpoofer,
  stopDbsProcessing,
  loadDbsGames,
  DbsRunOptions,
} from "@/lib/badgeSpoofer";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = getUser(session.userId);
  const status = getDbsStatus(session.userId);
  const games = await loadDbsGames();

  return NextResponse.json({
    status,
    totalGamesAvailable: games.length,
    config: {
      cookie: user?.dbsCookie || "",
      fingerprint: user?.dbsFingerprint || "",
      hoursPerGame: user?.dbsHoursPerGame || 1,
      gameCount: user?.dbsGameCount || 50,
      mode: user?.dbsMode || "hours",
      totalGamesClaimed: user?.dbsTotalGamesClaimed || 0,
      totalHoursClaimed: user?.dbsTotalHoursClaimed || 0,
      lastRunTimestamp: user?.dbsLastRunTimestamp || null,
    },
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action;

    // Accept parameters directly from body or inside options object
    const rawCookie = String(body.cookie ?? body.options?.cookie ?? "").trim();
    const rawFingerprint = body.fingerprint ?? body.options?.fingerprint;
    const hoursPerGame = Number(body.hoursPerGame ?? body.options?.hoursPerGame) || 1;
    const gameCount = Number(body.gameCount ?? body.options?.gameCount) || 50;
    const mode = (body.mode ?? body.options?.mode) === "games" ? "games" : "hours";

    if (action === "STOP") {
      stopDbsProcessing(session.userId);
      return NextResponse.json({ success: true, message: "DBS processing stopped." });
    }

    if (action === "SAVE_CONFIG") {
      saveUser(session.userId, {
        ...(rawCookie ? { dbsCookie: rawCookie } : {}),
        ...(rawFingerprint !== undefined ? { dbsFingerprint: String(rawFingerprint).trim() } : {}),
        dbsHoursPerGame: hoursPerGame,
        dbsGameCount: gameCount,
        dbsMode: mode,
      });
      return NextResponse.json({ success: true, message: "Settings saved." });
    }

    if (action === "START") {
      const currentStatus = getDbsStatus(session.userId);
      if (currentStatus?.isRunning) {
        return NextResponse.json(
          { error: "DBS spoofing job is already running." },
          { status: 409 }
        );
      }

      // Automatically persist settings to user configuration on start
      saveUser(session.userId, {
        ...(rawCookie ? { dbsCookie: rawCookie } : {}),
        ...(rawFingerprint !== undefined ? { dbsFingerprint: String(rawFingerprint).trim() } : {}),
        dbsHoursPerGame: hoursPerGame,
        dbsGameCount: gameCount,
        dbsMode: mode,
      });

      const user = getUser(session.userId);
      const effectiveCookie = rawCookie || user?.dbsCookie || "";

      const runOpts: DbsRunOptions = {
        mode,
        gameCount,
        hoursPerGame,
        cookie: effectiveCookie,
        fingerprint: rawFingerprint ? String(rawFingerprint).trim() : (user?.dbsFingerprint || undefined),
      };

      // Run asynchronously in the background so request returns immediately
      runDbsSpoofer(session.userId, runOpts).catch((err) => {
        console.error(`[DBS] Background job exception for user ${session.userId}:`, err);
      });

      return NextResponse.json({
        success: true,
        message: "DBS spoofing started in background.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
