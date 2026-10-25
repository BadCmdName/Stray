"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAlley } from "@/context/AlleyContext";
import { AuthGate } from "@/components/AuthGate";

const QuestIcon = () => (
  <svg className="h-5 w-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const BadgeIcon = () => (
  <svg className="h-5 w-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-10 w-10 text-zinc-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

const GameIcon = () => (
  <svg className="h-7 w-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function Home() {
  const {
    token,
    setToken,
    verifyingToken,
    tokenValidationMsg,
    verifiedProfile,
    triggerTokenCheck,
    device,
    setDevice,
    status,
    setStatus,
    customStatus,
    setCustomStatus,
    customStatusEmoji,
    setCustomStatusEmoji,
    rotationEnabled,
    setRotationEnabled,
    rotationInterval,
    setRotationInterval,
    rotationStatus1Text,
    setRotationStatus1Text,
    rotationStatus1Emoji,
    setRotationStatus1Emoji,
    rotationStatus2Text,
    setRotationStatus2Text,
    rotationStatus2Emoji,
    setRotationStatus2Emoji,
    rotationStatus3Text,
    setRotationStatus3Text,
    rotationStatus3Emoji,
    setRotationStatus3Emoji,
    rpcEnabled,
    setRpcEnabled,
    rpcType,
    setRpcType,
    rpcUrl,
    setRpcUrl,
    rpcClientId,
    setRpcClientId,
    rpcName,
    setRpcName,
    rpcState,
    setRpcState,
    rpcDetails,
    setRpcDetails,
    rpcLargeImage,
    setRpcLargeImage,
    rpcLargeText,
    setRpcLargeText,
    rpcSmallImage,
    setRpcSmallImage,
    rpcSmallText,
    setRpcSmallText,
    cloudSyncEnabled,
    setCloudSyncEnabled,
    cloudTermsAccepted,
    setCloudTermsAccepted,
    showCloudConsentModal,
    setShowCloudConsentModal,
    lastSyncTimestamp,
    termsAccepted,
    handleAcceptTerms,
    isRunning,
    isPublishing,
    isStopping,
    handlePublish,
    handleStop,
    cooldownRemaining,
    cooldownErrorMsg,
    // DQACS Hub data
    processingQuests,
    questsList,
    handleProcessAllQuests,
    handleStopQuests,
    // DBS Hub data
    dbsStatus,
    handleStartDbs,
    handleStopDbs,
    dbsTotalGamesClaimed,
    dbsTotalHoursClaimed,
    // Logs & formatting
    logs,
    renderEmoji,
    getRpcImageUrl,
    getLogColorClass,
    getRpcTypeLabel,
  } = useAlley();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${s < 10 ? "0" : ""}${s} elapsed`;
    }
    return `${mins}:${s < 10 ? "0" : ""}${s} elapsed`;
  };

  const statusColors: Record<string, string> = {
    online: "bg-emerald-500",
    idle: "bg-amber-500",
    dnd: "bg-rose-500",
    invisible: "bg-zinc-500",
  };

  const avatarUrl = verifiedProfile?.avatar
    ? `https://cdn.discordapp.com/avatars/${verifiedProfile.id}/${verifiedProfile.avatar}.png`
    : null;

  const rpcLargeImgSrc = getRpcImageUrl(rpcClientId, rpcLargeImage);
  const rpcSmallImgSrc = getRpcImageUrl(rpcClientId, rpcSmallImage);

  return (
    <AuthGate>
      <div className="flex flex-col gap-8">
        {/* MAIN PRESENCE STUDIO: 2-COLUMN VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Core Parameters, Status Rotation, RPC, Cloud Sync */}
          <div className="flex flex-col gap-6">
            {/* Core Parameters */}
            <div className="bg-[#111115] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-xl transition-colors hover:border-amber-500/20">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h2 className="text-base font-black text-white uppercase tracking-wider">Gateway Configuration</h2>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-zinc-600"}`} />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {isRunning ? "Gateway Connected" : "Stealth Offline"}
                  </span>
                </div>
              </div>

              {/* Discord Token */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Discord Account Token
                </label>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your Discord authorization token..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 transition font-mono"
                  />
                  <button
                    onClick={() => triggerTokenCheck(token)}
                    disabled={verifyingToken}
                    className="bg-black/40 border border-white/10 text-zinc-300 hover:text-white px-5 py-2.5 rounded-xl font-bold uppercase text-xs transition hover:bg-white/5 disabled:opacity-50 shrink-0"
                  >
                    {verifyingToken ? "Verifying..." : "Verify"}
                  </button>
                </div>
                {tokenValidationMsg && (
                  <span
                    className={`text-[10px] font-bold mt-1 ${
                      tokenValidationMsg.isError ? "text-rose-400 animate-pulse" : "text-emerald-400"
                    }`}
                  >
                    {tokenValidationMsg.text}
                  </span>
                )}
              </div>

              {/* Device & Status Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    Spoofed Device Type
                  </label>
                  <select
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                  >
                    <option value="desktop">Desktop Client</option>
                    <option value="mobile">Mobile Application</option>
                    <option value="web">Web Browser (Chrome)</option>
                    <option value="embedded">Xbox Console Interface</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    Profile Status Dot
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                  >
                    <option value="online">Online</option>
                    <option value="idle">Idle / Away</option>
                    <option value="dnd">Do Not Disturb</option>
                    <option value="invisible">Invisible / Stealth</option>
                  </select>
                </div>
              </div>

              {/* Custom Status */}
              {!rotationEnabled && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    Custom Status Message
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={customStatusEmoji}
                      onChange={(e) => setCustomStatusEmoji(e.target.value)}
                      placeholder="Emoji (:sob: or 🐱)"
                      className="w-1/3 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 transition text-center"
                    />
                    <input
                      type="text"
                      value={customStatus}
                      onChange={(e) => setCustomStatus(e.target.value)}
                      placeholder="What is Stray doing..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 transition"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Custom Status Rotation */}
            <div className="bg-[#111115] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-xl transition-colors hover:border-amber-500/20">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-base font-black text-white uppercase tracking-wider">Status Rotation</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rotationEnabled}
                    onChange={(e) => setRotationEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#0e0e11] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400 border border-zinc-700" />
                </label>
              </div>

              {rotationEnabled && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                      Rotation Interval (seconds)
                    </label>
                    <input
                      type="number"
                      min="3"
                      value={rotationInterval}
                      onChange={(e) => setRotationInterval(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 font-mono"
                    />
                  </div>

                  {/* Slot 1 */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={rotationStatus1Emoji}
                      onChange={(e) => setRotationStatus1Emoji(e.target.value)}
                      placeholder="Emoji 1"
                      className="w-1/4 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 text-center"
                    />
                    <input
                      type="text"
                      value={rotationStatus1Text}
                      onChange={(e) => setRotationStatus1Text(e.target.value)}
                      placeholder="Status Slot 1"
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200"
                    />
                  </div>

                  {/* Slot 2 */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={rotationStatus2Emoji}
                      onChange={(e) => setRotationStatus2Emoji(e.target.value)}
                      placeholder="Emoji 2"
                      className="w-1/4 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 text-center"
                    />
                    <input
                      type="text"
                      value={rotationStatus2Text}
                      onChange={(e) => setRotationStatus2Text(e.target.value)}
                      placeholder="Status Slot 2"
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200"
                    />
                  </div>

                  {/* Slot 3 */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={rotationStatus3Emoji}
                      onChange={(e) => setRotationStatus3Emoji(e.target.value)}
                      placeholder="Emoji 3"
                      className="w-1/4 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 text-center"
                    />
                    <input
                      type="text"
                      value={rotationStatus3Text}
                      onChange={(e) => setRotationStatus3Text(e.target.value)}
                      placeholder="Status Slot 3"
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rich Presence Configuration */}
            <div className="bg-[#111115] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-xl transition-colors hover:border-amber-500/20">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-base font-black text-white uppercase tracking-wider">Discord Rich Presence (RPC)</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rpcEnabled}
                    onChange={(e) => setRpcEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#0e0e11] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400 border border-zinc-700" />
                </label>
              </div>

              {rpcEnabled && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">Activity Type</label>
                      <select
                        value={rpcType}
                        onChange={(e) => setRpcType(Number(e.target.value))}
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200"
                      >
                        <option value={0}>Playing a Game</option>
                        <option value={1}>Streaming Live (Twitch/YouTube)</option>
                        <option value={2}>Listening to Audio</option>
                        <option value={3}>Watching Media</option>
                        <option value={5}>Competing in</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">Application / Client ID</label>
                      <input
                        type="text"
                        value={rpcClientId}
                        onChange={(e) => setRpcClientId(e.target.value)}
                        placeholder="1527635163591348254"
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">Activity Name (Title)</label>
                    <input
                      type="text"
                      value={rpcName}
                      onChange={(e) => setRpcName(e.target.value)}
                      placeholder="Stray"
                      className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">Details (Line 1)</label>
                      <input
                        type="text"
                        value={rpcDetails}
                        onChange={(e) => setRpcDetails(e.target.value)}
                        placeholder="Meowing at 3 AM"
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">State (Line 2)</label>
                      <input
                        type="text"
                        value={rpcState}
                        onChange={(e) => setRpcState(e.target.value)}
                        placeholder="Chasing red laser dots"
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">Large Image (URL or Key)</label>
                      <input
                        type="text"
                        value={rpcLargeImage}
                        onChange={(e) => setRpcLargeImage(e.target.value)}
                        placeholder="https://... or asset key"
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">Small Image (URL or Key)</label>
                      <input
                        type="text"
                        value={rpcSmallImage}
                        onChange={(e) => setRpcSmallImage(e.target.value)}
                        placeholder="https://... or asset key"
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Discord Profile Live Preview & Master Controls */}
          <div className="flex flex-col gap-6">
            {/* Live Profile Card Visualizer */}
            <div className="bg-[#111115] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h2 className="text-base font-black text-white uppercase tracking-wider">Live Profile Visualizer</h2>
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Interactive Preview</span>
              </div>

              {/* Discord Visualizer Mockup */}
              <div className="bg-[#232428] rounded-2xl p-5 border border-[#1f2023] flex flex-col gap-4 shadow-2xl relative overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-amber-400/20 via-indigo-500/20 to-purple-500/20 -mx-5 -mt-5" />

                <div className="flex items-end gap-3 -mt-10 px-1">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-[#1e1f22] border-4 border-[#232428] overflow-hidden flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon />
                      )}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#232428] ${
                        statusColors[status] || "bg-emerald-500"
                      }`}
                    />
                  </div>

                  <div className="flex flex-col mb-1">
                    <span className="text-base font-black text-white leading-tight">
                      {verifiedProfile?.username || "Stray Explorer"}
                    </span>
                    <span className="text-xs text-zinc-400">
                      @{verifiedProfile?.username?.toLowerCase() || "stray"}
                    </span>
                  </div>
                </div>

                {/* Custom Status Display */}
                {(customStatus || customStatusEmoji) && (
                  <div className="bg-[#1e1f22] rounded-xl px-3 py-2 text-xs text-zinc-200 flex items-center">
                    {renderEmoji(customStatusEmoji)}
                    <span className="truncate">{customStatus}</span>
                  </div>
                )}

                {/* Rich Presence Mockup */}
                {rpcEnabled && (
                  <div className="bg-[#1e1f22] rounded-xl p-3.5 flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      {getRpcTypeLabel(rpcType)}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="h-14 w-14 rounded-xl bg-black/40 overflow-hidden flex items-center justify-center border border-white/5">
                          {rpcLargeImgSrc ? (
                            <img src={rpcLargeImgSrc} alt="RPC" className="h-full w-full object-cover" />
                          ) : (
                            <GameIcon />
                          )}
                        </div>
                        {rpcSmallImgSrc && (
                          <img
                            src={rpcSmallImgSrc}
                            alt="Small"
                            className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[#1e1f22] object-cover"
                          />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-white truncate">{rpcName || "Stray"}</span>
                        {rpcDetails && <span className="text-[11px] text-zinc-300 truncate">{rpcDetails}</span>}
                        {rpcState && <span className="text-[11px] text-zinc-400 truncate">{rpcState}</span>}
                        <span className="text-[10px] font-mono text-zinc-500 mt-0.5">{formatElapsed(elapsedSeconds)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Master Gateway Control & Save Button */}
              <div className="flex flex-col gap-3">
                {cooldownErrorMsg && (
                  <span className="text-xs font-bold text-rose-400 text-center animate-pulse">
                    {cooldownErrorMsg}
                  </span>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {isRunning ? (
                    <button
                      onClick={handleStop}
                      disabled={isStopping}
                      className="py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs tracking-wide rounded-xl shadow-lg hover:shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isStopping ? "Stopping..." : "Stealth Disconnect"}
                    </button>
                  ) : (
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing || !token}
                      className="py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isPublishing ? "Starting..." : "Start Presence"}
                    </button>
                  )}

                  <button
                    onClick={handlePublish}
                    disabled={isPublishing || cooldownRemaining > 0 || !token}
                    className="py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs tracking-wide rounded-xl shadow-lg hover:shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {cooldownRemaining > 0 ? `Wait ${cooldownRemaining}s` : "Save & Publish"}
                  </button>
                </div>
              </div>
            </div>

            {/* Cloud Sync Backup Card */}
            <div className="bg-[#111115] border border-white/5 rounded-2xl p-6 flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Cloud Encrypted Sync</h3>
                  <p className="text-[11px] text-zinc-400">Backs up encrypted token &amp; presence settings to your Stray Key.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cloudSyncEnabled}
                    onChange={(e) => {
                      if (e.target.checked && !cloudTermsAccepted) {
                        setShowCloudConsentModal(true);
                      } else {
                        setCloudSyncEnabled(e.target.checked);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#0e0e11] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400 border border-zinc-700" />
                </label>
              </div>
              {lastSyncTimestamp && (
                <span className="text-[10px] font-mono text-zinc-500">
                  Last Cloud Sync: {new Date(lastSyncTimestamp).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM VIEWPORT: GATEWAY CONNECTION & REAL-TIME ACTIVITY LOGS */}
        <div className="bg-[#111115] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">Gateway Connection Logs</span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                LIVE
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Showing last {logs.length} system events
            </span>
          </div>

          <div className="bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[11px] h-52 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
            {logs.length === 0 ? (
              <span className="text-zinc-600 italic">No events received yet. Start the gateway to observe real-time heartbeats and milestones.</span>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className={`leading-relaxed ${getLogColorClass(log)}`}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
