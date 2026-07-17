"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("online");
  const [device, setDevice] = useState("desktop");
  const [customStatus, setCustomStatus] = useState("Straying around");
  const [rpcEnabled, setRpcEnabled] = useState(false);
  const [rpcClientId, setRpcClientId] = useState("1018195507560063039");
  const [rpcName, setRpcName] = useState("Stray");
  const [rpcState, setRpcState] = useState("Chasing dots");
  const [rpcDetails, setRpcDetails] = useState("Meowing at 3 AM");
  const [rpcLargeImage, setRpcLargeImage] = useState("");
  const [rpcLargeText, setRpcLargeText] = useState("Straying");
  const [rpcSmallImage, setRpcSmallImage] = useState("");
  const [rpcSmallText, setRpcSmallText] = useState("Purring");
  
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setToken(data.config.token || "");
          setStatus(data.config.status || "online");
          setDevice(data.config.device || "desktop");
          setCustomStatus(data.config.custom_status?.text || "");
          if (data.config.rich_presence) {
            setRpcEnabled(data.config.rich_presence.enabled || false);
            setRpcClientId(data.config.rich_presence.client_id || "");
            setRpcName(data.config.rich_presence.name || "");
            setRpcState(data.config.rich_presence.state || "");
            setRpcDetails(data.config.rich_presence.details || "");
            setRpcLargeImage(data.config.rich_presence.large_image || "");
            setRpcLargeText(data.config.rich_presence.large_text || "");
            setRpcSmallImage(data.config.rich_presence.small_image || "");
            setRpcSmallText(data.config.rich_presence.small_text || "");
          }
        }
        setIsRunning(data.isRunning || false);
      })
      .catch(() => {});
  }, []);

  const handleToggle = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isRunning ? "STOP" : "START",
          config: {
            token,
            status,
            device,
            custom_status: { text: customStatus },
            rich_presence: {
              enabled: rpcEnabled,
              client_id: rpcClientId,
              name: rpcName,
              state: rpcState,
              details: rpcDetails,
              large_image: rpcLargeImage,
              large_text: rpcLargeText,
              small_image: rpcSmallImage,
              small_text: rpcSmallText
            }
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsRunning(!isRunning);
      }
    } catch {}
    setIsSaving(false);
  };

  const statusColors: Record<string, string> = {
    online: "bg-emerald-500",
    idle: "bg-amber-500",
    dnd: "bg-rose-500",
    invisible: "bg-zinc-500"
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐾</span>
          <h1 className="text-xl font-bold tracking-wider text-white">STRAY DASHBOARD</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            {isRunning ? "Running" : "Headless Idle"}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-white border-b border-zinc-800 pb-3">STRAY PARAMETERS</h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase">Discord Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your Discord User Token here..."
              className="bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Device Type</label>
              <select
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
              >
                <option value="desktop">Desktop Client</option>
                <option value="mobile">Mobile App</option>
                <option value="web">Web Browser (Chrome)</option>
                <option value="embedded">Xbox Console</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Online Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
              >
                <option value="online">Online</option>
                <option value="idle">Idle / Napping</option>
                <option value="dnd">Do Not Disturb</option>
                <option value="invisible">Invisible / Stealth</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase">Custom Status Text</label>
            <input
              type="text"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="E.g., Straying around..."
              className="bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
            />
          </div>

          <div className="border-t border-zinc-800 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <span>Rich Presence (RPC) Settings</span>
              </label>
              <input
                type="checkbox"
                checked={rpcEnabled}
                onChange={(e) => setRpcEnabled(e.target.checked)}
                className="w-4 h-4 accent-zinc-500 rounded focus:outline-none cursor-pointer"
              />
            </div>

            {rpcEnabled && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Application Client ID</label>
                    <input
                      type="text"
                      value={rpcClientId}
                      onChange={(e) => setRpcClientId(e.target.value)}
                      placeholder="1018195507560063039"
                      className="bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Application Name</label>
                    <input
                      type="text"
                      value={rpcName}
                      onChange={(e) => setRpcName(e.target.value)}
                      placeholder="Stray"
                      className="bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">State</label>
                    <input
                      type="text"
                      value={rpcState}
                      onChange={(e) => setRpcState(e.target.value)}
                      placeholder="State text..."
                      className="bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Details</label>
                    <input
                      type="text"
                      value={rpcDetails}
                      onChange={(e) => setRpcDetails(e.target.value)}
                      placeholder="Details text..."
                      className="bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Large Image URL</label>
                    <input
                      type="text"
                      value={rpcLargeImage}
                      onChange={(e) => setRpcLargeImage(e.target.value)}
                      placeholder="https://..."
                      className="bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Large Image Text</label>
                    <input
                      type="text"
                      value={rpcLargeText}
                      onChange={(e) => setRpcLargeText(e.target.value)}
                      placeholder="Text on hover..."
                      className="bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Small Image URL</label>
                    <input
                      type="text"
                      value={rpcSmallImage}
                      onChange={(e) => setRpcSmallImage(e.target.value)}
                      placeholder="https://..."
                      className="bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Small Image Text</label>
                    <input
                      type="text"
                      value={rpcSmallText}
                      onChange={(e) => setRpcSmallText(e.target.value)}
                      placeholder="Text on hover..."
                      className="bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleToggle}
            disabled={isSaving}
            className={`w-full py-3 rounded-lg font-bold transition duration-200 focus:outline-none shadow-lg text-sm flex items-center justify-center gap-2 ${
              isRunning
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-950 shadow-zinc-900/20"
            }`}
          >
            {isSaving ? (
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isRunning ? (
              "STOP HEADLESS CLIENT"
            ) : (
              "LAUNCH HEADLESS CLIENT"
            )}
          </button>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-white pb-1">LIVE PREVIEW</h2>
          
          <div className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden shadow-2xl">
            <div className="h-20 bg-zinc-800 relative" />
            <div className="px-4 pb-4 relative">
              <div className="absolute -top-10 left-4 h-20 w-20 bg-zinc-900 rounded-full border-4 border-zinc-900 flex items-center justify-center relative">
                <div className="h-full w-full bg-zinc-700 rounded-full flex items-center justify-center text-2xl font-bold text-zinc-400 select-none">
                  🐱
                </div>
                <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-zinc-900 ${statusColors[status] || "bg-zinc-500"}`} />
              </div>

              <div className="pt-12">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Stray</h3>
                  <span className="text-zinc-500 text-xs font-semibold">#0000</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 border-b border-zinc-850 pb-3">stray.bcnstudio.tech</p>
              </div>

              {customStatus && (
                <div className="py-3 border-b border-zinc-850">
                  <span className="text-xs text-zinc-400 block font-bold uppercase mb-1">Custom Status</span>
                  <p className="text-sm text-zinc-300 italic">“{customStatus}”</p>
                </div>
              )}

              {rpcEnabled && (
                <div className="py-4 flex flex-col gap-3">
                  <span className="text-xs text-zinc-400 block font-bold uppercase tracking-wider">Playing a Game</span>
                  <div className="flex gap-4 items-start">
                    <div className="relative h-16 w-16 bg-zinc-850 rounded-lg flex items-center justify-center text-zinc-500 overflow-hidden border border-zinc-800">
                      {rpcLargeImage ? (
                        <img src={rpcLargeImage} alt="Large RPC asset" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl">🎮</span>
                      )}
                      {rpcSmallImage && (
                        <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-900">
                          <img src={rpcSmallImage} alt="Small RPC asset" className="h-6 w-6 rounded-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{rpcName || "Stray"}</h4>
                      {rpcDetails && <p className="text-xs text-zinc-300 truncate mt-0.5">{rpcDetails}</p>}
                      {rpcState && <p className="text-xs text-zinc-400 truncate mt-0.5">{rpcState}</p>}
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold">1:37 elapsed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
