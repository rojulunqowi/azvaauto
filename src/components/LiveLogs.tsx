import React from "react";
import { LogEntry } from "../types";
import { Terminal, Trash2, RefreshCw } from "lucide-react";

interface LiveLogsProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onRefreshLogs: () => void;
}

export const LiveLogs: React.FC<LiveLogsProps> = ({
  logs,
  onClearLogs,
  onRefreshLogs,
}) => {
  return (
    <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Live Logs (Auto-Refresh)
          </h2>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshLogs}
            title="Refresh Log Terbaru"
            className="p-1.5 bg-[#0d1322] hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700/80 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClearLogs}
            title="Bersihkan Logs"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold border border-red-500/20 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="bg-[#080d1a] border border-slate-800/90 rounded-xl p-4 font-mono text-xs max-h-72 overflow-y-auto space-y-2 select-text">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic py-6 text-center">
            Belum ada log yang tersimpan.
          </div>
        ) : (
          logs.map((log) => {
            let badgeClass = "bg-blue-500/15 text-blue-400 border-blue-500/30";
            if (log.level === "success")
              badgeClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
            if (log.level === "warn")
              badgeClass = "bg-amber-500/15 text-amber-400 border-amber-500/30";
            if (log.level === "error")
              badgeClass = "bg-red-500/15 text-red-400 border-red-500/30";

            return (
              <div
                key={log.id}
                className="flex items-start gap-2.5 leading-relaxed hover:bg-slate-800/30 p-1 rounded transition"
              >
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span
                  className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase shrink-0 ${badgeClass}`}
                >
                  {log.level}
                </span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
