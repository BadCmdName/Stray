"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAlley } from "@/context/AlleyContext";
import { AuthGate } from "@/components/AuthGate";

const BadgeIcon = () => (
  <svg className="h-5 w-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
  </svg>
);

export default function BadgesPage() {
  const {
    token,
    dbsCookie,
    setDbsCookie,
    dbsHoursPerGame,
    setDbsHoursPerGame,
    dbsGameCount,
    setDbsGameCount,
    dbsMode,
    setDbsMode,
    dbsStatus,
    dbsStarting,
    dbsStopping,
    dbsTotalGamesClaimed,
    dbsTotalHoursClaimed,
    dbsLastRunTimestamp,
    handleStartDbs,
    handleStopDbs,
    handleSaveDbsConfig,
    logs,
    getLogColorClass,
  } = useAlley();

  const [showCookie, setShowCookie] = useState(false);

  const dbsLogs = logs.filter(
    (l) =>
      l.toLowerCase().includes("dbs") ||
      l.toLowerCase().includes("badge") ||
      l.toLowerCase().includes("detectables") ||
      l.toLowerCase().includes("cookie") ||
      l.toLowerCase().includes("hours")
  );

  const totalCalculatedHours = dbsGameCount * dbsHoursPerGame;

  const handlePasteCookie = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setDbsCookie(text.trim());
        handleSaveDbsConfig({ cookie: text.trim() });
      }
    } catch {}
  };

  return (
    <AuthGate>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
        {/* Top Header Card */}
        <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl shadow-inner">
              <BadgeIcon />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Discord Badge Spoofer (DBS)
                </h1>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  v4.0.0
                </span>
                {dbsStatus?.isRunning ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold bg-indigo-500 text-white px-2.5 py-0.5 rounded-full animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.5)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    Spoofing In Progress
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Inflate playtime hours and games played statistics directly on your Discord profile.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            {dbsStatus?.isRunning ? (
              <button
                onClick={handleStopDbs}
                disabled={dbsStopping}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs tracking-wide rounded-xl transition-all shadow-lg hover:shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
              >
                {dbsStopping ? "Stopping..." : "Stop Spoofer"}
              </button>
            ) : (
              <button
                onClick={handleStartDbs}
                disabled={dbsStarting || !token}
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs tracking-wide rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 cursor-pointer"
              >
                {dbsStarting ? "Starting..." : "Start Badge Spoofing"}
              </button>
            )}
          </div>
        </div>

        {/* Live Progress Bar Banner (active during run) */}
        {dbsStatus?.isRunning && (
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-5 flex flex-col gap-3 animate-fadeIn shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                Batch {dbsStatus.currentBatch} of {dbsStatus.totalBatches}
              </span>
              <span className="font-mono text-zinc-300 text-xs font-semibold">
                {dbsStatus.gamesProcessed} / {dbsStatus.totalGames} titles credited
              </span>
            </div>

            <div className="w-full bg-black/60 rounded-full h-2.5 overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${
                    dbsStatus.totalGames > 0
                      ? Math.min(100, Math.round((dbsStatus.gamesProcessed / dbsStatus.totalGames) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="truncate">{dbsStatus.statusText}</span>
              {dbsStatus.hoursClaimed > 0 && (
                <span className="font-mono text-indigo-300 font-semibold shrink-0 ml-2">
                  +{dbsStatus.hoursClaimed.toLocaleString()}h credited
                </span>
              )}
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 bg-[#121217] p-1.5 rounded-2xl border border-white/[0.08] shadow-lg">
          <button
            type="button"
            onClick={() => {
              setDbsMode("hours");
              handleSaveDbsConfig({ mode: "hours" });
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              dbsMode === "hours"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>⏱️ Playtime Hours Mode</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDbsMode("games");
              handleSaveDbsConfig({ mode: "games" });
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              dbsMode === "games"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🎮 Games Played Count Mode</span>
          </button>
        </div>

        {/* Configuration Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Volume & Duration */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
            <div className="border-b border-white/[0.06] pb-3">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                Parameters
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                Volume &amp; Playtime Target
              </h3>
            </div>

            {dbsMode === "hours" && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    Hours Per Game Title
                  </label>
                  <span className="text-xs font-mono text-indigo-300 font-semibold">
                    {dbsHoursPerGame}h / game
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0.1}
                    max={9999}
                    step={1}
                    value={dbsHoursPerGame}
                    onChange={(e) => {
                      const val = Math.max(0.1, Number(e.target.value) || 1);
                      setDbsHoursPerGame(val);
                      handleSaveDbsConfig({ hoursPerGame: val });
                    }}
                    className="w-24 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono text-center focus:border-indigo-500/50 transition-colors"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[1, 10, 50, 100, 500].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => {
                          setDbsHoursPerGame(h);
                          handleSaveDbsConfig({ hoursPerGame: h });
                        }}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          dbsHoursPerGame === h
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                            : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white hover:bg-white/5"
                        }`}
                      >
                        +{h}h
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-zinc-500">
                  Target duration dispatched per detected title.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Titles to Process
                </label>
                <span className="text-xs font-mono text-indigo-300 font-semibold">
                  {dbsGameCount} titles
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={800}
                  step={1}
                  value={dbsGameCount}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(800, Number(e.target.value) || 1));
                    setDbsGameCount(val);
                    handleSaveDbsConfig({ gameCount: val });
                  }}
                  className="w-24 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono text-center focus:border-indigo-500/50 transition-colors"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[5, 10, 25, 50, 100].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setDbsGameCount(c);
                        handleSaveDbsConfig({ gameCount: c });
                      }}
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        dbsGameCount === c
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                          : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[11px] text-zinc-500">
                Randomly selected from Discord&apos;s official detectable games catalog.
              </span>
            </div>

            {/* Total Calculation Card */}
            <div className="bg-black/30 border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block font-semibold">
                  Estimated Total
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {dbsMode === "hours"
                    ? `${totalCalculatedHours.toLocaleString()} Total Hours`
                    : `${dbsGameCount} Unique Games Spoofed`}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-lg">
                {Math.ceil(dbsGameCount / 15)} Batches
              </span>
            </div>
          </div>

          {/* Right Column: Cloudflare Cookie */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="border-b border-white/[0.06] pb-3">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                  Clearance
                </span>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                  Cloudflare Cookie
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    cf_clearance Cookie
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePasteCookie}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition cursor-pointer font-medium"
                    >
                      Paste
                    </button>
                    <span className="text-zinc-600">·</span>
                    <button
                      type="button"
                      onClick={() => setShowCookie(!showCookie)}
                      className="text-[11px] text-zinc-400 hover:text-white transition cursor-pointer font-medium"
                    >
                      {showCookie ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type={showCookie ? "text" : "password"}
                    value={dbsCookie}
                    onChange={(e) => {
                      setDbsCookie(e.target.value);
                      handleSaveDbsConfig({ cookie: e.target.value });
                    }}
                    placeholder="Paste cf_clearance cookie value..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 font-mono focus:border-indigo-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Extraction Helper */}
              <div className="bg-black/30 border border-white/[0.06] rounded-xl p-3.5 text-xs text-zinc-400 flex flex-col gap-1.5 leading-relaxed">
                <span className="font-semibold text-zinc-300 text-[11px]">How to obtain your cookie:</span>
                <ol className="list-decimal pl-4 space-y-1 text-zinc-400 text-[11px]">
                  <li>Open <a href="https://discord.com/app" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">discord.com</a> in your browser and log in.</li>
                  <li>Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-[10px]">F12</kbd> &gt; <strong>Application</strong> &gt; <strong>Cookies</strong> &gt; <code className="text-zinc-300">discord.com</code>.</li>
                  <li>Copy the value for the <code className="text-indigo-300 font-mono font-semibold">cf_clearance</code> cookie.</li>
                </ol>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 border-t border-white/[0.06] pt-3">
              Your cookie is securely stored in your local encrypted configuration and used solely to authenticate Discord telemetry events.
            </div>
          </div>
        </div>

        {/* Lifetime Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-1 shadow-xl">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Lifetime Playtime Credited</span>
            <span className="text-2xl font-bold text-white font-mono tracking-tight mt-0.5">
              {(dbsTotalHoursClaimed || 0).toLocaleString()}h
            </span>
            <span className="text-[11px] text-zinc-500">Total duration sent to Discord</span>
          </div>

          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-1 shadow-xl">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Lifetime Titles Spoofed</span>
            <span className="text-2xl font-bold text-white font-mono tracking-tight mt-0.5">
              {(dbsTotalGamesClaimed || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-zinc-500">Unique game launch sessions</span>
          </div>

          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-1 shadow-xl">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Last Execution</span>
            <span className="text-sm font-semibold text-white mt-1">
              {dbsLastRunTimestamp ? new Date(dbsLastRunTimestamp).toLocaleDateString() : "Never Run"}
            </span>
            <span className="text-[10px] text-indigo-400 font-medium mt-1">
              ℹ️ Discord profile badges refresh within 24–48 hours
            </span>
          </div>
        </div>

        {/* DBS Telemetry Logs Viewport */}
        <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Badge Spoofer Activity Logs</span>
              <span className="text-[9px] font-mono text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                Live
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Showing last {dbsLogs.length} events
            </span>
          </div>

          <div className="bg-black/50 border border-white/[0.06] rounded-xl p-4 font-mono text-[11px] h-48 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
            {dbsLogs.length === 0 ? (
              <span className="text-zinc-600 italic">No badge spoofer events recorded yet. Configure parameters and click Start to begin.</span>
            ) : (
              dbsLogs.map((log, idx) => (
                <div key={idx} className={`leading-relaxed ${getLogColorClass(log)}`}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Creator Attribution */}
        <div className="bg-black/20 border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <p>
            Stray&apos;s Badge Spoofer is built using{" "}
            <a
              href="https://github.com/revere-group/discord-badge-spoofer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline font-semibold"
            >
              DBS
            </a>
            . Massive thanks to the original creator.
          </p>
          <Link href="/" className="text-indigo-400 hover:text-white transition font-semibold text-xs shrink-0">
            ← Back to Presence
          </Link>
        </div>
      </div>
    </AuthGate>
  );
}
