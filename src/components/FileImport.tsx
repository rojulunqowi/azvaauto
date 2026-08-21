import React, { useRef, useState } from "react";
import { ChannelConfig } from "../types";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";

interface FileImportProps {
  onImportChannels: (newChannels: ChannelConfig[]) => void;
}

export const FileImport: React.FC<FileImportProps> = ({ onImportChannels }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importedMessage, setImportedMessage] = useState<string | null>(null);

  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      try {
        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            const formatted: ChannelConfig[] = parsed.map((item, idx) => ({
              id: "imp-" + Date.now() + "-" + idx,
              channelId: String(item.channelId || item.id || "").trim(),
              customDelay: Number(item.customDelay || item.delay || 60),
              unit: (item.unit as "Detik" | "Menit" | "Jam") || "Detik",
              customMessage: String(item.customMessage || item.message || ""),
              active: true,
            }));
            onImportChannels(formatted);
            setImportedMessage(`Berhasil mengimpor ${formatted.length} channel dari JSON.`);
            return;
          }
        }

        // Process TXT file lines formatted as IDCHANNEL|DELAY or IDCHANNEL|DELAY|MESSAGE
        const lines = content.split("\n");
        const channels: ChannelConfig[] = [];

        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return;

          const parts = trimmed.split("|");
          const chId = parts[0]?.trim();
          if (!chId) return;

          const delay = parseInt(parts[1]?.trim(), 10) || 60;
          const msg = parts[2]?.trim() || "";

          channels.push({
            id: "imp-txt-" + Date.now() + "-" + idx,
            channelId: chId,
            customDelay: delay,
            unit: "Detik",
            customMessage: msg,
            active: true,
          });
        });

        if (channels.length > 0) {
          onImportChannels(channels);
          setImportedMessage(`Berhasil mengimpor ${channels.length} channel dari TXT.`);
        } else {
          setImportedMessage("Tidak ada format channel valid yang ditemukan pada file.");
        }
      } catch (err) {
        console.error(err);
        setImportedMessage("Format file tidak valid!");
      }
    };

    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2.5 mb-4">
        <FileText className="w-5 h-5 text-blue-400" />
        <h2 className="text-base font-bold text-white tracking-wide">
          Import dari File
        </h2>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
          dragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-slate-800 hover:border-slate-700 bg-[#0d1322]/60 hover:bg-[#0d1322]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.json"
          onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-sm font-semibold text-slate-200">
          Klik atau seret file <span className="text-blue-400">.txt</span> atau <span className="text-blue-400">.json</span> ke sini
        </p>

        <p className="text-xs text-slate-400 mt-1 font-mono">
          Format .txt: IDCHANNEL|DELAY|PESAN (Contoh: 123456789|60)
        </p>
      </div>

      {importedMessage && (
        <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{importedMessage}</span>
        </div>
      )}
    </div>
  );
};
