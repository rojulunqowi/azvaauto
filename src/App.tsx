import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChannelConfig,
  SendMode,
  BotStatus,
  LogEntry,
  UserProfile,
} from "./types";
import { LoginView } from "./components/LoginView";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { MetricsCards } from "./components/MetricsCards";
import { MessageConfig } from "./components/MessageConfig";
import { ChannelList } from "./components/ChannelList";
import { FileImport } from "./components/FileImport";
import { LiveLogs } from "./components/LiveLogs";
import { TestSendModal } from "./components/TestSendModal";
import { UserManagement } from "./components/UserManagement";
import { AlertTriangle, CheckCircle, X, Shield, Clock } from "lucide-react";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

export default function App() {
  // Idle notice state for auto-logout
  const [idleNotice, setIdleNotice] = useState<string | null>(null);

  // Initial user check with session idle validation
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem("autopost_user");
    const savedLastActivity = localStorage.getItem("autopost_last_activity");

    if (savedUser && savedLastActivity) {
      const elapsed = Date.now() - Number(savedLastActivity);
      if (elapsed > IDLE_TIMEOUT_MS) {
        localStorage.removeItem("autopost_user");
        localStorage.removeItem("autopost_last_activity");
        return null;
      }
      return JSON.parse(savedUser);
    }
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState("dashboard");

  // Bot Config State
  const [discordToken, setDiscordToken] = useState("");
  const [modeKirim, setModeKirim] = useState<SendMode>(
    "Text Post (Kirim Pesan Biasa)"
  );
  const [isiPesan, setIsiPesan] = useState("");
  const [fallbackDelay, setFallbackDelay] = useState(60);
  const [enableAutoRetry, setEnableAutoRetry] = useState(true);
  const [maxRetryAttempts, setMaxRetryAttempts] = useState(3);
  const [channels, setChannels] = useState<ChannelConfig[]>([]);

  // Bot Status & Logs State
  const [botStatus, setBotStatus] = useState<BotStatus>({
    isRunning: false,
    activeChannelsCount: 0,
    subscriptionStatus: "AKTIF",
    daysRemaining: 6,
    expiryDate: "19 Aug 2026, 08:11 WIB",
    totalSent: 0,
    totalError: 0,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);

  // UI Feedback Banners
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Test Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [targetTestChannelId, setTargetTestChannelId] = useState("");

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update last activity timestamp
  const resetIdleTimer = useCallback(() => {
    if (user) {
      localStorage.setItem("autopost_last_activity", String(Date.now()));
    }
  }, [user]);

  // Global activity event listeners
  useEffect(() => {
    if (!user) return;

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    const handleUserActivity = () => resetIdleTimer();

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity));
    resetIdleTimer();

    // Check idle status every 10 seconds
    idleCheckTimerRef.current = setInterval(() => {
      const last = localStorage.getItem("autopost_last_activity");
      if (last) {
        const elapsed = Date.now() - Number(last);
        if (elapsed > IDLE_TIMEOUT_MS) {
          // Trigger Auto-Logout!
          localStorage.removeItem("autopost_user");
          localStorage.removeItem("autopost_last_activity");
          setUser(null);
          setIdleNotice(
            "Sesi Anda telah di-logout otomatis karena tidak ada aktivitas selama 30 menit demi keamanan."
          );
        }
      }
    }, 10000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (idleCheckTimerRef.current) clearInterval(idleCheckTimerRef.current);
    };
  }, [user, resetIdleTimer]);

  // Load configuration from backend for current user
  const fetchConfig = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/config?username=${encodeURIComponent(user.username)}`);
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (data?.success && data?.config) {
        setDiscordToken(data.config.discordToken || "");
        setModeKirim(data.config.modeKirim || "Text Post (Kirim Pesan Biasa)");
        setIsiPesan(data.config.isiPesan || "");
        setFallbackDelay(data.config.fallbackDelay || 60);
        setEnableAutoRetry(data.config.enableAutoRetry !== false);
        setMaxRetryAttempts(data.config.maxRetryAttempts || 3);
        setChannels(data.config.channels || []);
      }
    } catch {
      // Quiet fail on temporary disconnects
    }
  }, [user]);

  // Fetch bot status and live logs for current user
  const fetchStatusAndLogs = useCallback(async () => {
    if (!user) return;
    try {
      const [statusResult, logsResult] = await Promise.allSettled([
        fetch(`/api/bot/status?username=${encodeURIComponent(user.username)}`),
        fetch(`/api/bot/logs?username=${encodeURIComponent(user.username)}`),
      ]);

      if (statusResult.status === "fulfilled" && statusResult.value.ok) {
        const statusData = await statusResult.value.json().catch(() => null);
        if (statusData?.success && statusData?.status) {
          setBotStatus(statusData.status);
        }
      }

      if (logsResult.status === "fulfilled" && logsResult.value.ok) {
        const logsData = await logsResult.value.json().catch(() => null);
        if (logsData?.success && logsData?.logs) {
          setLogs(logsData.logs);
        }
      }
    } catch {
      // Quiet fail during polling
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConfig();
      fetchStatusAndLogs();

      pollTimerRef.current = setInterval(() => {
        fetchStatusAndLogs();
      }, 2500);
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [user, fetchConfig, fetchStatusAndLogs]);

  // Handle Save Config for current user
  const handleSaveConfig = async () => {
    if (!user) return;
    setAlertBanner(null);
    const payload = {
      username: user.username,
      discordToken,
      modeKirim,
      isiPesan,
      fallbackDelay,
      enableAutoRetry,
      maxRetryAttempts,
      channels,
    };

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessToast("Konfigurasi akun '" + user.displayName + "' berhasil disimpan!");
        setTimeout(() => setSuccessToast(null), 3000);
      } else {
        setAlertBanner(data.message || "Gagal menyimpan konfigurasi.");
      }
    } catch {
      setAlertBanner("Terjadi kesalahan koneksi saat menyimpan konfigurasi.");
    }
  };

  // Toggle Bot Execution for current user
  const handleToggleBot = async () => {
    if (!user) return;
    setAlertBanner(null);

    if (botStatus.isRunning) {
      // STOP Bot
      try {
        const res = await fetch("/api/bot/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccessToast("Bot berhasil dihentikan.");
          setTimeout(() => setSuccessToast(null), 3000);
          fetchStatusAndLogs();
        }
      } catch {
        setAlertBanner("Gagal menghentikan bot.");
      }
    } else {
      // START Bot - First save current user config then trigger start
      await handleSaveConfig();

      try {
        const res = await fetch("/api/bot/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setSuccessToast("Bot berhasil dijalankan untuk user '" + user.displayName + "'!");
          setTimeout(() => setSuccessToast(null), 3000);
          fetchStatusAndLogs();
        } else {
          setAlertBanner(
            data.message ||
              "Gagal menjalankan bot! Lengkapi data: Discord Token, Isi Pesan, Channel (minimal 1). Klik Simpan terlebih dahulu."
          );
        }
      } catch {
        setAlertBanner("Gagal berkomunikasi dengan server bot.");
      }
    }
  };

  // Export JSON file
  const handleExport = () => {
    const configData = {
      username: user?.username,
      discordToken,
      modeKirim,
      isiPesan,
      fallbackDelay,
      channels,
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `autopost-${user?.username || "config"}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessToast("File konfigurasi berhasil di-export!");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Import Channels
  const handleImportChannels = (newChannels: ChannelConfig[]) => {
    setChannels((prev) => [...prev, ...newChannels]);
    setSuccessToast(`Berhasil menambahkan ${newChannels.length} channel!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Clear Logs
  const handleClearLogs = async () => {
    if (!user) return;
    try {
      await fetch("/api/bot/clear-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username }),
      });
      fetchStatusAndLogs();
    } catch {
      console.error("Gagal membersihkan logs.");
    }
  };

  // Login handler
  const handleLoginSuccess = (usr: { username: string; displayName: string; role?: "admin" | "user" }) => {
    const profile: UserProfile = {
      username: usr.username,
      displayName: usr.displayName,
      role: usr.role || (usr.username.toLowerCase() === "admin" || usr.username.toLowerCase() === "azva" ? "admin" : "user"),
      status: "ONLINE",
    };
    setUser(profile);
    setIdleNotice(null);
    localStorage.setItem("autopost_user", JSON.stringify(profile));
    localStorage.setItem("autopost_last_activity", String(Date.now()));
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setIdleNotice(null);
    localStorage.removeItem("autopost_user");
    localStorage.removeItem("autopost_last_activity");
  };

  // Test send specific channel
  const handleTestSendChannel = (ch: ChannelConfig) => {
    setTargetTestChannelId(ch.channelId);
    setTestModalOpen(true);
  };

  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} idleNotice={idleNotice} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex font-sans selection:bg-blue-500 selection:text-white antialiased">
      {/* Sidebar */}
      <Sidebar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <Header
          isRunning={botStatus.isRunning}
          onRefresh={fetchStatusAndLogs}
          onToggleBot={handleToggleBot}
          onExport={handleExport}
          onImportTrigger={() => {
            const importSection = document.getElementById("import-section");
            importSection?.scrollIntoView({ behavior: "smooth" });
          }}
          onSave={handleSaveConfig}
          onTestSendModalOpen={() => {
            setTargetTestChannelId(channels[0]?.channelId || "");
            setTestModalOpen(true);
          }}
        />

        {/* Dashboard Body */}
        <main className="p-8 max-w-7xl w-full mx-auto">
          {/* Security Idle Status Bar */}
          <div className="mb-6 px-4 py-2.5 bg-[#131b2e] border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Sesi Pengguna: <strong className="text-white">{user.displayName}</strong> ({user.username})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Auto-Logout Idle 30 Menit: <span className="text-emerald-400 font-semibold">AKTIFF</span></span>
            </div>
          </div>

          {/* Validation Error Banner */}
          {alertBanner && (
            <div className="mb-6 p-4 bg-red-600/15 border-2 border-red-500/40 rounded-2xl flex items-start justify-between gap-3 text-red-300 animate-fadeIn">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">
                  {alertBanner}
                </div>
              </div>
              <button
                onClick={() => setAlertBanner(null)}
                className="text-red-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Success Toast */}
          {successToast && (
            <div className="mb-6 p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-emerald-300 animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs font-semibold">{successToast}</div>
              </div>
              <button
                onClick={() => setSuccessToast(null)}
                className="text-emerald-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === "users" ? (
            <UserManagement currentUser={user} />
          ) : (
            <>
              {/* Summary Metrics Row */}
              <MetricsCards status={botStatus} />

              {/* Main Grid: Message Config & Channel List */}
              <MessageConfig
                discordToken={discordToken}
                setDiscordToken={setDiscordToken}
                modeKirim={modeKirim}
                setModeKirim={setModeKirim}
                isiPesan={isiPesan}
                setIsiPesan={setIsiPesan}
                fallbackDelay={fallbackDelay}
                setFallbackDelay={setFallbackDelay}
                enableAutoRetry={enableAutoRetry}
                setEnableAutoRetry={setEnableAutoRetry}
                maxRetryAttempts={maxRetryAttempts}
                setMaxRetryAttempts={setMaxRetryAttempts}
              />

              {/* Channel List */}
              <ChannelList
                channels={channels}
                setChannels={setChannels}
                onTestSendChannel={handleTestSendChannel}
              />

              {/* File Import Section */}
              <div id="import-section">
                <FileImport onImportChannels={handleImportChannels} />
              </div>

              {/* Live Execution Logs */}
              <LiveLogs
                logs={logs}
                onClearLogs={handleClearLogs}
                onRefreshLogs={fetchStatusAndLogs}
              />
            </>
          )}
        </main>
      </div>

      {/* Test Message Modal */}
      <TestSendModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        username={user.username}
        defaultToken={discordToken}
        defaultChannelId={targetTestChannelId}
        defaultMessage={isiPesan}
        defaultModeKirim={modeKirim}
      />
    </div>
  );
}

