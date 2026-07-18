"use client";

import { useState, useEffect } from "react";

const CheckIcon = () => (
  <svg className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const BoltIcon = () => (
  <svg className="h-5 w-5 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-10 w-10 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

const GameIcon = () => (
  <svg className="h-7 w-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function Home() {
  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");

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
  const [isPublishing, setIsPublishing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setSession(data.user);
          loadConfig();
        }
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthChecked(true);
      });
  }, []);

  const loadConfig = () => {
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
  };

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Login verification failed.");
      } else {
        window.location.reload();
      }
    } catch {
      setAuthError("Failed to connect to the authentication server.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE",
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
              small_text: rpcSmallText,
            },
          },
        }),
      });
    } catch {}
    setIsSaving(false);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PUBLISH",
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
              small_text: rpcSmallText,
            },
          },
        }),
      });
      const data = await response.json();
      if (data.success) {
        setIsRunning(true);
      }
    } catch {}
    setIsPublishing(false);
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      const response = await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "STOP" }),
      });
      const data = await response.json();
      if (data.success) {
        setIsRunning(false);
      }
    } catch {}
    setIsStopping(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    } catch {}
  };

  const statusColors: Record<string, string> = {
    online: "bg-emerald-500",
    idle: "bg-amber-500",
    dnd: "bg-rose-500",
    invisible: "bg-zinc-500",
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0e0e11] text-zinc-100 flex items-center justify-center font-sans">
        <div className="h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0e0e11] text-zinc-100 flex items-center justify-center font-sans p-6 select-none">
        <div className="w-full max-w-md bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)] flex flex-col items-center text-center">
          <img src="/Stray.svg" alt="Stray Logo" className="h-16 w-16 mb-6" />
          <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2">STRAY ALLEY</h1>
          <p className="text-xs text-zinc-400 font-medium mb-8 max-w-xs leading-relaxed">
            Authorized presence controller playground. Enter your Stray Key to connect.
          </p>

          {authError && (
            <div className="w-full bg-rose-950/20 border-2 border-rose-900 text-rose-350 p-4 rounded-xl text-xs font-semibold mb-6">
              {authError}
            </div>
          )}

          <form onSubmit={handleKeySubmit} className="w-full flex flex-col gap-4">
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your Stray Key here..."
              className="w-full bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition font-mono"
            />
            <button
              type="submit"
              className="w-full py-4 bg-amber-400 border-2 border-black text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Enter Stray Alley
            </button>
          </form>

          <div className="mt-6 text-xs font-semibold text-zinc-550">
            Need a key?{" "}
            <a
              href="https://stray.bcnstudio.tech/api/auth/login"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-400 transition underline"
            >
              Get your Stray Key here
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e11] text-zinc-100 flex flex-col font-sans select-none">
      <header className="border-b-4 border-zinc-900 bg-[#16161a] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/Stray.svg" alt="Stray Logo" className="h-8 w-8" />
          <span className="text-lg font-black tracking-wider text-white uppercase">STRAY ALLEY</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-zinc-400 bg-[#0e0e11] border border-zinc-800 px-3 py-1.5 rounded-lg">
            {session.username}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 bg-[#0e0e11] border-2 border-zinc-800 text-zinc-400 hover:text-white rounded-lg font-bold text-xs uppercase transition shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-[2.5px] active:translate-y-[2.5px] active:shadow-none"
          >
            Leave Alley
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.4)]">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h2 className="text-base font-black text-white uppercase">Stray Parameters</h2>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {isRunning ? "Online" : "Stealth"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase">Discord Account Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your Discord authorization token..."
              className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Gateway Device Type</label>
              <select
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
              >
                <option value="desktop">Desktop Client</option>
                <option value="mobile">Mobile Application</option>
                <option value="web">Web Browser (Chrome)</option>
                <option value="embedded">Xbox Console Interface</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Profile Status Icon</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
              >
                <option value="online">Online</option>
                <option value="idle">Idle / Away</option>
                <option value="dnd">Do Not Disturb</option>
                <option value="invisible">Invisible / Stealth</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase">Custom status text</label>
            <input
              type="text"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="What is stray doing..."
              className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
            />
          </div>

          <div className="border-t border-zinc-800 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase">Enable Rich Activity (RPC)</span>
              <input
                type="checkbox"
                checked={rpcEnabled}
                onChange={(e) => setRpcEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 border-2 border-zinc-800 rounded focus:outline-none cursor-pointer"
              />
            </div>

            {rpcEnabled && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Application ID</label>
                    <input
                      type="text"
                      value={rpcClientId}
                      onChange={(e) => setRpcClientId(e.target.value)}
                      placeholder="1018195507560063039"
                      className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Application Name</label>
                    <input
                      type="text"
                      value={rpcName}
                      onChange={(e) => setRpcName(e.target.value)}
                      placeholder="Stray"
                      className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Activity State</label>
                    <input
                      type="text"
                      value={rpcState}
                      onChange={(e) => setRpcState(e.target.value)}
                      placeholder="Chasing dots"
                      className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Activity Details</label>
                    <input
                      type="text"
                      value={rpcDetails}
                      onChange={(e) => setRpcDetails(e.target.value)}
                      placeholder="Meowing at 3 AM"
                      className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
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
                      className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Large Image Text</label>
                    <input
                      type="text"
                      value={rpcLargeText}
                      onChange={(e) => setRpcLargeText(e.target.value)}
                      placeholder="Straying"
                      className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
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
                      className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Small Image Text</label>
                    <input
                      type="text"
                      value={rpcSmallText}
                      onChange={(e) => setRpcSmallText(e.target.value)}
                      placeholder="Purring"
                      className="bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-t border-zinc-800 pt-6">
            <button
              onClick={handleSave}
              disabled={isSaving || isPublishing || isStopping}
              className="flex-1 py-3 bg-[#0e0e11] border-2 border-zinc-800 text-zinc-350 hover:text-white rounded-xl font-bold uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handlePublish}
              disabled={isSaving || isPublishing || isStopping}
              className="flex-1 py-3 bg-amber-400 border-2 border-black text-black font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </button>
            {isRunning && (
              <button
                onClick={handleStop}
                disabled={isSaving || isPublishing || isStopping}
                className="flex-1 py-3 bg-rose-600 border-2 border-black text-white font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                {isStopping ? "Stopping..." : "Stop Client"}
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <h2 className="text-base font-black text-white pb-1 uppercase">Live Preview</h2>
          
          <div className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,0.4)]">
            <div className="h-20 bg-zinc-800 relative" />
            <div className="px-4 pb-4 relative">
              <div className="absolute -top-10 left-4 h-20 w-20 bg-[#16161a] rounded-full border-4 border-[#16161a] flex items-center justify-center relative">
                <div className="h-full w-full bg-[#0e0e11] rounded-full flex items-center justify-center select-none">
                  <UserIcon />
                </div>
                <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-[#16161a] ${statusColors[status] || "bg-zinc-500"}`} />
              </div>

              <div className="pt-12">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Stray</h3>
                  <span className="text-zinc-500 text-xs font-semibold">#0000</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 border-b border-zinc-800 pb-3">stray.bcnstudio.tech</p>
              </div>

              {customStatus && (
                <div className="py-3 border-b border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-bold uppercase mb-1">Custom Status</span>
                  <p className="text-xs text-zinc-300 italic">“{customStatus}”</p>
                </div>
              )}

              {rpcEnabled && (
                <div className="py-4 flex flex-col gap-3">
                  <span className="text-[10px] text-zinc-500 block font-bold uppercase tracking-wider">Playing a Game</span>
                  <div className="flex gap-4 items-start">
                    <div className="relative h-16 w-16 bg-[#0e0e11] rounded-xl flex items-center justify-center text-zinc-500 overflow-hidden border-2 border-zinc-800">
                      {rpcLargeImage ? (
                        <img src={rpcLargeImage} alt="Large RPC asset" className="h-full w-full object-cover" />
                      ) : (
                        <GameIcon />
                      )}
                      {rpcSmallImage && (
                        <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-900">
                          <img src={rpcSmallImage} alt="Small RPC asset" className="h-6 w-6 rounded-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{rpcName || "Stray"}</h4>
                      {rpcDetails && <p className="text-[10px] text-zinc-350 truncate mt-0.5">{rpcDetails}</p>}
                      {rpcState && <p className="text-[10px] text-zinc-400 truncate mt-0.5">{rpcState}</p>}
                      <p className="text-[9px] text-zinc-500 mt-1 uppercase font-semibold">1:37 elapsed</p>
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
