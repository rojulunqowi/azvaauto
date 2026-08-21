import React, { useState } from "react";
import { Send, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface TestSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  defaultToken: string;
  defaultChannelId?: string;
  defaultMessage: string;
  defaultModeKirim: string;
}

export const TestSendModal: React.FC<TestSendModalProps> = ({
  isOpen,
  onClose,
  username = "azva",
  defaultToken,
  defaultChannelId = "",
  defaultMessage,
  defaultModeKirim,
}) => {
  const [token, setToken] = useState(defaultToken);
  const [channelId, setChannelId] = useState(defaultChannelId);
  const [message, setMessage] = useState(defaultMessage);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/bot/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          token,
          channelId,
          message,
          modeKirim: defaultModeKirim,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: "success", text: data.message });
      } else {
        setFeedback({ type: "error", text: data.message || "Gagal mengirim tes pesan." });
      }
    } catch {
      setFeedback({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Tes Kirim Pesan Discord</h3>
            <p className="text-xs text-slate-400">Uji coba pengiriman pesan instant ke channel</p>
          </div>
        </div>

        {feedback && (
          <div
            className={`mb-4 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleTestSend} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              DISCORD TOKEN
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token Discord..."
              required
              className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ID CHANNEL DISCORD
            </label>
            <input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="Contoh: 123456789012345678"
              required
              className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              PESAN YANG INGIN DIKIRIM
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Isi pesan tes..."
              required
              className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pesan Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
