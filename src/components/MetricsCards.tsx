import React from "react";
import { BotStatus } from "../types";
import { Activity, Clock, Layers, CalendarCheck } from "lucide-react";

interface MetricsCardsProps {
  status: BotStatus;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ status }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* STATUS BOT CARD */}
      <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            STATUS BOT
          </span>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status.isRunning
                ? "bg-emerald-400 animate-ping"
                : "bg-slate-600"
            }`}
          />
        </div>
        <div>
          <div className="inline-block">
            {status.isRunning ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-lg uppercase tracking-wider">
                ● RUNNING
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs rounded-lg uppercase tracking-wider">
                ● STOPPED
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            {status.isRunning
              ? `Sent: ${status.totalSent} | Err: ${status.totalError}`
              : "Bot tidak berjalan"}
          </div>
        </div>
      </div>

      {/* LISENSI CARD */}
      <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-4.5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            LISENSI
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-md uppercase tracking-wider">
              ● {status.subscriptionStatus || "LIFETIME (GRATIS)"}
            </span>
          </div>
          <div className="text-sm font-semibold text-white mt-1.5">
            {typeof status.daysRemaining === "number"
              ? `${status.daysRemaining} Hari`
              : status.daysRemaining || "UNLIMITED"}
          </div>
        </div>
      </div>

      {/* CHANNEL CARD */}
      <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-4.5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            CHANNEL
          </span>
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {status.activeChannelsCount}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Channel aktif</div>
        </div>
      </div>

      {/* KADALUARSA CARD */}
      <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-4.5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
            KADALUARSA
          </span>
        </div>
        <div>
          <div className="text-sm font-bold text-emerald-400 tracking-tight">
            {status.expiryDate || "LIFETIME / TANPA BATAS"}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Akses Penuh Tanpa Berlangganan
          </div>
        </div>
      </div>
    </div>
  );
};
