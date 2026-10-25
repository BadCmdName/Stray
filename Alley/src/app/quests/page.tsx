"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAlley } from "@/context/AlleyContext";
import { AuthGate } from "@/components/AuthGate";

const QuestIcon = () => (
  <svg className="h-6 w-6 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function QuestsPage() {
  const {
    token,
    processingQuests,
    isStoppingQuests,
    loadingQuests,
    questsList,
    liveRpcQuests,
    includeDecorationQuests,
    activeQuestRpc,
    fetchUserQuests,
    handleLiveRpcToggle,
    handleIncludeDecorationToggle,
    handleProcessAllQuests,
    handleStopQuests,
    handleClaimSingleQuest,
    logs,
    getLogColorClass,
  } = useAlley();

  const [filterTab, setFilterTab] = useState<"all" | "claimable" | "in_progress" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tier1Count = questsList.filter((q) => q.hierarchy?.tier === "ORBS_VIDEO").length;
  const tier2Count = questsList.filter((q) => q.hierarchy?.tier === "ORBS_GAME").length;
  const tier3Count = questsList.filter((q) => q.hierarchy?.tier === "DECORATION_OTHER").length;

  const questLogs = logs.filter(
    (l) =>
      l.toLowerCase().includes("quest") ||
      l.toLowerCase().includes("dqacs") ||
      l.toLowerCase().includes("heartbeat") ||
      l.toLowerCase().includes("reward")
  );

  const filteredQuests = questsList.filter((q) => {
    const titleMatch = (q.config?.messages?.quest_name || q.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const gameMatch = (q.config?.messages?.game_title || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery && !titleMatch && !gameMatch) return false;

    if (filterTab === "claimable") return q.can_claim || q.is_claimed === false && q.progress >= 100;
    if (filterTab === "completed") return q.is_claimed || q.claimed_at;
    if (filterTab === "in_progress") return (q.enrolled && !q.is_claimed) || (q.progress > 0 && q.progress < 100);
    return true;
  });

  return (
    <AuthGate>
      <div className="flex flex-col gap-6">
        {/* Top Header Card */}
        <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-2xl shadow-inner">
              <QuestIcon />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Auto-Quest Complete (DQACS)
                </h1>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  v4.0.0
                </span>
                {processingQuests ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold bg-amber-400 text-black px-2.5 py-0.5 rounded-full animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.5)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black" />
                    Processing Queue
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Auto-complete active Discord gaming and media quests in prioritized hierarchy order.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap relative z-10">
            <button
              onClick={fetchUserQuests}
              disabled={loadingQuests || !token}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Refresh quests list from Discord"
            >
              <RefreshIcon />
              <span>{loadingQuests ? "Refreshing..." : "Refresh"}</span>
            </button>

            {processingQuests ? (
              <button
                onClick={handleStopQuests}
                disabled={isStoppingQuests}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs tracking-wide rounded-xl shadow-lg hover:shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isStoppingQuests ? "Stopping..." : "Stop Processing"}
              </button>
            ) : (
              <button
                onClick={handleProcessAllQuests}
                disabled={loadingQuests || !token}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs tracking-wide rounded-xl shadow-lg hover:shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
              >
                Complete All Quests
              </button>
            )}
          </div>
        </div>

        {/* Quick Settings & Hierarchy Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls & Live-RPC Card */}
          <div className="bg-[#111115] border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                EXECUTION PARAMETERS
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wide mt-1">
                Automation Options
              </h3>
            </div>

            <div className="flex flex-col gap-4 bg-black/40 border border-white/5 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Broadcast Live-RPC</span>
                  <span className="text-[10px] text-zinc-400 block">Streams active quest as game activity</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={liveRpcQuests}
                    onChange={(e) => handleLiveRpcToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#0e0e11] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400 border border-zinc-700" />
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div>
                  <span className="text-xs font-bold text-white block">Include Tier 3 Tasks</span>
                  <span className="text-[10px] text-zinc-400 block">Decorations &amp; partner activities</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDecorationQuests}
                    onChange={(e) => handleIncludeDecorationToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#0e0e11] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-400 border border-zinc-700" />
                </label>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 leading-relaxed">
              Quests are completed automatically in sequential hierarchy order. Video quests run first with rapid progression, followed by simulated game streaming.
            </div>
          </div>

          {/* 3-Tier Hierarchy Visualizer */}
          <div className="lg:col-span-2 bg-[#111115] border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">
                DQACS HIERARCHY EXECUTION ORDER
              </span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">
                {questsList.length} TOTAL DETECTED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tier 1: Orbs (Video) */}
              <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-purple-400 tracking-wider">
                    1. Orbs (Video)
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded">
                    {tier1Count}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  First priority · Video stream &amp; media watch quests completed instantly.
                </p>
                <span className="text-[9px] font-mono text-purple-300 uppercase font-bold">
                  ⚡ TOP PRIORITY
                </span>
              </div>

              {/* Tier 2: Orbs (Games) */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
                    2. Orbs (Games)
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
                    {tier2Count}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Second priority · Discord game stream &amp; gameplay simulation quests.
                </p>
                <span className="text-[9px] font-mono text-amber-300 uppercase font-bold">
                  🎮 GAME SIMULATION
                </span>
              </div>

              {/* Tier 3: Decoration & Other */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                    3. Decoration
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {tier3Count}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Last priority · Avatar decorations, partner tasks, and other activities.
                </p>
                <span className="text-[9px] font-mono text-emerald-300 uppercase font-bold">
                  {includeDecorationQuests ? "INCLUDED" : "EXCLUDED"}
                </span>
              </div>
            </div>

            {/* Active Quest Live Spotlight */}
            {activeQuestRpc && (
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-3 flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase block">
                      CURRENTLY STREAMING QUEST
                    </span>
                    <span className="text-xs font-black text-white">
                      {activeQuestRpc.name || activeQuestRpc.details || "Processing Quest..."}
                    </span>
                  </div>
                </div>
                {activeQuestRpc.state && (
                  <span className="text-xs font-mono text-zinc-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                    {activeQuestRpc.state}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quests Directory & List */}
        <div className="bg-[#111115] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 p-1 rounded-xl">
              {(
                [
                  { id: "all", label: "All Quests", count: questsList.length },
                  { id: "in_progress", label: "In Progress", count: questsList.filter((q) => q.enrolled && !q.is_claimed).length },
                  { id: "claimable", label: "Claimable", count: questsList.filter((q) => q.can_claim).length },
                  { id: "completed", label: "Completed", count: questsList.filter((q) => q.is_claimed).length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    filterTab === tab.id
                      ? "bg-amber-400 text-black shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      filterTab === tab.id ? "bg-black/20 text-black" : "bg-black/40 text-zinc-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quest or game title..."
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 w-full sm:w-64"
              />
            </div>
          </div>

          {/* Quests Grid */}
          {loadingQuests ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <div className="h-8 w-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Fetching Quests from Discord...</span>
            </div>
          ) : filteredQuests.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <span className="text-2xl">🎮</span>
              <p className="font-bold uppercase tracking-wider">No quests found in this category</p>
              <p className="text-[11px] text-zinc-600">
                Ensure your Discord token is configured and valid, then click Refresh.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuests.map((quest) => {
                const questName = quest.config?.messages?.quest_name || quest.name || "Discord Quest";
                const gameTitle = quest.config?.messages?.game_title || "Discord Activity";
                const tier = quest.hierarchy?.tier || "OTHER";
                const isClaimed = quest.is_claimed || quest.claimed_at;
                const canClaim = quest.can_claim || (!isClaimed && quest.progress >= 100);

                return (
                  <div
                    key={quest.id}
                    className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-amber-400/30 transition-all duration-200"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                            tier === "ORBS_VIDEO"
                              ? "bg-purple-950/40 text-purple-300 border-purple-500/30"
                              : tier === "ORBS_GAME"
                              ? "bg-amber-950/40 text-amber-300 border-amber-500/30"
                              : "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {tier === "ORBS_VIDEO" ? "Tier 1 · Video" : tier === "ORBS_GAME" ? "Tier 2 · Game" : "Tier 3 · Other"}
                        </span>

                        {isClaimed ? (
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            CLAIMED
                          </span>
                        ) : canClaim ? (
                          <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded animate-pulse">
                            READY TO CLAIM
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-zinc-500">
                            {quest.progress ? `${Math.round(quest.progress)}%` : "0%"}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">{questName}</h4>
                        <span className="text-[11px] text-zinc-400">{gameTitle}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        ID: {quest.id.slice(0, 8)}...
                      </span>

                      {canClaim ? (
                        <button
                          onClick={() => handleClaimSingleQuest(quest.id)}
                          className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-[10px] tracking-wider rounded-lg transition"
                        >
                          Claim Reward
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-400">
                          {isClaimed ? "Complete" : "In Queue"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DQACS Telemetry Logs Viewport */}
        <div className="bg-[#111115] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">DQACS Quest Activity Logs</span>
              <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
                REAL-TIME
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Showing last {questLogs.length} quest events
            </span>
          </div>

          <div className="bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[11px] h-48 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
            {questLogs.length === 0 ? (
              <span className="text-zinc-600 italic">No quest events registered yet. Start the queue to begin stream logging.</span>
            ) : (
              questLogs.map((log, idx) => (
                <div key={idx} className={`leading-relaxed ${getLogColorClass(log)}`}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Creator Attribution */}
        <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <p>
            Stray&apos;s Auto-Quest Complete is built using{" "}
            <a
              href="https://github.com/aiko-chan-ai/Discord-Quest-Auto-Completion-Selfbot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline font-bold"
            >
              DQACS
            </a>
            . Massive thanks to the original creator.
          </p>
          <Link href="/" className="text-amber-400 hover:text-white transition font-bold text-xs shrink-0">
            ← Back to Presence Overview
          </Link>
        </div>
      </div>
    </AuthGate>
  );
}
