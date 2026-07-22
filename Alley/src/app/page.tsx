"use client";

import { useState, useEffect } from "react";
import * as emoji from "node-emoji";

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

const QuestIcon = () => (
  <svg className="h-5 w-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
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
  const [webhookUrl, setWebhookUrl] = useState("");
  const [customStatus, setCustomStatus] = useState("Straying around");
  const [customStatusEmoji, setCustomStatusEmoji] = useState("");

  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [rotationInterval, setRotationInterval] = useState(10);
  const [rotationStatus1Text, setRotationStatus1Text] = useState("");
  const [rotationStatus1Emoji, setRotationStatus1Emoji] = useState("");
  const [rotationStatus2Text, setRotationStatus2Text] = useState("");
  const [rotationStatus2Emoji, setRotationStatus2Emoji] = useState("");
  const [rotationStatus3Text, setRotationStatus3Text] = useState("");
  const [rotationStatus3Emoji, setRotationStatus3Emoji] = useState("");

  const [rpcEnabled, setRpcEnabled] = useState(false);
  const [rpcType, setRpcType] = useState<number>(0);
  const [rpcUrl, setRpcUrl] = useState("");
  const [rpcClientId, setRpcClientId] = useState("1018195507560063039");
  const [rpcName, setRpcName] = useState("Stray");
  const [rpcState, setRpcState] = useState("Chasing dots");
  const [rpcDetails, setRpcDetails] = useState("Meowing at 3 AM");
  const [rpcLargeImage, setRpcLargeImage] = useState("");
  const [rpcLargeText, setRpcLargeText] = useState("Straying");
  const [rpcSmallImage, setRpcSmallImage] = useState("");
  const [rpcSmallText, setRpcSmallText] = useState("Purring");

  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [cloudTermsAccepted, setCloudTermsAccepted] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>(null);
  const [showCloudConsentModal, setShowCloudConsentModal] = useState(false);

  const [autoQuestsEnabled, setAutoQuestsEnabled] = useState(false);
  const [officialClientRewardOnly, setOfficialClientRewardOnly] = useState(true);
  const [questsList, setQuestsList] = useState<any[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const [processingQuests, setProcessingQuests] = useState(false);

  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [cooldownErrorMsg, setCooldownErrorMsg] = useState<string | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const [verifyingToken, setVerifyingToken] = useState(false);
  const [tokenValidationMsg, setTokenValidationMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [verifiedProfile, setVerifiedProfile] = useState<{ id: string; username: string; discriminator: string; avatar: string | null } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [updateNotification, setUpdateNotification] = useState<{ latestVersion: string; isFork: boolean } | null>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [remainingTimeText, setRemainingTimeText] = useState("");
  const [isTokenValidOnOpen, setIsTokenValidOnOpen] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

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

  useEffect(() => {
    if (session) {
      const interval = setInterval(() => {
        fetch("/api/status")
          .then((res) => res.json())
          .then((data) => {
            setIsRunning(data.isRunning || false);
            if (data.logs) {
              setLogs(data.logs);
            }
            if (data.updateNotification) {
              setUpdateNotification(data.updateNotification);
            } else {
              setUpdateNotification(null);
            }
          })
          .catch(() => {});
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    let timer: any;
    if (cooldownRemaining > 0) {
      timer = setInterval(() => {
        setCooldownRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownRemaining]);

  useEffect(() => {
    let interval: any;
    if (showLogoutModal && session?.keyExpires) {
      const updateTimer = () => {
        const diff = session.keyExpires - Date.now();
        if (diff > 0) {
          setIsTokenValidOnOpen(true);
          const totalSecs = Math.floor(diff / 1000);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          setRemainingTimeText(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
        } else {
          setIsTokenValidOnOpen(false);
          setRemainingTimeText("");
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showLogoutModal, session]);

  const fetchUserQuests = () => {
    setLoadingQuests(true);
    fetch("/api/quests")
      .then((res) => res.json())
      .then((data) => {
        if (data.quests) {
          setQuestsList(data.quests);
        }
        setLoadingQuests(false);
      })
      .catch(() => setLoadingQuests(false));
  };

  const loadConfig = () => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setToken(data.config.token || "");
          setStatus(data.config.status || "online");
          setDevice(data.config.device || "desktop");
          setTermsAccepted(data.config.termsAccepted || false);
          setCloudSyncEnabled(data.config.cloudSyncEnabled || false);
          setCloudTermsAccepted(data.config.cloudTermsAccepted || false);
          setLastSyncTimestamp(data.config.lastSyncTimestamp || null);
          setAutoQuestsEnabled(data.config.autoQuestsEnabled || false);
          setOfficialClientRewardOnly(data.config.officialClientRewardOnly ?? true);
          setWebhookUrl(data.config.webhookUrl || "");
          setRotationEnabled(data.config.rotationEnabled || false);
          setRotationInterval(data.config.rotationInterval || 10);
          setRotationStatus1Text(data.config.rotationStatus1Text || "");
          setRotationStatus1Emoji(data.config.rotationStatus1Emoji || "");
          setRotationStatus2Text(data.config.rotationStatus2Text || "");
          setRotationStatus2Emoji(data.config.rotationStatus2Emoji || "");
          setRotationStatus3Text(data.config.rotationStatus3Text || "");
          setRotationStatus3Emoji(data.config.rotationStatus3Emoji || "");
          setCustomStatus(data.config.custom_status?.text || "");
          setCustomStatusEmoji(data.config.custom_status?.emoji || "");
          if (data.config.rich_presence) {
            setRpcEnabled(data.config.rich_presence.enabled || false);
            setRpcType(data.config.rich_presence.type ?? 0);
            setRpcUrl(data.config.rich_presence.url || "");
            setRpcClientId(data.config.rich_presence.client_id || "");
            setRpcName(data.config.rich_presence.name || "");
            setRpcState(data.config.rich_presence.state || "");
            setRpcDetails(data.config.rich_presence.details || "");
            setRpcLargeImage(data.config.rich_presence.large_image || "");
            setRpcLargeText(data.config.rich_presence.large_text || "");
            setRpcSmallImage(data.config.rich_presence.small_image || "");
            setRpcSmallText(data.config.rich_presence.small_text || "");
          }
          if (data.config.token) {
            triggerTokenCheck(data.config.token);
            fetchUserQuests();
          }
        }
        if (data.updateNotification) {
          setUpdateNotification(data.updateNotification);
        } else {
          setUpdateNotification(null);
        }
        setIsRunning(data.isRunning || false);
        if (data.logs) {
          setLogs(data.logs);
        }
        setConfigLoaded(true);
      })
      .catch(() => {
        setConfigLoaded(true);
      });
  };

  const triggerTokenCheck = async (tokenToCheck: string) => {
    if (!tokenToCheck) return;
    setVerifyingToken(true);
    setTokenValidationMsg(null);
    try {
      const res = await fetch("/api/check-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToCheck }),
      });
      const data = await res.json();
      if (data.valid) {
        setVerifiedProfile(data.user);
        setTokenValidationMsg({ text: "Discord token is valid", isError: false });
        fetchUserQuests();
      } else {
        setVerifiedProfile(null);
        setTokenValidationMsg({ text: data.error || "Invalid Discord Token", isError: true });
      }
    } catch {
      setTokenValidationMsg({ text: "Failed to connect to Discord verification API", isError: true });
    }
    setVerifyingToken(false);
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

  const handleCloudToggle = async (enabled: boolean) => {
    if (enabled && !cloudTermsAccepted) {
      setShowCloudConsentModal(true);
    } else {
      setCloudSyncEnabled(enabled);
      try {
        await fetch("/api/control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SYNC",
            config: {
              cloudSyncEnabled: enabled,
              cloudTermsAccepted: cloudTermsAccepted,
              termsAccepted: termsAccepted,
            },
          }),
        });
      } catch {}
    }
  };

  const handleAcceptCloudTerms = async () => {
    setCloudTermsAccepted(true);
    setCloudSyncEnabled(true);
    setShowCloudConsentModal(false);
    try {
      await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SYNC",
          config: {
            cloudSyncEnabled: true,
            cloudTermsAccepted: true,
            termsAccepted: termsAccepted,
          },
        }),
      });
    } catch {}
  };

  const handleRunQuests = async () => {
    setProcessingQuests(true);
    try {
      await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setTimeout(() => {
        fetchUserQuests();
        setProcessingQuests(false);
      }, 3000);
    } catch {
      setProcessingQuests(false);
    }
  };

  const handleSave = async () => {
    if (cooldownRemaining > 0) {
      setCooldownErrorMsg(`Please wait ${cooldownRemaining}s before saving again.`);
      return;
    }
    setIsSaving(true);
    setCooldownErrorMsg(null);
    try {
      const res = await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE",
          config: {
            token,
            status,
            device,
            webhookUrl,
            cloudSyncEnabled,
            cloudTermsAccepted,
            autoQuestsEnabled,
            officialClientRewardOnly,
            termsAccepted,
            rotationEnabled,
            rotationInterval: Number(rotationInterval),
            rotationStatus1Text,
            rotationStatus1Emoji,
            rotationStatus2Text,
            rotationStatus2Emoji,
            rotationStatus3Text,
            rotationStatus3Emoji,
            custom_status: { text: customStatus, emoji: customStatusEmoji },
            rich_presence: {
              enabled: rpcEnabled,
              type: Number(rpcType),
              url: rpcUrl,
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
      const data = await res.json();
      if (res.status === 429) {
        setCooldownErrorMsg(data.error);
        setCooldownRemaining(30);
      } else if (res.ok) {
        setCooldownRemaining(30);
      }
    } catch {}
    setIsSaving(false);
  };

  const handleAcceptTerms = async () => {
    try {
      const res = await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE",
          config: {
            termsAccepted: true,
          },
        }),
      });
      if (res.ok) {
        setTermsAccepted(true);
      } else {
        setTermsAccepted(false);
      }
    } catch {
      setTermsAccepted(false);
    }
  };

  const handlePublish = async () => {
    if (cooldownRemaining > 0) {
      setCooldownErrorMsg(`Please wait ${cooldownRemaining}s before publishing again.`);
      return;
    }
    setIsPublishing(true);
    setCooldownErrorMsg(null);
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
            webhookUrl,
            cloudSyncEnabled,
            cloudTermsAccepted,
            autoQuestsEnabled,
            officialClientRewardOnly,
            termsAccepted,
            rotationEnabled,
            rotationInterval: Number(rotationInterval),
            rotationStatus1Text,
            rotationStatus1Emoji,
            rotationStatus2Text,
            rotationStatus2Emoji,
            rotationStatus3Text,
            rotationStatus3Emoji,
            custom_status: { text: customStatus, emoji: customStatusEmoji },
            rich_presence: {
              enabled: rpcEnabled,
              type: Number(rpcType),
              url: rpcUrl,
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
      if (response.status === 429) {
        setCooldownErrorMsg(data.error);
        setCooldownRemaining(30);
      } else if (data.success) {
        setIsRunning(true);
        setCooldownRemaining(30);
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

  const getRpcImageUrl = (clientId: string, imageKey: string) => {
    if (!imageKey) return null;
    if (imageKey.startsWith("http://") || imageKey.startsWith("https://")) {
      return imageKey;
    }
    if (imageKey.startsWith("mp:external/")) {
      const match = imageKey.match(/mp:external\/[^\/]+\/https\/(.+)/);
      if (match) return `https://${match[1]}`;
    }
    if (clientId) {
      return `https://cdn.discordapp.com/app-assets/${clientId}/${imageKey}.png`;
    }
    return null;
  };

  const renderEmoji = (emojiStr: string) => {
    if (!emojiStr) return null;
    const trimmed = emojiStr.trim();
    const customEmojiRegex = /^<a?:?([a-zA-Z0-9_]+):([0-9]+)>$/;
    const match = trimmed.match(customEmojiRegex);
    if (match) {
      const emojiId = match[2];
      const isAnimated = trimmed.startsWith("<a:");
      const ext = isAnimated ? "gif" : "png";
      return (
        <img
          src={`https://cdn.discordapp.com/emojis/${emojiId}.${ext}?size=44&quality=lossless`}
          alt={match[1]}
          className="h-4.5 w-4.5 object-contain inline-block shrink-0 align-middle mr-1.5"
        />
      );
    }

    if (trimmed.startsWith(":") && trimmed.endsWith(":")) {
      const code = trimmed.slice(1, -1);
      const resolved = emoji.get(code);
      if (resolved && resolved !== code) {
        return <span className="inline-block mr-1.5 align-middle select-all">{resolved}</span>;
      }
    }

    return <span className="inline-block mr-1.5 align-middle select-all">{trimmed}</span>;
  };

  const getLogColorClass = (logText: string) => {
    const text = logText.toLowerCase();
    if (text.includes("error") || text.includes("fail") || text.includes("close") || text.includes("invalid") || text.includes("denied")) {
      return "text-rose-400";
    }
    if (text.includes("ready") || text.includes("established") || text.includes("hello") || text.includes("success") || text.includes("connected successfully") || text.includes("completed!")) {
      return "text-emerald-400";
    }
    if (text.includes("initiating") || text.includes("starting") || text.includes("reconnecting") || text.includes("registering") || text.includes("dqacs") || text.includes("spoofing")) {
      return "text-amber-400";
    }
    return "text-zinc-400";
  };

  const getRpcTypeLabel = (type: number) => {
    switch (Number(type)) {
      case 1:
        return "Streaming Live";
      case 2:
        return "Listening to";
      case 3:
        return "Watching";
      case 5:
        return "Competing in";
      default:
        return "Playing a Game";
    }
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
              className="w-full bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-3.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 transition font-mono"
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
              href="https://stray.bcnstudio.tech/api/auth/login"
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
            onClick={() => setShowLogoutModal(true)}
            className="px-4 py-1.5 bg-rose-500 border-2 border-black text-black rounded-xl font-black uppercase text-xs tracking-wider transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Leave Alley
          </button>
        </div>
      </header>

      {updateNotification && (
        <div className="w-full bg-amber-400 text-black border-b-4 border-black px-8 py-3 flex items-center justify-between text-xs font-black uppercase tracking-wider animate-fadeIn">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              Stray {updateNotification.latestVersion} is released!{" "}
              {updateNotification.isFork
                ? "Resync your fork now!"
                : (typeof window !== "undefined" &&
                   (window.location.hostname === "localhost" ||
                    window.location.hostname === "127.0.0.1" ||
                    window.location.hostname === "[::1]"))
                ? "Clone the latest build!"
                : "Please manually deploy to the latest commit!"}
            </span>
          </div>
          <a
            href="https://github.com/BadCmdName/Stray"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-amber-400 border-2 border-black px-4 py-1.5 rounded-lg text-[10px] font-black tracking-wide hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(251,191,36,1)] transition"
          >
            Get Update
          </a>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h2 className="text-base font-black text-white uppercase tracking-wider">Stray Parameters</h2>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {isRunning ? "Online" : "Stealth"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Discord Account Token</label>
            <div className="flex gap-4">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your Discord authorization token..."
                className="flex-1 bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 transition"
              />
              <button
                onClick={() => triggerTokenCheck(token)}
                disabled={verifyingToken}
                className="bg-[#0e0e11] border-2 border-zinc-800 text-zinc-400 hover:text-white px-6 py-2.5 rounded-xl font-bold uppercase text-xs transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                {verifyingToken ? "Verifying..." : "Verify Token"}
              </button>
            </div>
            {tokenValidationMsg && (
              <span className={`text-[10px] font-bold mt-1 ${tokenValidationMsg.isError ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                {tokenValidationMsg.text}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Gateway Device Type</label>
              <div className="relative">
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 transition appearance-none cursor-pointer"
                >
                  <option value="desktop">Desktop Client</option>
                  <option value="mobile">Mobile Application</option>
                  <option value="web">Web Browser (Chrome)</option>
                  <option value="embedded">Xbox Console Interface</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-3.5 flex items-center text-zinc-550">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Profile Status Icon</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 transition appearance-none cursor-pointer"
                >
                  <option value="online">Online</option>
                  <option value="idle">Idle / Away</option>
                  <option value="dnd">Do Not Disturb</option>
                  <option value="invisible">Invisible / Stealth</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-3.5 flex items-center text-zinc-550">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                  <QuestIcon /> Discord Quests Auto-Completer (DQACS v2.0.0)
                </span>
                <span className="text-[10px] text-zinc-400 font-medium block mt-0.5">
                  Auto-enrolls and completes active Discord video & game quests.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoQuestsEnabled}
                  onChange={(e) => setAutoQuestsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#0e0e11] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400 border border-zinc-700"></div>
              </label>
            </div>

            <div className="flex items-center justify-between bg-[#0e0e11] p-3 rounded-xl border border-zinc-800">
              <div>
                <span className="text-[11px] font-bold text-zinc-200 uppercase block">Claim Rewards via Official Client Only</span>
                <span className="text-[9.5px] text-zinc-400 block mt-0.5">
                  Safety Switch: Completes 100% of quest tasks, but leaves final code claim to official Discord.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={officialClientRewardOnly}
                  onChange={(e) => setOfficialClientRewardOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-400 border border-zinc-700"></div>
              </label>
            </div>

            <button
              onClick={handleRunQuests}
              disabled={processingQuests || !token}
              className="w-full py-2.5 bg-amber-400 border-2 border-black text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-50"
            >
              {processingQuests ? "Processing Quests..." : "Complete Active Quests Now"}
            </button>
          </div>

          <div className="border-t border-zinc-800 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wide block">Cloud DB Auto-Backup & Recovery</span>
                <span className="text-[10px] text-zinc-400 font-medium block mt-0.5">
                  Encrypts and backs up user configuration to private <code className="font-mono text-amber-400">Stray-DB</code> storage.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloudSyncEnabled}
                  onChange={(e) => handleCloudToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#0e0e11] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400 border border-zinc-700"></div>
              </label>
            </div>
            {lastSyncTimestamp && (
              <span className="text-[10px] text-emerald-400 font-bold">
                Last Cloud Backup: {new Date(lastSyncTimestamp).toLocaleString()}
              </span>
            )}
          </div>

          {cooldownErrorMsg && (
            <div className="bg-rose-950/30 border-2 border-rose-800 text-rose-400 p-3.5 rounded-xl text-xs font-bold animate-pulse">
              {cooldownErrorMsg}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 border-t border-zinc-800 pt-6">
            <button
              onClick={handleSave}
              disabled={isSaving || isPublishing || isStopping || cooldownRemaining > 0}
              className="flex-1 py-3.5 bg-[#0e0e11] border-2 border-zinc-800 text-zinc-400 hover:text-white rounded-xl font-bold uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : cooldownRemaining > 0 ? `Save (${cooldownRemaining}s)` : "Save Changes"}
            </button>
            <button
              onClick={handlePublish}
              disabled={isSaving || isPublishing || isStopping || cooldownRemaining > 0}
              className="flex-1 py-3.5 bg-amber-400 border-2 border-black text-black font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? "Publishing..." : cooldownRemaining > 0 ? `Publish (${cooldownRemaining}s)` : isRunning ? "Re-Publish" : "Publish"}
            </button>
            {isRunning && (
              <button
                onClick={handleStop}
                disabled={isSaving || isPublishing || isStopping}
                className="flex-1 py-3.5 bg-rose-600 border-2 border-black text-white font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                {isStopping ? "Stopping..." : "Stop Client"}
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <QuestIcon /> Active Discord Quests
            </h2>
            <button
              onClick={fetchUserQuests}
              disabled={loadingQuests || !token}
              className="text-[10px] font-bold text-amber-400 hover:text-amber-500 uppercase tracking-wide transition"
            >
              {loadingQuests ? "Refreshing..." : "Refresh List"}
            </button>
          </div>

          <div className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)] max-h-[380px] overflow-y-auto scrollbar-thin">
            {questsList.length === 0 ? (
              <span className="text-xs text-zinc-500 italic p-3 text-center">
                {token ? "No active Discord quests found for your account." : "Verify your Discord token above to view active quests."}
              </span>
            ) : (
              questsList.map((quest) => {
                const questName = quest.config?.messages?.quest_name || "Unknown Quest";
                const appName = quest.config?.application?.name || "Discord Quest";
                const isCompleted = Boolean(quest.user_status?.completed_at);
                const isClaimed = Boolean(quest.user_status?.claimed_at);

                return (
                  <div key={quest.id} className="bg-[#0e0e11] border border-zinc-800 rounded-xl p-3.5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{questName}</h4>
                        <span className="text-[10px] text-zinc-400 block">{appName}</span>
                      </div>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          isClaimed
                            ? "bg-zinc-800 text-zinc-400"
                            : isCompleted
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}
                      >
                        {isClaimed
                          ? "Claimed"
                          : isCompleted
                          ? "Completed (Claim in Discord)"
                          : "In Progress"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="col-span-12 bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)] flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Gateway Connection & Quest Logs</h2>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/BadCmdName/Stray/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-amber-400 hover:text-amber-500 uppercase tracking-wide transition"
              >
                Report Issue
              </a>
              <span className="text-zinc-700 select-none">|</span>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] font-bold text-zinc-555 hover:text-zinc-300 uppercase tracking-wide transition"
              >
                Clear UI View
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Discord Log Webhook URL</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="Paste your Discord webhook URL to stream connection logs to your server..."
              className="w-full bg-[#0e0e11] border-2 border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="bg-[#0e0e11] border border-zinc-800 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[11px] text-zinc-400 flex flex-col-reverse gap-1.5 scrollbar-thin">
            {logs.length === 0 ? (
              <span className="text-zinc-650 italic">No connection logs available. Press Publish to establish a session.</span>
            ) : (
              [...logs].reverse().map((log, index) => (
                <span key={index} className={`whitespace-pre-wrap break-all leading-relaxed font-semibold ${getLogColorClass(log)}`}>
                  {log}
                </span>
              ))
            )}
          </div>
        </div>
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#16161a] border-2 border-rose-500 max-w-sm sm:max-w-md w-full rounded-2xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_rgba(244,63,94,0.3)] flex flex-col gap-6 text-center select-none animate-scaleIn">
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">Leave Alley?</h3>
            
            {isTokenValidOnOpen ? (
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Your previous token is still valid, you can login until{" "}
                <span className="text-amber-400 font-black font-mono">{remainingTimeText}</span>!
              </p>
            ) : (
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Your previous token has expired, you will need to generate a new one to login again!
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3.5 bg-[#0e0e11] border-2 border-zinc-800 text-zinc-355 rounded-xl font-black uppercase text-xs tracking-wider transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                Nevermind
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3.5 bg-rose-500 border-2 border-black text-black rounded-xl font-black uppercase text-xs tracking-wider transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloudConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#16161a] border-2 border-amber-400 max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(217,119,6,0.3)] flex flex-col gap-6 text-center select-none animate-scaleIn">
            <h3 className="text-xl font-black text-white uppercase tracking-wider">Cloud Database Terms & Privacy</h3>
            
            <div className="text-left text-xs text-zinc-400 flex flex-col gap-3 font-medium leading-relaxed bg-[#0e0e11] p-4 sm:p-5 border border-zinc-800 rounded-xl overflow-y-auto max-h-60">
              <p>
                <strong>1. End-to-End Local Encryption:</strong> Your Discord tokens and status parameters are encrypted on your local server using AES-256-GCM before being sent to the remote backup repository.
              </p>
              <p>
                <strong>2. Automated Container Recovery:</strong> Backups stored in <code className="font-mono text-amber-400">Stray-DB</code> allow free cloud hosting instances (Render, Railway, etc.) to automatically restore your saved profile and reconnect your gateway status if the container restarts.
              </p>
              <p>
                <strong>3. Opt-Out Anytime:</strong> You may toggle off Cloud DB Auto-Backup at any time from your Stray Parameters dashboard.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCloudConsentModal(false)}
                className="flex-1 py-3.5 bg-[#0e0e11] border-2 border-zinc-800 text-zinc-400 rounded-xl font-black uppercase text-xs tracking-wider transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptCloudTerms}
                className="flex-1 py-3.5 bg-amber-400 border-2 border-black text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px]"
              >
                Enable Auto-Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {!termsAccepted && session && configLoaded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#16161a] border-2 border-amber-400 max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(217,119,6,0.3)] flex flex-col gap-6 text-center select-none animate-scaleIn">
            <h3 className="text-xl font-black text-white uppercase tracking-wider">Liability Agreement & Waiver</h3>
            
            <div className="text-left text-xs text-zinc-400 flex flex-col gap-3 font-medium leading-relaxed bg-[#0e0e11] p-4 sm:p-5 border border-zinc-800 rounded-xl overflow-y-auto max-h-60">
              <p>
                <strong>1. Violation of Service Policies:</strong> By accessing and entering the self-hosted Stray Alley daemon control interface, you verify that you understand using customized presence clients (selfbots) violates the Discord Developer Terms of Service and user rules.
              </p>
              <p>
                <strong>2. Zero Creator Liability:</strong> Under no circumstances shall Antigravity, BadCmdName, or the creators and maintainers of this project be held liable for any direct or indirect actions taken against your account by Discord Inc., including permanent restrictions, API access blocks, or total account termination.
              </p>
              <p>
                <strong>3. Pure Personal Responsibility:</strong> You take 100% of all legal, operational, and system risks. You are solely responsible for keeping your tokens safe, managing configurations, and hosting server processes on your own personal infrastructure.
              </p>
            </div>

            <div>
              <button
                onClick={handleAcceptTerms}
                className="w-full py-4 bg-amber-400 border-2 border-black text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                I Accept All Risks & Responsibilities
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
