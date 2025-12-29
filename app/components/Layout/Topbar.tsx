"use client";

import { useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaBell,
  FaCog,
  FaUser,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { RiAdminFill, RiMenuLine } from "react-icons/ri";

interface TopbarProps {
  onMenuClick: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: {
    name: string;
    avatar: string;
  };
}

export default function Topbar({
  onMenuClick,
  isDarkMode,
  onToggleDarkMode,
  user,
}: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateNew = () => {
    // Implement create new logic
    console.log("Create new clicked");
  };

  return (
    <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722]">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <RiAdminFill className="text-primary text-xl" />
        <span className="font-bold text-slate-900 dark:text-white">Holdit</span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search Bar (Hidden on mobile) */}
        <div className="hidden sm:block relative">
          <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-sm" />
          <input
            className="h-9 pl-9 pr-4 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white w-48 placeholder-slate-400"
            placeholder="Search..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? (
            <FaSun className="text-amber-500" />
          ) : (
            <FaMoon className="text-slate-600 dark:text-slate-400" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <FaBell className="text-slate-600 dark:text-slate-400" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <FaCog className="text-slate-600 dark:text-slate-400" />
        </button>

        {/* User Profile (Mobile) */}
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-800"
            style={{ backgroundImage: `url(${user.avatar})` }}
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RiMenuLine className="text-xl" />
        </button>
      </div>
    </div>
  );
}
