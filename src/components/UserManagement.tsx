import React, { useState, useEffect } from "react";
import { UserProfile, UserAccountItem } from "../types";
import {
  Users,
  UserPlus,
  ShieldCheck,
  User,
  Trash2,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Key,
} from "lucide-react";

interface UserManagementProps {
  currentUser: UserProfile;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  currentUser,
}) => {
  const [userList, setUserList] = useState<UserAccountItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUserList(data.users);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newUsername.trim() || !newPassword.trim()) {
      setErrorMsg("Username dan Password wajib diisi!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUsername: currentUser.username,
          username: newUsername.trim(),
          displayName: displayName.trim() || newUsername.trim(),
          password: newPassword.trim(),
          role: newRole,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(
          data.message || `User '${newUsername}' berhasil ditambahkan!`
        );
        setNewUsername("");
        setDisplayName("");
        setNewPassword("");
        setNewRole("user");
        fetchUsers();
      } else {
        setErrorMsg(data.message || "Gagal menambahkan user baru.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (targetUsername: string) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus user '${targetUsername}'? Bot dan konfigurasi user tersebut akan dihentikan.`
      )
    ) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUsername: currentUser.username,
          targetUsername,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || `User '${targetUsername}' berhasil dihapus.`);
        fetchUsers();
      } else {
        setErrorMsg(data.message || "Gagal menghapus user.");
      }
    } catch {
      setErrorMsg("Gagal menghapus user.");
    }
  };

  const isAdmin =
    currentUser.role === "admin" ||
    currentUser.username.toLowerCase() === "admin" ||
    currentUser.username.toLowerCase() === "azva";

  if (!isAdmin) {
    return (
      <div className="p-8 bg-[#131b2e] border border-slate-800 rounded-2xl text-center max-w-2xl mx-auto my-12 shadow-xl">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Akses Terbatas</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Halaman Manajemen Pengguna hanya dapat diakses oleh{" "}
          <strong className="text-blue-400">Administrator</strong>. Anda saat ini masuk
          sebagai user biasa (<span className="font-mono text-white">{currentUser.username}</span>).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Manajemen User Administrator
                </h2>
                <span className="px-2.5 py-0.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sistem kontrol penuh untuk menambah, mengelola, dan menghapus akun pengguna multi-user.
              </p>
            </div>
          </div>

          <div className="px-4 py-2 bg-[#0d1322] border border-slate-800 rounded-xl text-xs text-slate-300 font-medium self-start md:self-auto">
            Logged as Admin: <strong className="text-blue-400">{currentUser.displayName}</strong> ({currentUser.username})
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium text-xs">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium text-xs">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah User Baru */}
        <div className="lg:col-span-1 bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-800">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Tambah Pengguna Baru</h3>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Username (ID Login)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Contoh: user3"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Nama Tampilan / Display Name
              </label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Contoh: Tim Marketing"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan Password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Hak Akses / Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "admin" | "user")}
                className="w-full px-3 py-2.5 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="user">User Biasa (Autopost Only)</option>
                <option value="admin">Administrator (Akses Penuh)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>+ Tambahkan User Sekarang</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* List Registered Users */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Daftar Pengguna Terdaftar</h3>
              <span className="px-2.5 py-0.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-full text-xs font-semibold">
                {userList.length} Total
              </span>
            </div>

            <button
              onClick={fetchUsers}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              Refresh List
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Memuat data pengguna...
            </div>
          ) : userList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Belum ada pengguna terdaftar.
            </div>
          ) : (
            <div className="space-y-3">
              {userList.map((u) => {
                const isUserAdmin = u.role === "admin";
                const isMainAdmin =
                  u.username.toLowerCase() === "admin" ||
                  u.username.toLowerCase() === "azva";
                const isSelf =
                  u.username.toLowerCase() === currentUser.username.toLowerCase();

                return (
                  <div
                    key={u.username}
                    className="p-4 bg-[#0d1322] border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isUserAdmin
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700/50"
                        }`}
                      >
                        {u.displayName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {u.displayName}
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            (@{u.username})
                          </span>

                          {isUserAdmin ? (
                            <span className="px-2 py-0.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              ADMINISTRATOR
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                              USER BIASA
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Akses: {isUserAdmin ? "Full Dashboard & Multi-User" : "Autopost Bot"}</span>
                          {u.createdAt && (
                            <>
                              <span>•</span>
                              <span>Dibuat: {new Date(u.createdAt).toLocaleDateString("id-ID")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete Action */}
                    {!isMainAdmin && !isSelf ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.username)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                        title="Hapus Pengguna"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Hapus</span>
                      </button>
                    ) : (
                      <span
                        className="text-[11px] text-slate-600 font-medium px-2.5 py-1 bg-slate-800/40 rounded-lg border border-slate-800"
                        title="Akun Administrator utama/aktif tidak dapat dihapus"
                      >
                        <Key className="w-3 h-3 inline mr-1 text-amber-500" />
                        Utama
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
