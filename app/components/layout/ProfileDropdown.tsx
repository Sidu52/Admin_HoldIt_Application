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
import { RiArrowDownSLine } from "react-icons/ri";

const ProfileDropdown = ({ profile }: { profile: any }) => {
  const { logout, logoutLoading, logoutSuccess } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getInitials = (firstName: string, lastName: string, fullName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (fullName) {
      const parts = fullName.split(" ");
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return parts[0].charAt(0).toUpperCase();
    }
    return "U";
  };

  const firstName = profile.first_name || profile.name?.split(" ")[0] || "";
  const lastName = profile.last_name || profile.name?.split(" ")[1] || "";
  const fullName = profile.name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User";

  const initials = getInitials(profile.first_name, profile.last_name, profile.name);

  const lastLogin = profile?.last_login_at
    ? parseTimestamp(profile.last_login_at)
    : null;

  const lastLoginText = lastLogin
    ? `${lastLogin.dayName}, ${lastLogin.time12}`
    : "Not available";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (logoutSuccess) setIsOpen(false);
  }, [logoutSuccess]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-background-light dark:hover:bg-background-dark transition-all duration-300 group"
      >
        <div className="h-10 w-10 shrink-0 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark leading-none mb-1">
            {fullName}
          </span>
          <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-widest leading-none">
            {profile.role?.replaceAll("_", " ")}
          </span>
        </div>
        <RiArrowDownSLine className={`text-xl text-text-muted-light transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 top-full mt-3 w-72 rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] shadow-premium overflow-hidden transition-all duration-300 transform origin-top-right ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-base font-bold text-text-main-light dark:text-text-main-dark truncate leading-tight">
                {fullName}
              </h3>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
                {profile.role?.replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="p-3">
          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-background-light dark:hover:bg-background-dark transition-colors group">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FaEnvelope />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-widest">Email Address</span>
              <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark truncate">{profile.email}</span>
            </div>
          </div>

          <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-background-light dark:hover:bg-background-dark transition-colors group">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FaUser />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-widest">My Account</span>
              <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark">View Profile</span>
            </div>
          </button>

          <div className="h-px bg-slate-100 dark:bg-white/5 my-2 mx-3"></div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-rose-500/10 text-text-muted-light dark:text-text-muted-dark hover:text-rose-600 transition-colors group"
          >
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <FaSignOutAlt />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest">Session</span>
              <span className="text-sm font-bold">Logout Account</span>
            </div>
          </button>
        </div>

        {/* Last Login */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
          <p className="text-[10px] font-bold text-text-muted-light uppercase tracking-widest text-center">
            Last Login: <span className="text-text-main-light dark:text-text-main-dark">{lastLoginText}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
