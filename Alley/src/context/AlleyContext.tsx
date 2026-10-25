"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import * as emoji from "node-emoji";

export interface UserSession {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  keyExpires?: number;
}

export interface AlleyContextType {
  // Auth
  authChecked: boolean;
  session: UserSession | null;
  authError: string | null;
  keyInput: string;
  setKeyInput: (val: string) => void;
  handleKeySubmit: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => Promise<void>;
  showLogoutModal: boolean;
  setShowLogoutModal: (val: boolean) => void;
  remainingTimeText: string;
  isTokenValidOnOpen: boolean;

  // Notification & Sync
  isSyncingData: boolean;
  configLoaded: boolean;
  updateNotification: { latestVersion: string; isFork: boolean } | null;

  // Gateway & Parameters
  isRunning: boolean;
  isPublishing: boolean;
  isStopping: boolean;
  isSaving: boolean;
  cooldownRemaining: number;
  cooldownErrorMsg: string | null;
  token: string;
  setToken: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  device: string;
  setDevice: (val: string) => void;
  customStatus: string;
  setCustomStatus: (val: string) => void;
  customStatusEmoji: string;
  setCustomStatusEmoji: (val: string) => void;
  verifyingToken: boolean;
  tokenValidationMsg: { text: string; isError: boolean } | null;
  verifiedProfile: { id: string; username: string; discriminator: string; avatar: string | null } | null;
  triggerTokenCheck: (tok: string) => Promise<void>;
  handlePublish: () => Promise<void>;
  handleStop: () => Promise<void>;
  handleSaveConfig: (override?: any) => Promise<void>;

  // Status Rotation
  rotationEnabled: boolean;
  setRotationEnabled: (val: boolean) => void;
  rotationInterval: number;
  setRotationInterval: (val: number) => void;
  rotationStatus1Text: string;
  setRotationStatus1Text: (val: string) => void;
  rotationStatus1Emoji: string;
  setRotationStatus1Emoji: (val: string) => void;
  rotationStatus2Text: string;
  setRotationStatus2Text: (val: string) => void;
  rotationStatus2Emoji: string;
  setRotationStatus2Emoji: (val: string) => void;
  rotationStatus3Text: string;
  setRotationStatus3Text: (val: string) => void;
  rotationStatus3Emoji: string;
  setRotationStatus3Emoji: (val: string) => void;

  // Rich Presence
  rpcEnabled: boolean;
  setRpcEnabled: (val: boolean) => void;
  rpcType: number;
  setRpcType: (val: number) => void;
  rpcUrl: string;
  setRpcUrl: (val: string) => void;
  rpcClientId: string;
  setRpcClientId: (val: string) => void;
  rpcName: string;
  setRpcName: (val: string) => void;
  rpcState: string;
  setRpcState: (val: string) => void;
  rpcDetails: string;
  setRpcDetails: (val: string) => void;
  rpcLargeImage: string;
  setRpcLargeImage: (val: string) => void;
  rpcLargeText: string;
  setRpcLargeText: (val: string) => void;
  rpcSmallImage: string;
  setRpcSmallImage: (val: string) => void;
  rpcSmallText: string;
  setRpcSmallText: (val: string) => void;

  // Cloud Sync & Terms
  cloudSyncEnabled: boolean;
  setCloudSyncEnabled: (val: boolean) => void;
  cloudTermsAccepted: boolean;
  setCloudTermsAccepted: (val: boolean) => void;
  lastSyncTimestamp: string | null;
  showCloudConsentModal: boolean;
  setShowCloudConsentModal: (val: boolean) => void;
  termsAccepted: boolean;
  handleAcceptTerms: () => Promise<void>;

  // DQACS (Auto-Quests)
  autoQuestsEnabled: boolean;
  setAutoQuestsEnabled: (val: boolean) => void;
  liveRpcQuests: boolean;
  setLiveRpcQuests: (val: boolean) => void;
  includeDecorationQuests: boolean;
  setIncludeDecorationQuests: (val: boolean) => void;
  questsList: any[];
  loadingQuests: boolean;
  processingQuests: boolean;
  isStoppingQuests: boolean;
  activeQuestRpc: any;
  fetchUserQuests: () => void;
  handleLiveRpcToggle: (checked: boolean) => Promise<void>;
  handleIncludeDecorationToggle: (checked: boolean) => Promise<void>;
  handleProcessAllQuests: () => Promise<void>;
  handleStopQuests: () => Promise<void>;
  handleClaimSingleQuest: (questId: string) => Promise<void>;

  // DBS (Discord Badge Spoofer)
  dbsCookie: string;
  setDbsCookie: (val: string) => void;
  dbsFingerprint: string;
  setDbsFingerprint: (val: string) => void;
  dbsHoursPerGame: number;
  setDbsHoursPerGame: (val: number) => void;
  dbsGameCount: number;
  setDbsGameCount: (val: number) => void;
  dbsMode: "hours" | "games";
  setDbsMode: (val: "hours" | "games") => void;
  dbsStatus: any;
  dbsStarting: boolean;
  dbsStopping: boolean;
  dbsTotalGamesClaimed: number;
  dbsTotalHoursClaimed: number;
  dbsLastRunTimestamp: string | null;
  handleStartDbs: () => Promise<void>;
  handleStopDbs: () => Promise<void>;
  handleSaveDbsConfig: (overrides?: any) => Promise<void>;

  // Logs & Helpers
  logs: string[];
  renderEmoji: (emojiStr: string) => React.ReactNode;
  getRpcImageUrl: (clientId: string, imageKey: string) => string | null;
  getLogColorClass: (logText: string) => string;
  getRpcTypeLabel: (type: number) => string;
}

const AlleyContext = createContext<AlleyContextType | null>(null);

export function AlleyProvider({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");

  const [isSyncingData, setIsSyncingData] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [updateNotification, setUpdateNotification] = useState<{ latestVersion: string; isFork: boolean } | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [cooldownErrorMsg, setCooldownErrorMsg] = useState<string | null>(null);

  const [token, setToken] = useState("");
  const [status, setStatus] = useState("online");
  const [device, setDevice] = useState("desktop");
  const [customStatus, setCustomStatus] = useState("Straying around");
  const [customStatusEmoji, setCustomStatusEmoji] = useState("");

  const [verifyingToken, setVerifyingToken] = useState(false);
  const [tokenValidationMsg, setTokenValidationMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [verifiedProfile, setVerifiedProfile] = useState<{ id: string; username: string; discriminator: string; avatar: string | null } | null>(null);

  // Status Rotation
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [rotationInterval, setRotationInterval] = useState(10);
  const [rotationStatus1Text, setRotationStatus1Text] = useState("");
  const [rotationStatus1Emoji, setRotationStatus1Emoji] = useState("");
  const [rotationStatus2Text, setRotationStatus2Text] = useState("");
  const [rotationStatus2Emoji, setRotationStatus2Emoji] = useState("");
  const [rotationStatus3Text, setRotationStatus3Text] = useState("");
  const [rotationStatus3Emoji, setRotationStatus3Emoji] = useState("");

  // Rich Presence
  const [rpcEnabled, setRpcEnabled] = useState(false);
  const [rpcType, setRpcType] = useState<number>(0);
  const [rpcUrl, setRpcUrl] = useState("");
  const [rpcClientId, setRpcClientId] = useState("1527635163591348254");
  const [rpcName, setRpcName] = useState("Stray");
  const [rpcState, setRpcState] = useState("Chasing dots");
  const [rpcDetails, setRpcDetails] = useState("Meowing at 3 AM");
  const [rpcLargeImage, setRpcLargeImage] = useState("");
  const [rpcLargeText, setRpcLargeText] = useState("Straying");
  const [rpcSmallImage, setRpcSmallImage] = useState("");
  const [rpcSmallText, setRpcSmallText] = useState("Purring");

  // Cloud Sync & Terms
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [cloudTermsAccepted, setCloudTermsAccepted] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>(null);
  const [showCloudConsentModal, setShowCloudConsentModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // DQACS (Auto-Quests)
  const [autoQuestsEnabled, setAutoQuestsEnabled] = useState(false);
  const [liveRpcQuests, setLiveRpcQuests] = useState(false);
  const [includeDecorationQuests, setIncludeDecorationQuests] = useState(true);
  const [questsList, setQuestsList] = useState<any[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const [processingQuests, setProcessingQuests] = useState(false);
  const [isStoppingQuests, setIsStoppingQuests] = useState(false);
  const [activeQuestRpc, setActiveQuestRpc] = useState<any>(null);

  // DBS (Discord Badge Spoofer)
  const [dbsCookie, setDbsCookie] = useState("");
  const [dbsFingerprint, setDbsFingerprint] = useState("");
  const [dbsHoursPerGame, setDbsHoursPerGame] = useState<number>(1);
  const [dbsGameCount, setDbsGameCount] = useState<number>(50);
  const [dbsMode, setDbsMode] = useState<"hours" | "games">("hours");
  const [dbsStatus, setDbsStatus] = useState<any>(null);
  const [dbsStarting, setDbsStarting] = useState(false);
  const [dbsStopping, setDbsStopping] = useState(false);
  const [dbsTotalGamesClaimed, setDbsTotalGamesClaimed] = useState(0);
  const [dbsTotalHoursClaimed, setDbsTotalHoursClaimed] = useState(0);
  const [dbsLastRunTimestamp, setDbsLastRunTimestamp] = useState<string | null>(null);

  // Logs & Modals
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [remainingTimeText, setRemainingTimeText] = useState("");
  const [isTokenValidOnOpen, setIsTokenValidOnOpen] = useState(false);

  // Auth check
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
        } else {
          setIsSyncingData(false);
        }
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthChecked(true);
        setIsSyncingData(false);
      });
  }, []);

  // Polling loop
  useEffect(() => {
    if (session) {
      const interval = setInterval(() => {
        fetch("/api/status")
          .then((res) => res.json())
          .then((data) => {
            setIsRunning(data.isRunning || false);
            if (data.isProcessingQuests !== undefined) {
              const wasProcessing = processingQuests;
              const isProc = Boolean(data.isProcessingQuests);
              setProcessingQuests(isProc);
              if (wasProcessing && !isProc) {
                fetchUserQuests();
              }
            }
            if (data.activeQuestRpc) {
              setActiveQuestRpc(data.activeQuestRpc);
            } else {
              setActiveQuestRpc(null);
            }
            if (data.dbsStatus !== undefined) {
              setDbsStatus(data.dbsStatus);
            }
            if (data.logs) {
              setLogs(data.logs.slice(-50));
            }
            if (data.updateNotification) {
              setUpdateNotification(data.updateNotification);
            } else {
              setUpdateNotification(null);
            }
          })
          .catch(() => {});
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [session, processingQuests]);

  // Cooldown timer
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

  // Logout modal countdown
  useEffect(() => {
    let interval: any;
    if (showLogoutModal && session?.keyExpires) {
      const updateTimer = () => {
        const diff = session.keyExpires! - Date.now();
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

  const applyConfigToState = (cfg: any) => {
    if (!cfg) return;
    setToken(cfg.token || "");
    setStatus(cfg.status || "online");
    setDevice(cfg.device || "desktop");
    setTermsAccepted(cfg.termsAccepted || false);
    setCloudSyncEnabled(cfg.cloudSyncEnabled || false);
    setCloudTermsAccepted(cfg.cloudTermsAccepted || false);
    setLastSyncTimestamp(cfg.lastSyncTimestamp || null);
    setAutoQuestsEnabled(cfg.autoQuestsEnabled || false);
    setLiveRpcQuests(cfg.liveRpcQuests || false);
    setIncludeDecorationQuests(cfg.includeDecorationQuests ?? true);
    setRotationEnabled(cfg.rotationEnabled || false);
    setRotationInterval(cfg.rotationInterval || 10);
    setRotationStatus1Text(cfg.rotationStatus1Text || "");
    setRotationStatus1Emoji(cfg.rotationStatus1Emoji || "");
    setRotationStatus2Text(cfg.rotationStatus2Text || "");
    setRotationStatus2Emoji(cfg.rotationStatus2Emoji || "");
    setRotationStatus3Text(cfg.rotationStatus3Text || "");
    setRotationStatus3Emoji(cfg.rotationStatus3Emoji || "");
    setCustomStatus(cfg.custom_status?.text || "");
    setCustomStatusEmoji(cfg.custom_status?.emoji || "");
    setDbsCookie(cfg.dbsCookie || "");
    setDbsFingerprint(cfg.dbsFingerprint || "");
    setDbsHoursPerGame(cfg.dbsHoursPerGame || 1);
    setDbsGameCount(cfg.dbsGameCount || 50);
    setDbsMode(cfg.dbsMode || "hours");
    setDbsTotalGamesClaimed(cfg.dbsTotalGamesClaimed || 0);
    setDbsTotalHoursClaimed(cfg.dbsTotalHoursClaimed || 0);
    setDbsLastRunTimestamp(cfg.dbsLastRunTimestamp || null);
    if (cfg.rich_presence) {
      const isCustomRpc = Boolean(cfg.rich_presence.enabled) && !cfg.liveRpcQuests;
      setRpcEnabled(isCustomRpc);
      setRpcType(cfg.rich_presence.type ?? 0);
      setRpcUrl(cfg.rich_presence.url || "");
      setRpcClientId(cfg.rich_presence.client_id || "1527635163591348254");
      setRpcName(cfg.rich_presence.name || "");
      setRpcState(cfg.rich_presence.state || "");
      setRpcDetails(cfg.rich_presence.details || "");
      setRpcLargeImage(cfg.rich_presence.large_image || "");
      setRpcLargeText(cfg.rich_presence.large_text || "");
      setRpcSmallImage(cfg.rich_presence.small_image || "");
      setRpcSmallText(cfg.rich_presence.small_text || "");
    }
    if (cfg.token) {
      triggerTokenCheck(cfg.token);
      fetchUserQuests();
    }
  };

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
    setIsSyncingData(true);
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          applyConfigToState(data.config);
        }
        if (data.isProcessingQuests !== undefined) {
          setProcessingQuests(Boolean(data.isProcessingQuests));
        }
        if (data.dbsStatus !== undefined) {
          setDbsStatus(data.dbsStatus);
        }
        if (data.activeQuestRpc) {
          setActiveQuestRpc(data.activeQuestRpc);
        } else {
          setActiveQuestRpc(null);
        }
        if (data.updateNotification) {
          setUpdateNotification(data.updateNotification);
        } else {
          setUpdateNotification(null);
        }
        setIsRunning(data.isRunning || false);
        if (data.logs) {
          setLogs(data.logs.slice(-50));
        }
        setConfigLoaded(true);
        setIsSyncingData(false);
      })
      .catch(() => {
        setConfigLoaded(true);
        setIsSyncingData(false);
      });
  };

  const triggerTokenCheck = async (tokenToVerify: string) => {
    if (!tokenToVerify) return;
    setVerifyingToken(true);
    setTokenValidationMsg(null);
    try {
      const res = await fetch("/api/check-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setTokenValidationMsg({ text: `Valid Token: Connected as ${data.user.username}`, isError: false });
        setVerifiedProfile(data.user);
      } else {
        setTokenValidationMsg({ text: data.error || "Invalid Discord Token.", isError: true });
        setVerifiedProfile(null);
      }
    } catch {
      setTokenValidationMsg({ text: "Failed to connect to Discord API.", isError: true });
      setVerifiedProfile(null);
    }
    setVerifyingToken(false);
  };

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.reload();
      } else {
        setAuthError(data.error || "Invalid key. Please check and try again.");
      }
    } catch {
      setAuthError("Failed to authenticate key.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    } catch {}
  };

  const handleSaveConfig = async (override?: any) => {
    setIsSaving(true);
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
            cloudSyncEnabled,
            cloudTermsAccepted,
            autoQuestsEnabled,
            liveRpcQuests: rpcEnabled ? false : liveRpcQuests,
            includeDecorationQuests,
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
            ...override,
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
            cloudSyncEnabled,
            cloudTermsAccepted,
            autoQuestsEnabled,
            liveRpcQuests: rpcEnabled ? false : liveRpcQuests,
            includeDecorationQuests,
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

  const handleAcceptTerms = async () => {
    try {
      const res = await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE",
          config: { termsAccepted: true },
        }),
      });
      if (res.ok) {
        setTermsAccepted(true);
      }
    } catch {}
  };

  // DQACS Handlers
  const handleLiveRpcToggle = async (checked: boolean) => {
    setLiveRpcQuests(checked);
    if (checked) {
      setRpcEnabled(false);
    }
    await handleSaveConfig({
      liveRpcQuests: checked,
      rich_presence: {
        enabled: checked ? false : rpcEnabled,
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
    });
  };

  const handleIncludeDecorationToggle = async (checked: boolean) => {
    setIncludeDecorationQuests(checked);
    await handleSaveConfig({ includeDecorationQuests: checked });
  };

  const handleProcessAllQuests = async () => {
    if (!token) {
      alert("Please configure and publish your Discord token first.");
      return;
    }
    setProcessingQuests(true);
    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PROCESS_ALL", includeDecoration: includeDecorationQuests }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to initiate quest completion.");
        setProcessingQuests(false);
      }
    } catch {
      setProcessingQuests(false);
    }
  };

  const handleStopQuests = async () => {
    setIsStoppingQuests(true);
    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "STOP" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProcessingQuests(false);
      }
    } catch {}
    setIsStoppingQuests(false);
  };

  const handleClaimSingleQuest = async (questId: string) => {
    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLAIM_REWARD", questId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUserQuests();
      } else {
        alert(data.error || "Failed to claim quest.");
      }
    } catch {
      alert("Network error claiming quest.");
    }
  };

  // DBS Handlers
  const handleStartDbs = async () => {
    if (!token) {
      alert("Please configure and publish your Discord token first.");
      return;
    }
    if (!dbsCookie.trim()) {
      alert("Please provide your Cloudflare cf_clearance cookie from DevTools.");
      return;
    }
    setDbsStarting(true);
    try {
      const payload = {
        cookie: dbsCookie.trim(),
        fingerprint: dbsFingerprint,
        hoursPerGame: Number(dbsHoursPerGame) || 1,
        gameCount: Number(dbsGameCount) || 50,
        mode: dbsMode,
      };
      const res = await fetch("/api/dbs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START",
          ...payload,
          options: payload,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbsStatus(data.status);
      } else {
        alert(data.error || "Failed to start Badge Spoofer.");
      }
    } catch {
      alert("Network error starting Badge Spoofer.");
    }
    setDbsStarting(false);
  };

  const handleStopDbs = async () => {
    setDbsStopping(true);
    try {
      const res = await fetch("/api/dbs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "STOP" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbsStatus(data.status);
      }
    } catch {}
    setDbsStopping(false);
  };

  const handleSaveDbsConfig = async (overrides?: any) => {
    try {
      const payload = {
        cookie: dbsCookie.trim(),
        fingerprint: dbsFingerprint,
        hoursPerGame: Number(dbsHoursPerGame) || 1,
        gameCount: Number(dbsGameCount) || 50,
        mode: dbsMode,
        ...overrides,
      };
      await fetch("/api/dbs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_CONFIG",
          ...payload,
          options: payload,
        }),
      });
    } catch {}
  };

  // Helper utilities
  const getRpcImageUrl = (clientId: string, imageKey: string) => {
    if (!imageKey) {
      if (!clientId || clientId === "1527635163591348254") {
        return "https://raw.githubusercontent.com/BadCmdName/Stray/main/Alley/public/Stray.png";
      }
      return null;
    }
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
    if (text.includes("initiating") || text.includes("starting") || text.includes("reconnecting") || text.includes("registering") || text.includes("dqacs") || text.includes("spoofing") || text.includes("progress") || text.includes("dbs") || text.includes("badge")) {
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

  return (
    <AlleyContext.Provider
      value={{
        authChecked,
        session,
        authError,
        keyInput,
        setKeyInput,
        handleKeySubmit,
        handleLogout,
        showLogoutModal,
        setShowLogoutModal,
        remainingTimeText,
        isTokenValidOnOpen,
        isSyncingData,
        configLoaded,
        updateNotification,
        isRunning,
        isPublishing,
        isStopping,
        isSaving,
        cooldownRemaining,
        cooldownErrorMsg,
        token,
        setToken,
        status,
        setStatus,
        device,
        setDevice,
        customStatus,
        setCustomStatus,
        customStatusEmoji,
        setCustomStatusEmoji,
        verifyingToken,
        tokenValidationMsg,
        verifiedProfile,
        triggerTokenCheck,
        handlePublish,
        handleStop,
        handleSaveConfig,
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
        lastSyncTimestamp,
        showCloudConsentModal,
        setShowCloudConsentModal,
        termsAccepted,
        handleAcceptTerms,
        autoQuestsEnabled,
        setAutoQuestsEnabled,
        liveRpcQuests,
        setLiveRpcQuests,
        includeDecorationQuests,
        setIncludeDecorationQuests,
        questsList,
        loadingQuests,
        processingQuests,
        isStoppingQuests,
        activeQuestRpc,
        fetchUserQuests,
        handleLiveRpcToggle,
        handleIncludeDecorationToggle,
        handleProcessAllQuests,
        handleStopQuests,
        handleClaimSingleQuest,
        dbsCookie,
        setDbsCookie,
        dbsFingerprint,
        setDbsFingerprint,
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
        renderEmoji,
        getRpcImageUrl,
        getLogColorClass,
        getRpcTypeLabel,
      }}
    >
      {children}
    </AlleyContext.Provider>
  );
}

export function useAlley() {
  const context = useContext(AlleyContext);
  if (!context) {
    throw new Error("useAlley must be used within an AlleyProvider");
  }
  return context;
}
