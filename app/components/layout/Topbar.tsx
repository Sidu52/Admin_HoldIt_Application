"use client";

import { RiMenu4Line } from "react-icons/ri";
import { useSocketContext } from "@/app/providers/SocketProvider";
import ProfileDropdown from "./ProfileDropdown";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface TopbarProps {
  onMenuClick: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Topbar({
  onMenuClick,
  isDarkMode,
  onToggleDarkMode,
}: TopbarProps) {
  const { isConnected } = useSocketContext();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-8 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0b0f1a]/80 backdrop-blur-md">
      {/* Left Section: Context / Search */}
      <div className="flex items-center gap-8 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-background-dark rounded-xl transition-all"
        >
          <RiMenu4Line className="text-2xl" />
        </button>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              {isConnected ? 'System Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-4">
        {/* User Profile */}
        {user && <ProfileDropdown profile={user} />}
      </div>
    </header>
  );
}
