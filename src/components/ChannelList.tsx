import React, { useState } from "react";
import { ChannelConfig } from "../types";
import {
  ListFilter,
  Plus,
  Trash2,
  Send,
  GripVertical,
  CheckSquare,
  Square,
  Power,
  PowerOff,
  Layers,
} from "lucide-react";

interface ChannelListProps {
  channels: ChannelConfig[];
  setChannels: React.Dispatch<React.SetStateAction<ChannelConfig[]>>;
  onTestSendChannel: (channel: ChannelConfig) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  setChannels,
  onTestSendChannel,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Toggle single selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === channels.length && channels.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(channels.map((c) => c.id));
    }
  };

  // Bulk enable
  const handleBulkEnable = () => {
    if (selectedIds.length === 0) return;
    setChannels((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, active: true } : c))
    );
  };

  // Bulk disable
  const handleBulkDisable = () => {
    if (selectedIds.length === 0) return;
    setChannels((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, active: false } : c))
    );
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedIds.length} channel yang dipilih?`
      )
    ) {
      setChannels((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    }
  };

  const addChannel = () => {
    const newCh: ChannelConfig = {
      id: "ch-" + Date.now(),
      channelId: "",
      customDelay: 60,
      unit: "Detik",
      customMessage: "",
      active: true,
    };
    setChannels([...channels, newCh]);
  };

  const removeChannel = (id: string) => {
    setChannels(channels.filter((c) => c.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const updateChannel = (
    id: string,
    field: keyof ChannelConfig,
    value: string | number | boolean
  ) => {
    setChannels(
      channels.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const allSelected =
    channels.length > 0 && selectedIds.length === channels.length;
  const isSomeSelected = selectedIds.length > 0;

  return (
    <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 mb-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          <ListFilter className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Daftar Channel
          </h2>
          <span className="px-2.5 py-0.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-full text-xs font-semibold">
            {channels.length} Total
          </span>
          <span className="px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold">
            {channels.filter((c) => c.active !== false).length} Aktif
          </span>
        </div>

        <button
          onClick={addChannel}
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Channel</span>
        </button>
      </div>

      {/* Bulk Action Menu Bar */}
      {channels.length > 0 && (
        <div className="mb-5 p-3.5 bg-[#0d1322] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer select-none"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>
                {allSelected
                  ? "Batal Pilih Semua"
                  : `Pilih Semua (${channels.length})`}
              </span>
            </button>

            {isSomeSelected && (
              <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                {selectedIds.length} terpilih
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Aksi Massal:
            </span>

            <button
              type="button"
              onClick={handleBulkEnable}
              disabled={!isSomeSelected}
              title="Aktifkan Channel Terpilih"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Power className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aktifkan</span>
            </button>

            <button
              type="button"
              onClick={handleBulkDisable}
              disabled={!isSomeSelected}
              title="Nonaktifkan Channel Terpilih"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PowerOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Nonaktifkan</span>
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={!isSomeSelected}
              title="Hapus Channel Terpilih"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      )}

      {/* Channel Cards */}
      {channels.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-800/80 rounded-xl bg-[#0d1322]/50 text-slate-400 text-sm">
          Belum ada channel yang ditambahkan. Klik tombol <strong>+ Tambah Channel</strong> di atas.
        </div>
      ) : (
        <div className="space-y-4">
          {channels.map((ch, index) => {
            const isSelected = selectedIds.includes(ch.id);
            const isActive = ch.active !== false;

            return (
              <div
                key={ch.id}
                className={`bg-[#0d1322] border rounded-xl p-4 transition relative group ${
                  isSelected
                    ? "border-blue-500/60 shadow-lg shadow-blue-500/5 bg-[#0f172a]"
                    : "border-slate-800/80 hover:border-slate-700"
                } ${!isActive ? "opacity-75" : ""}`}
              >
                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                  {/* Select Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(ch.id)}
                    className="p-0.5 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                    title={isSelected ? "Batal pilih" : "Pilih channel"}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                    )}
                  </button>

                  <GripVertical className="w-4 h-4 text-slate-600 cursor-grab shrink-0" />

                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    CHANNEL {index + 1}
                  </span>

                  {/* Active/Inactive Badge & Toggle */}
                  <button
                    type="button"
                    onClick={() => updateChannel(ch.id, "active", !isActive)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 border transition cursor-pointer ${
                      isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                    title="Klik untuk mengubah status aktif/nonaktif"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                      }`}
                    />
                    <span>{isActive ? "AKTIF" : "NONAKTIF"}</span>
                  </button>

                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onTestSendChannel(ch)}
                      title="Tes Kirim Pesan ke Channel Ini"
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Tes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeChannel(ch.id)}
                      title="Hapus Channel"
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Channel ID */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      ID CHANNEL DISCORD
                    </label>
                    <input
                      type="text"
                      value={ch.channelId}
                      onChange={(e) =>
                        updateChannel(ch.id, "channelId", e.target.value)
                      }
                      placeholder="Contoh: 123456789012345678"
                      className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-mono"
                    />
                  </div>

                  {/* Custom Delay */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      CUSTOM DELAY
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={5}
                        value={ch.customDelay}
                        onChange={(e) =>
                          updateChannel(
                            ch.id,
                            "customDelay",
                            Number(e.target.value)
                          )
                        }
                        className="w-1/2 px-3 py-2.5 bg-[#131b2e] border border-slate-700/80 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                      />
                      <select
                        value={ch.unit}
                        onChange={(e) =>
                          updateChannel(
                            ch.id,
                            "unit",
                            e.target.value as "Detik" | "Menit" | "Jam"
                          )
                        }
                        className="w-1/2 px-2.5 py-2.5 bg-[#131b2e] border border-slate-700/80 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Detik">Detik</option>
                        <option value="Menit">Menit</option>
                        <option value="Jam">Jam</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Message (Optional) */}
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      CUSTOM MESSAGE (OPTIONAL)
                    </label>
                    <textarea
                      rows={2}
                      value={ch.customMessage || ""}
                      onChange={(e) =>
                        updateChannel(ch.id, "customMessage", e.target.value)
                      }
                      placeholder="Kosongkan jika ingin menggunakan Pesan Utama di atas..."
                      className="w-full px-3.5 py-2 bg-[#131b2e] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
