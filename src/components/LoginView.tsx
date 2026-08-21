import React, { useState, useEffect } from "react";
import { Lock, User, LogIn, AlertCircle, ShieldAlert, Users } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (user: { username: string; displayName: string }) => void;
  idleNotice?: string | null;
}

interface UserItem {
  username: string;
  displayName: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, idleNotice }) => {
  const [username, setUsername] = useState("Azva");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState<UserItem[]>([]);

  // Fetch available accounts for quick selection
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.users) {
          setUserList(data.users);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || "Gagal memproses login.");
      }
    } catch {
      setError("Gagal terhubung ke server login.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (u: UserItem) => {
    setUsername(u.username);
    setPassword("123");
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md bg-[#131b2e] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Background glow accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/10 border border-blue-500/20 rounded-2xl mb-4 text-blue-400">
            <LogIn className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Login Autopost</h1>
          <p className="text-slate-400 text-sm mt-1">Sistem Multi-User Dashboard Discord Autopost</p>
        </div>

        {/* 30-Minute Idle Timeout Alert Banner */}
        {idleNotice && (
          <div className="mb-6 p-4 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-start gap-3 text-amber-300 text-xs font-semibold animate-pulse">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-200 uppercase tracking-wider mb-0.5">
                Keamanan Sesi Expired (Auto-Logout 30 Mins)
              </div>
              <div>{idleNotice}</div>
            </div>
          </div>
        )}

        {/* Administrator Notice */}
        <div className="mb-6 p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-2.5 text-blue-300 text-xs">
          <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            <strong>Akses Multi-User Terproteksi:</strong> Penambahan pengguna baru hanya dapat dilakukan oleh <strong>Administrator</strong> melalui menu dashboard.
          </span>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-xs">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan Username"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm mt-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        {/* Quick Multi-User Accounts Section */}
        {userList.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Pilih Akun Terdaftar (Multi-User):
            </div>
            <div className="flex flex-wrap gap-2">
              {userList.map((u) => (
                <button
                  key={u.username}
                  type="button"
                  onClick={() => handleQuickSelect(u)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    username.toLowerCase() === u.username.toLowerCase()
                      ? "bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold"
                      : "bg-[#0d1322] border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{u.displayName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({u.username})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          Discord Autopost Dashboard v2.5 • Multi-User & Auto-Logout Security
        </div>
      </div>
    </div>
  );
};

