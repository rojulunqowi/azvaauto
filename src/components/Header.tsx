import React from "react";
import {
  RotateCw,
  Play,
  Square,
  Download,
  Upload,
  Save,
  Send,
} from "lucide-react";

interface HeaderProps {
  isRunning: boolean;
  onRefresh: () => void;
  onToggleBot: () => void;
  onExport: () => void;
  onImportTrigger: () => void;
  onSave: () => void;
  onTestSendModalOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  onRefresh,
  onToggleBot,
  onExport,
  onImportTrigger,
  onSave,
  onTestSendModalOpen,
}) => {
  return (
    <header className="bg-[#131b2e] border-b border-slate-800/80 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Kelola konfigurasi auto post Anda
        </p>
      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#0d1322] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-medium transition cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>

        {/* Start / Stop Bot Main Action Button */}
        <button
          onClick={onToggleBot}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer ${
            isRunning
              ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Bot</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>+ Jalankan Bot</span>
            </>
          )}
        </button>

        {/* Test Send Button */}
        <button
          onClick={onTestSendModalOpen}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition cursor-pointer"
          title="Tes Kirim Pesan Langsung"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Tes Kirim</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#0d1322] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-medium transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Import Button */}
        <button
          onClick={onImportTrigger}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#0d1322] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-medium transition cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import</span>
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Simpan</span>
        </button>
      </div>
    </header>
  );
};
