import React from "react";
import { LayoutDashboard, Radio, LogOut, ShieldCheck, Users } from "lucide-react";
import { UserProfile } from "../types";

interface SidebarProps {
  user: UserProfile;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  onLogout,
  activeTab,
  setActiveTab,
}) => {
  const isAdmin =
    user.role === "admin" ||
    user.username.toLowerCase() === "admin" ||
    user.username.toLowerCase() === "azva";

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      <div>
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-white tracking-wide text-base flex items-center gap-1.5">
              Autopost
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              SERVER DASHBOARD
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeTab === "users"
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Manajemen User</span>
              <span className="ml-auto px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[9px] font-bold rounded uppercase">
                ADMIN
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0a0e19]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a0e19] rounded-full" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200 leading-tight flex items-center gap-1.5">
                <span>{user.displayName}</span>
                {isAdmin && (
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" title="Administrator" />
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Keluar / Logout"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
