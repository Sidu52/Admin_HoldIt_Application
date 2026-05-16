"use client";

import { useState } from "react";
import {
  FaSearch,
  FaBell,
  FaCog,
  FaMoon,
  FaSun,
} from "react-icons/fa";
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
  const [searchQuery, setSearchQuery] = useState("");
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

        {/* Global Search */}
        <div className="hidden lg:flex relative max-w-md w-full group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark group-focus-within:text-primary transition-colors" />
          <input
            className="w-full h-11 pl-12 pr-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-main-light dark:text-text-main-dark placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark"
            placeholder="Search for orders, users or drivers..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-focus-within:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-[10px] font-bold text-text-muted-light">ESC</kbd>
          </div>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Actions */}
        <div className="flex items-center gap-1 pr-4 border-r border-border-light dark:border-border-dark">
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary transition-all"
            title="Toggle Theme"
          >
            {isDarkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
          </button>

          <button className="relative p-2.5 rounded-xl text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary transition-all">
            <FaBell className="text-xl" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full ring-2 ring-surface-light dark:ring-surface-dark"></span>
          </button>

          <button className="p-2.5 rounded-xl text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary transition-all">
            <FaCog className="text-xl" />
          </button>
        </div>

        {/* User Profile */}
        {user && <ProfileDropdown profile={user} />}

        {/* Mobile Search Toggle */}
        <button className="lg:hidden p-2.5 rounded-xl text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-background-dark">
          <FaSearch className="text-xl" />
        </button>
      </div>
    </header>
  );
}
