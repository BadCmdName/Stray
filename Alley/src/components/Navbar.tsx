"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAlley } from "@/context/AlleyContext";

const QuestIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const BadgeIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
  </svg>
);

const HomeIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export function Navbar() {
  const pathname = usePathname();
  const {
    session,
    isRunning,
    processingQuests,
    questsList,
    dbsStatus,
    setShowLogoutModal,
    updateNotification,
  } = useAlley();

  const isHomeActive = pathname === "/" || pathname === "";
  const isQuestsActive = pathname.startsWith("/quests") || pathname.startsWith("/dqacs");
  const isBadgesActive = pathname.startsWith("/badges") || pathname.startsWith("/dbs");

  return (
    <>
      {updateNotification && (
        <div className="w-full bg-amber-400 text-black border-b-2 border-black px-6 py-2.5 flex items-center justify-between text-xs font-black uppercase tracking-wider animate-fadeIn z-50">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              Stray {updateNotification.latestVersion} is released!{" "}
              {updateNotification.isFork ? "Resync your fork now!" : "Please update to latest version."}
            </span>
          </div>
          <a
            href="https://github.com/BadCmdName/Stray"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-amber-400 border border-black px-3 py-1 rounded-lg text-[10px] font-black tracking-wide hover:opacity-90 transition"
          >
            Get Update
          </a>
        </div>
      )}

      <header className="border-b border-white/5 bg-[#121216]/95 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/Stray.svg" alt="Stray Logo" className="h-7 w-7 transition-transform group-hover:scale-105" />
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-white uppercase">STRAY ALLEY</span>
              <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30 px-1.5 py-0.5 rounded">
                v4.0.0
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 bg-black/40 border border-white/5 p-1 rounded-xl">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isHomeActive
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <HomeIcon />
              <span>Presence</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-zinc-600"
                }`}
                title={isRunning ? "Gateway Connected" : "Gateway Offline"}
              />
            </Link>

            <Link
              href="/quests"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isQuestsActive
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-sm"
                  : "text-zinc-400 hover:text-amber-400 hover:bg-white/5"
              }`}
            >
              <QuestIcon />
              <span>DQACS Quests</span>
              {processingQuests ? (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-amber-400 text-black px-1.5 py-0.5 rounded animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-black" />
                  Running
                </span>
              ) : questsList.length > 0 ? (
                <span className="text-[10px] font-mono font-bold bg-black/60 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5">
                  {questsList.length}
                </span>
              ) : null}
            </Link>

            <Link
              href="/badges"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isBadgesActive
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-indigo-400 hover:bg-white/5"
              }`}
            >
              <BadgeIcon />
              <span>DBS Badges</span>
              {dbsStatus?.isRunning ? (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-indigo-500 text-white px-1.5 py-0.5 rounded animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  Spoofing
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  NEW
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* User Status & Logout */}
        <div className="flex items-center gap-3">
          {session && (
            <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-zinc-300">{session.username}</span>
            </div>
          )}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-500 rounded-xl font-bold uppercase text-[11px] tracking-wider transition-all"
          >
            Leave Alley
          </button>
        </div>
      </header>
    </>
  );
}
