"use client";

import React from "react";
import { useAlley } from "@/context/AlleyContext";
import { Navbar } from "./Navbar";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const {
    authChecked,
    session,
    authError,
    keyInput,
    setKeyInput,
    handleKeySubmit,
    showLogoutModal,
    setShowLogoutModal,
    remainingTimeText,
    isTokenValidOnOpen,
    handleLogout,
  } = useAlley();

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0e0e11] text-[#f4f4f5] flex items-center justify-center font-sans">
        <div className="h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0e0e11] text-[#f4f4f5] flex items-center justify-center font-sans p-6 select-none">
        <div className="w-full max-w-md bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
          <img src="/Stray.svg" alt="Stray Logo" className="h-16 w-16 mb-6" />
          <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2">STRAY ALLEY</h1>
          <p className="text-xs text-zinc-400 font-medium mb-8 max-w-xs leading-relaxed">
            Authorized presence controller playground. Enter your Stray Key to connect.
          </p>

          {authError && (
            <div className="w-full bg-rose-950/20 border-2 border-rose-900 text-rose-400 p-4 rounded-xl text-xs font-semibold mb-6">
              {authError}
            </div>
          )}

          <form onSubmit={handleKeySubmit} className="w-full flex flex-col gap-4">
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your Stray Key here..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 transition font-mono"
            />
            <button
              type="submit"
              className="w-full py-4 bg-amber-400 border-2 border-black text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Enter Stray Alley
            </button>
          </form>

          <div className="mt-6 text-xs font-semibold text-zinc-500">
            Need a key?{" "}
            <a
              href="https://stray-ltm.vercel.app/api/auth/login"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-500 transition underline"
            >
              Get your Stray Key here
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#f4f4f5] flex flex-col font-sans select-none animate-fadeIn relative">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8">
        {children}
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Leave Stray Alley?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to log out? Your presence daemon will remain running in background mode if configured.
            </p>

            {remainingTimeText && isTokenValidOnOpen && (
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Current Key Validity:</span>
                <span className="font-mono text-amber-400 font-bold">{remainingTimeText} remaining</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-black bg-rose-500 hover:bg-rose-400 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
