import React, { useState } from "react";
import { SendMode } from "../types";
import { Sliders, Key, Eye, EyeOff, MessageSquareText, Clock, Sparkles, RefreshCw } from "lucide-react";

interface MessageConfigProps {
  discordToken: string;
  setDiscordToken: (token: string) => void;
  modeKirim: SendMode;
  setModeKirim: (mode: SendMode) => void;
  isiPesan: string;
  setIsiPesan: (msg: string) => void;
  fallbackDelay: number;
  setFallbackDelay: (delay: number) => void;
  enableAutoRetry: boolean;
  setEnableAutoRetry: (enable: boolean) => void;
  maxRetryAttempts: number;
  setMaxRetryAttempts: (attempts: number) => void;
}

export const MessageConfig: React.FC<MessageConfigProps> = ({
  discordToken,
  setDiscordToken,
  modeKirim,
  setModeKirim,
  isiPesan,
  setIsiPesan,
  fallbackDelay,
  setFallbackDelay,
  enableAutoRetry,
  setEnableAutoRetry,
  maxRetryAttempts,
  setMaxRetryAttempts,
}) => {
  const [showToken, setShowToken] = useState(false);

  const insertTag = (tag: string) => {
    setIsiPesan(isiPesan + " " + tag);
  };

  return (
    <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 mb-6">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/80">
        <Sliders className="w-5 h-5 text-blue-400" />
        <h2 className="text-base font-bold text-white tracking-wide">
          Konfigurasi Pesan
        </h2>
      </div>

      <div className="space-y-6">
        {/* DISCORD TOKEN */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            DISCORD TOKEN
          </label>
          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showToken ? "text" : "password"}
              value={discordToken}
              onChange={(e) => setDiscordToken(e.target.value)}
              placeholder="Masukkan Token Discord Anda"
              className="w-full pl-10 pr-12 py-3 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-400 inline-block" />
            Pastikan token ini disimpan secara aman.
          </p>
        </div>

        {/* MODE KIRIM */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            MODE KIRIM
          </label>
          <select
            value={modeKirim}
            onChange={(e) => setModeKirim(e.target.value as SendMode)}
            className="w-full px-4 py-3 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm cursor-pointer"
          >
            <option value="Text Post (Kirim Pesan Biasa)">
              Text Post (Kirim Pesan Biasa)
            </option>
            <option value="Embed Post">Embed Post (Kirim dengan Layout Box Discord)</option>
            <option value="Random Spin Message">
              Random Spin Message (Variasi Acak Pisahkan dengan ||SPIN||)
            </option>
          </select>
        </div>

        {/* ISI PESAN */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquareText className="w-3.5 h-3.5 text-blue-400" />
              ISI PESAN
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium">Tambah Tag:</span>
              <button
                type="button"
                onClick={() => insertTag("{time}")}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-[10px] font-mono transition"
              >
                +&#123;time&#125;
              </button>
              <button
                type="button"
                onClick={() => insertTag("{date}")}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-[10px] font-mono transition"
              >
                +&#123;date&#125;
              </button>
              <button
                type="button"
                onClick={() => insertTag("{random}")}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-[10px] font-mono transition"
              >
                +&#123;random&#125;
              </button>
            </div>
          </div>
          <textarea
            rows={4}
            value={isiPesan}
            onChange={(e) => setIsiPesan(e.target.value)}
            placeholder="Ketik pesan yang ingin dikirim ke channel..."
            className="w-full px-4 py-3 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm font-sans"
          />
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Mendukung format Discord (bold, italic, **bold**, *italic*, ```code```)
          </p>
        </div>

        {/* FALLBACK DELAY */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            FALLBACK DELAY (DETIK)
          </label>
          <input
            type="number"
            min={5}
            value={fallbackDelay}
            onChange={(e) => setFallbackDelay(Number(e.target.value))}
            className="w-full px-4 py-3 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm font-mono"
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Digunakan hanya bila channel tidak memiliki custom delay (Default: 60 detik).
          </p>
        </div>

        {/* AUTOMATIC RETRY WITH EXPONENTIAL BACKOFF */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-4.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    AUTO RETRY & EXPONENTIAL BACKOFF
                  </span>
                  <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded uppercase">
                    AUTO RECOVERY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Otomatis mencoba ulang pengiriman pesan yang gagal/rate limit dengan penundaan bertahap (2s, 4s, 8s, 16s...).
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enableAutoRetry}
                onChange={(e) => setEnableAutoRetry(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {enableAutoRetry && (
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                BATAS MAKSIMAL PERCOBAAN ULANG (MAX RETRIES):
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={maxRetryAttempts}
                  onChange={(e) => setMaxRetryAttempts(Number(e.target.value))}
                  className="px-3 py-1.5 bg-[#131b2e] border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value={1}>1x Percobaan Ulang</option>
                  <option value={2}>2x Percobaan Ulang</option>
                  <option value={3}>3x Percobaan Ulang (Rekomendasi)</option>
                  <option value={5}>5x Percobaan Ulang</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
