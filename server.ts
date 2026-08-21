import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// File persistence paths
const CONFIGS_FILE = path.join(process.cwd(), "autopost-configs.json");
const USERS_FILE = path.join(process.cwd(), "autopost-users.json");

interface ChannelConfig {
  id: string;
  channelId: string;
  customDelay: number;
  unit: string;
  customMessage?: string;
  active: boolean;
}

interface ServerState {
  discordToken: string;
  modeKirim: string;
  isiPesan: string;
  fallbackDelay: number;
  enableAutoRetry?: boolean;
  maxRetryAttempts?: number;
  channels: ChannelConfig[];
}

interface UserAccount {
  username: string;
  displayName: string;
  password: string;
  role: "admin" | "user";
  createdAt: string;
}

// Default initial user accounts
let usersStore: Record<string, UserAccount> = {
  azva: {
    username: "azva",
    displayName: "Azva",
    password: "123",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  admin: {
    username: "admin",
    displayName: "Administrator",
    password: "123",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  user2: {
    username: "user2",
    displayName: "User Secondary",
    password: "123",
    role: "user",
    createdAt: new Date().toISOString(),
  },
};

// Default empty config template
function getDefaultUserConfig(): ServerState {
  return {
    discordToken: "",
    modeKirim: "Text Post (Kirim Pesan Biasa)",
    isiPesan: "Halo dari Discord Autopost Bot! 🚀\nWaktu: {time} | Tanggal: {date}\nKode Unik: {random}",
    fallbackDelay: 60,
    enableAutoRetry: true,
    maxRetryAttempts: 3,
    channels: [
      {
        id: "ch-1",
        channelId: "",
        customDelay: 60,
        unit: "Detik",
        customMessage: "",
        active: true,
      },
    ],
  };
}

let configsStore: Record<string, ServerState> = {};

// Load persistent data
try {
  if (fs.existsSync(USERS_FILE)) {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    usersStore = { ...usersStore, ...JSON.parse(raw) };
  }
} catch (e) {
  console.error("Failed to read autopost-users.json:", e);
}

try {
  if (fs.existsSync(CONFIGS_FILE)) {
    const raw = fs.readFileSync(CONFIGS_FILE, "utf-8");
    configsStore = JSON.parse(raw);
  }
} catch (e) {
  console.error("Failed to read autopost-configs.json:", e);
}

function saveUsersToFile() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersStore, null, 2));
  } catch (e) {
    console.error("Failed to save autopost-users.json:", e);
  }
}

function saveConfigsToFile() {
  try {
    fs.writeFileSync(CONFIGS_FILE, JSON.stringify(configsStore, null, 2));
  } catch (e) {
    console.error("Failed to save autopost-configs.json:", e);
  }
}

function getUserConfig(username: string): ServerState {
  const key = username.toLowerCase();
  if (!configsStore[key]) {
    configsStore[key] = getDefaultUserConfig();
    saveConfigsToFile();
  }
  return configsStore[key];
}

// Bot Per-User Runtime State
interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "success" | "warn" | "error";
  message: string;
  channelId?: string;
}

interface UserRuntime {
  isRunning: boolean;
  totalSentCount: number;
  totalErrorCount: number;
  lastRunTimestamp: string | null;
  channelTimers: Map<string, NodeJS.Timeout>;
  liveLogs: LogEntry[];
}

const userRuntimes: Map<string, UserRuntime> = new Map();

function getUserRuntime(username: string): UserRuntime {
  const key = username.toLowerCase();
  if (!userRuntimes.has(key)) {
    userRuntimes.set(key, {
      isRunning: false,
      totalSentCount: 0,
      totalErrorCount: 0,
      lastRunTimestamp: null,
      channelTimers: new Map(),
      liveLogs: [
        {
          id: "init-1",
          timestamp: new Date().toLocaleTimeString("id-ID"),
          level: "info",
          message: `Sistem Autopost untuk '${username}' SIAP. Masukkan Token & Channel ID lalu klik Jalankan Bot.`,
        },
      ],
    });
  }
  return userRuntimes.get(key)!;
}

function addLogForUser(username: string, level: LogEntry["level"], message: string, channelId?: string) {
  const runtime = getUserRuntime(username);
  const timeStr = new Date().toLocaleTimeString("id-ID");
  const newLog: LogEntry = {
    id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    timestamp: timeStr,
    level,
    message,
    channelId,
  };
  runtime.liveLogs.unshift(newLog);
  if (runtime.liveLogs.length > 200) {
    runtime.liveLogs = runtime.liveLogs.slice(0, 200);
  }
  console.log(`[USER: ${username.toUpperCase()}][${level.toUpperCase()}] ${timeStr} - ${message}`);
}

// Helper to format dynamic placeholders in message
function formatMessageContent(rawText: string): string {
  if (!rawText) return "";
  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID");
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const numberStr = Math.floor(1000 + Math.random() * 9000).toString();

  let text = rawText;
  if (text.includes("||SPIN||")) {
    const parts = text.split("||SPIN||");
    text = parts[Math.floor(Math.random() * parts.length)].trim();
  }

  return text
    .replace(/\{time\}/g, timeStr)
    .replace(/\{date\}/g, dateStr)
    .replace(/\{random\}/g, randomStr)
    .replace(/\{number\}/g, numberStr);
}

// Post message to Discord API
async function sendDiscordMessage(
  token: string,
  channelId: string,
  rawContent: string,
  modeKirim: string
): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
  const cleanChannelId = channelId.trim();
  if (!cleanChannelId) {
    return { success: false, error: "Channel ID kosong" };
  }

  const formattedContent = formatMessageContent(rawContent);
  const authHeader = token.trim().startsWith("Bot ") || token.trim().startsWith("Bearer ")
    ? token.trim()
    : token.trim();

  let bodyData: Record<string, unknown> = {};
  if (modeKirim === "Embed Post") {
    bodyData = {
      embeds: [
        {
          title: "📢 Auto Announcement",
          description: formattedContent,
          color: 0x5865f2,
          footer: { text: "Autopost System • " + new Date().toLocaleTimeString("id-ID") },
        },
      ],
    };
  } else {
    bodyData = { content: formattedContent };
  }

  try {
    let response = await fetch(`https://discord.com/api/v10/channels/${cleanChannelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    if (response.status === 401 && !authHeader.startsWith("Bot ")) {
      response = await fetch(`https://discord.com/api/v10/channels/${cleanChannelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bot ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });
    }

    if (response.ok) {
      return { success: true };
    }

    const errorJson = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (response.status === 429) {
      const retryAfter = (errorJson.retry_after as number) || 5;
      return {
        success: false,
        error: `Rate limit Discord! Tunggu ${retryAfter} detik.`,
        retryAfter,
      };
    }

    const msg = (errorJson.message as string) || `HTTP ${response.status} ${response.statusText}`;
    return { success: false, error: msg };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: "Network error: " + message };
  }
}

// Scheduler loop per channel per user
function scheduleChannelNextPostForUser(username: string, ch: ChannelConfig) {
  const runtime = getUserRuntime(username);
  if (!runtime.isRunning) return;

  const userConfig = getUserConfig(username);
  let delaySec = ch.customDelay > 0 ? ch.customDelay : userConfig.fallbackDelay;
  if (ch.unit === "Menit") delaySec *= 60;
  if (ch.unit === "Jam") delaySec *= 3600;

  if (delaySec < 5) delaySec = 5;

  const timer = setTimeout(async () => {
    if (!runtime.isRunning) return;

    const messageToSend = ch.customMessage?.trim() || userConfig.isiPesan;
    addLogForUser(username, "info", `[Sending] Mengirim pesan ke channel ID: ${ch.channelId}...`, ch.channelId);

    let result = await sendDiscordMessage(
      userConfig.discordToken,
      ch.channelId,
      messageToSend,
      userConfig.modeKirim
    );

    const enableRetry = userConfig.enableAutoRetry !== false;
    const maxRetries = userConfig.maxRetryAttempts || 3;

    if (!result.success && enableRetry && maxRetries > 0) {
      const isAuthError =
        result.error?.includes("Unauthorized") || result.error?.includes("401");

      if (!isAuthError) {
        let attempt = 1;
        while (!result.success && attempt <= maxRetries && runtime.isRunning) {
          let backoffSec = Math.pow(2, attempt);
          if (result.retryAfter) {
            backoffSec = Math.max(backoffSec, Math.ceil(result.retryAfter) + 1);
          }

          addLogForUser(
            username,
            "warn",
            `[RETRY ${attempt}/${maxRetries}] Gagal kirim ke Channel ID: ${ch.channelId} (${result.error}). Mencoba lagi dalam ${backoffSec}s (Exponential Backoff)...`,
            ch.channelId
          );

          await new Promise((resolve) => setTimeout(resolve, backoffSec * 1000));
          if (!runtime.isRunning) return;

          addLogForUser(
            username,
            "info",
            `[RETRY ${attempt}/${maxRetries}] Mengirim ulang pesan ke Channel ID: ${ch.channelId}...`,
            ch.channelId
          );

          result = await sendDiscordMessage(
            userConfig.discordToken,
            ch.channelId,
            messageToSend,
            userConfig.modeKirim
          );

          attempt++;
        }
      }
    }

    if (result.success) {
      runtime.totalSentCount++;
      addLogForUser(
        username,
        "success",
        `[BERHASIL] Pesan terkirim ke Channel ID: ${ch.channelId}. Reschedule berikut dalam ${delaySec} detik.`,
        ch.channelId
      );
    } else {
      runtime.totalErrorCount++;
      addLogForUser(
        username,
        "error",
        `[GAGAL] Channel ID: ${ch.channelId} -> Error: ${result.error}`,
        ch.channelId
      );

      if (result.retryAfter) {
        delaySec = Math.max(delaySec, Math.ceil(result.retryAfter) + 2);
      }

      if (result.error?.includes("Unauthorized") || result.error?.includes("401")) {
        addLogForUser(username, "error", "Token Discord tidak valid atau tidak memiliki akses! Menghentikan bot.");
        stopBotExecutionForUser(username);
        return;
      }
    }

    if (runtime.isRunning) {
      scheduleChannelNextPostForUser(username, ch);
    }
  }, delaySec * 1000);

  runtime.channelTimers.set(ch.id, timer);
}

function startBotExecutionForUser(username: string): { success: boolean; message: string } {
  const userConfig = getUserConfig(username);
  const runtime = getUserRuntime(username);

  const token = userConfig.discordToken?.trim();
  const msg = userConfig.isiPesan?.trim();
  const validChannels = (userConfig.channels || []).filter(
    (c) => c.channelId && c.channelId.trim() && c.active !== false
  );

  if (!token || !msg || validChannels.length === 0) {
    return {
      success: false,
      message:
        "Gagal menjalankan bot! Lengkapi data: Discord Token, Isi Pesan, Channel (minimal 1). Klik Simpan terlebih dahulu.",
    };
  }

  stopBotExecutionForUser(username);

  runtime.isRunning = true;
  runtime.lastRunTimestamp = new Date().toISOString();
  addLogForUser(username, "info", `🚀 Bot Autopost untuk user '${username}' DIMULAI! Aktif pada ${validChannels.length} channel.`);

  validChannels.forEach((ch) => {
    (async () => {
      const messageToSend = ch.customMessage?.trim() || userConfig.isiPesan;
      addLogForUser(username, "info", `[Start] Instant post ke Channel ID: ${ch.channelId}`, ch.channelId);

      const res = await sendDiscordMessage(
        token,
        ch.channelId,
        messageToSend,
        userConfig.modeKirim
      );

      if (res.success) {
        runtime.totalSentCount++;
        addLogForUser(username, "success", `[BERHASIL] Instant post ke Channel ID: ${ch.channelId}`, ch.channelId);
      } else {
        runtime.totalErrorCount++;
        addLogForUser(username, "error", `[GAGAL] Instant post Channel ID: ${ch.channelId} -> ${res.error}`, ch.channelId);
      }

      scheduleChannelNextPostForUser(username, ch);
    })();
  });

  return { success: true, message: "Bot berhasil dijalankan!" };
}

function stopBotExecutionForUser(username: string) {
  const runtime = getUserRuntime(username);
  runtime.isRunning = false;
  runtime.channelTimers.forEach((timer) => clearTimeout(timer));
  runtime.channelTimers.clear();
  addLogForUser(username, "warn", "🛑 Bot Autopost DIHENTIKAN oleh pengguna.");
}

// API Routes

// Authentication (Login)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan Password wajib diisi!" });
  }

  const key = username.trim().toLowerCase();
  const userAcc = usersStore[key];

  if (userAcc) {
    if (userAcc.password === password.trim()) {
      return res.json({
        success: true,
        user: {
          username: userAcc.username,
          displayName: userAcc.displayName,
          role: userAcc.role || (key === "admin" || key === "azva" ? "admin" : "user"),
          status: "ONLINE",
        },
      });
    } else {
      return res.status(401).json({ success: false, message: "Password salah!" });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Username tidak terdaftar! Hanya Administrator yang dapat menambahkan akun pengguna baru.",
    });
  }
});

// Admin-Only User Registration / Addition Endpoint
app.post("/api/users/add", (req, res) => {
  const { adminUsername, username, displayName, password, role } = req.body;

  if (!adminUsername) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak! Konfirmasi username administrator diperlukan.",
    });
  }

  const adminKey = adminUsername.trim().toLowerCase();
  const adminAcc = usersStore[adminKey];

  if (!adminAcc || (adminAcc.role !== "admin" && adminKey !== "admin" && adminKey !== "azva")) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak! Hanya Administrator yang memiliki wewenang menambahkan user baru.",
    });
  }

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan Password wajib diisi!" });
  }

  const key = username.trim().toLowerCase();
  if (usersStore[key]) {
    return res.status(400).json({ success: false, message: `Username '${key}' sudah terdaftar!` });
  }

  const newUser: UserAccount = {
    username: key,
    displayName: displayName?.trim() || username.trim(),
    password: password.trim(),
    role: role === "admin" ? "admin" : "user",
    createdAt: new Date().toISOString(),
  };

  usersStore[key] = newUser;
  saveUsersToFile();

  return res.json({
    success: true,
    message: `Pengguna '${newUser.displayName}' (${newUser.role.toUpperCase()}) berhasil ditambahkan oleh Administrator!`,
    user: {
      username: newUser.username,
      displayName: newUser.displayName,
      role: newUser.role,
    },
  });
});

// Admin-Only User Delete Endpoint
app.post("/api/users/delete", (req, res) => {
  const { adminUsername, targetUsername } = req.body;

  if (!adminUsername) {
    return res.status(403).json({ success: false, message: "Akses ditolak! Username administrator diperlukan." });
  }

  const adminKey = adminUsername.trim().toLowerCase();
  const adminAcc = usersStore[adminKey];

  if (!adminAcc || (adminAcc.role !== "admin" && adminKey !== "admin" && adminKey !== "azva")) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak! Hanya Administrator yang dapat menghapus user.",
    });
  }

  if (!targetUsername) {
    return res.status(400).json({ success: false, message: "Target username wajib diisi!" });
  }

  const targetKey = targetUsername.trim().toLowerCase();
  if (targetKey === "admin" || targetKey === "azva" || targetKey === adminKey) {
    return res.status(400).json({
      success: false,
      message: "Tidak dapat menghapus akun Administrator utama atau akun Anda sendiri!",
    });
  }

  if (!usersStore[targetKey]) {
    return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
  }

  stopBotExecutionForUser(targetKey);

  delete usersStore[targetKey];
  saveUsersToFile();

  return res.json({
    success: true,
    message: `User '${targetUsername}' telah berhasil dihapus oleh Administrator!`,
  });
});

// Get registered users list (with role)
app.get("/api/users", (req, res) => {
  const list = Object.values(usersStore).map((u) => ({
    username: u.username,
    displayName: u.displayName,
    role: u.role || (u.username === "admin" || u.username === "azva" ? "admin" : "user"),
    createdAt: u.createdAt,
  }));
  res.json({ success: true, users: list });
});

// Per-User Config Endpoints
app.get("/api/config", (req, res) => {
  const username = (req.query.username as string) || "azva";
  const config = getUserConfig(username);
  res.json({ success: true, config });
});

app.post("/api/config", (req, res) => {
  const { username, ...newConfig } = req.body;
  const user = username || "azva";
  const key = user.toLowerCase();

  if (newConfig && typeof newConfig === "object") {
    configsStore[key] = { ...getUserConfig(user), ...newConfig };
    saveConfigsToFile();
    addLogForUser(user, "info", "Konfigurasi berhasil disimpan.");
    return res.json({ success: true, message: "Konfigurasi berhasil disimpan!", config: configsStore[key] });
  }
  return res.status(400).json({ success: false, message: "Format konfigurasi tidak valid." });
});

// Per-User Bot Control Endpoints
app.get("/api/bot/status", (req, res) => {
  const username = (req.query.username as string) || "azva";
  const config = getUserConfig(username);
  const runtime = getUserRuntime(username);

  const activeChannelsCount = (config.channels || []).filter(
    (c) => c.channelId && c.channelId.trim() && c.active !== false
  ).length;

  res.json({
    success: true,
    status: {
      isRunning: runtime.isRunning,
      activeChannelsCount,
      subscriptionStatus: "LIFETIME (GRATIS)",
      daysRemaining: "UNLIMITED",
      expiryDate: "LIFETIME / TANPA BATAS",
      totalSent: runtime.totalSentCount,
      totalError: runtime.totalErrorCount,
      lastRunTime: runtime.lastRunTimestamp,
    },
  });
});

app.post("/api/bot/start", (req, res) => {
  const username = req.body.username || "azva";
  const result = startBotExecutionForUser(username);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

app.post("/api/bot/stop", (req, res) => {
  const username = req.body.username || "azva";
  stopBotExecutionForUser(username);
  res.json({ success: true, message: "Bot berhasil dihentikan." });
});

app.get("/api/bot/logs", (req, res) => {
  const username = (req.query.username as string) || "azva";
  const runtime = getUserRuntime(username);
  res.json({ success: true, logs: runtime.liveLogs });
});

app.post("/api/bot/clear-logs", (req, res) => {
  const username = req.body.username || "azva";
  const runtime = getUserRuntime(username);
  runtime.liveLogs = [
    {
      id: "init-cleared",
      timestamp: new Date().toLocaleTimeString("id-ID"),
      level: "info",
      message: "Log telah dibersihkan.",
    },
  ];
  res.json({ success: true, logs: runtime.liveLogs });
});

app.post("/api/bot/test-send", async (req, res) => {
  const { username = "azva", channelId, token, message, modeKirim } = req.body;
  const userConfig = getUserConfig(username);

  const testToken = token || userConfig.discordToken;
  const testMsg = message || userConfig.isiPesan;
  const testMode = modeKirim || userConfig.modeKirim;

  if (!testToken || !channelId) {
    return res
      .status(400)
      .json({ success: false, message: "Token Discord dan Channel ID wajib diisi untuk tes pengiriman!" });
  }

  addLogForUser(username, "info", `[Test Send] Mengirim pesan tes ke channel ID: ${channelId}...`, channelId);

  const result = await sendDiscordMessage(testToken, channelId, testMsg, testMode);

  if (result.success) {
    addLogForUser(username, "success", `[TEST BERHASIL] Pesan tes terkirim ke Channel ID: ${channelId}`, channelId);
    res.json({ success: true, message: "Pesan tes BERHASIL dikirim ke Discord!" });
  } else {
    addLogForUser(username, "error", `[TEST GAGAL] Channel ID: ${channelId} -> ${result.error}`, channelId);
    res.status(400).json({ success: false, message: `Pesan tes GAGAL: ${result.error}` });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

