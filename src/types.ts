export interface ChannelConfig {
  id: string;
  channelId: string;
  customDelay: number; // in seconds
  unit: 'Detik' | 'Menit' | 'Jam';
  customMessage?: string;
  active: boolean;
}

export type SendMode = 'Text Post (Kirim Pesan Biasa)' | 'Embed Post' | 'Random Spin Message';

export interface BotConfig {
  discordToken: string;
  modeKirim: SendMode;
  isiPesan: string;
  fallbackDelay: number; // in seconds
  enableAutoRetry?: boolean;
  maxRetryAttempts?: number;
  channels: ChannelConfig[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  channelId?: string;
}

export interface BotStatus {
  isRunning: boolean;
  activeChannelsCount: number;
  subscriptionStatus: string;
  daysRemaining: number | string;
  expiryDate: string;
  totalSent: number;
  totalError: number;
  lastRunTime?: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  role?: 'admin' | 'user';
  avatarUrl?: string;
  status: 'ONLINE' | 'OFFLINE';
}

export interface UserAccountItem {
  username: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt?: string;
}
