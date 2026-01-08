"use client";

import { useState, useRef, useEffect } from "react";
import {
  FaUser,
  FaSignOutAlt,
  FaEnvelope,
  FaIdBadge,
} from "react-icons/fa";
import { useAuth } from "@/app/hooks/useAuth";
import { parseTimestamp } from "@/app/utils/helper";
import { UserProfile } from "@/app/types/profile";

const ProfileDropdown = ({ profile }: { profile: UserProfile }) => {
  const { logout, logoutLoading, logoutSuccess } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get initials from first and last name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const initials = getInitials(profile.first_name, profile.last_name);

  // Parse last login time
  const lastLogin = profile?.last_login_at
    ? parseTimestamp(profile.last_login_at)
    : null;

  const lastLoginText = lastLogin
    ? `Last login: ${lastLogin.dayName}, ${lastLogin.time12}`
    : "Last login: Not available";

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleViewProfile = () => {
    console.log("View Profile clicked");
    setIsOpen(false);
    // Navigate to profile page
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    if (logoutSuccess) {
      setIsOpen(false);
    }
  }, [logoutSuccess]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onMouseEnter={() => setIsOpen(!isOpen)}
        className="hidden lg:flex items-center justify-center gap-2 rounded-lg transition-all duration-200 hover:shadow-md group"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
      >
        {/* Avatar with Initials */}
        <div className="relative">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-200">
            {initials}
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] shadow-2xl z-50 overflow-hidden transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-2 invisible"
        }`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
      >
        {/* Profile Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1a2332] dark:to-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1e293b] flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {profile.first_name} {profile.last_name}
              </h3>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {/* Email */}
          <div className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <FaEnvelope className="text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Email
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {profile.email}
              </span>
            </div>
          </div>

          {/* Role */}
          <div className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
              <FaIdBadge className="text-purple-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Role
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                {profile.role?.replaceAll("_", " ")}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

          {/* View Profile */}
          <button
            onClick={handleViewProfile}
            className="w-full px-4 py-3 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
            role="menuitem"
          >
            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
              <FaUser className="text-slate-500 group-hover:text-emerald-500 transition-colors" />
            </div>
            <span className="text-sm font-medium">View Profile</span>
          </button>

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 flex items-center cursor-pointer gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group relative"
            role="menuitem"
          >
            <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <FaSignOutAlt className="text-red-500" />
            </div>
            {/* Loading */}
            {logoutLoading}
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {lastLoginText}
          </p>
        </div>
      </div>

      {/* Backdrop for mobile (optional) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default ProfileDropdown;
