"use client";

import React, { useMemo, useState } from "react";
import { debounce } from "@/app/utils/helper";
import { ROLES } from "@/app/constants/constant";
import {
  BiSearch,
  BiFilter,
  BiX,
  BiUser,
  BiCheckCircle,
  BiTime,
  BiBlock,
  BiLock,
} from "react-icons/bi";
import { FilterState } from "@/app/types/user";

const STATUS_OPTIONS = [
  { label: "All Status", value: "", icon: <BiUser />, color: "text-slate-400" },
  {
    label: "Active",
    value: "active",
    icon: <BiCheckCircle />,
    color: "text-green-500",
  },
  {
    label: "Inactive",
    value: "inactive",
    icon: <BiBlock />,
    color: "text-slate-400",
  },
  {
    label: "Pending",
    value: "pending",
    icon: <BiTime />,
    color: "text-amber-500",
  },
  {
    label: "Suspended",
    value: "suspended",
    icon: <BiLock />,
    color: "text-red-500",
  },
] as const;

interface TeamMemberFiltersProps {
  filter: FilterState & { role?: string };
  onFilterChange: (value: { search: string; status: string; role: string }) => void;
}

export default function TeamMemberFilters({
  filter,
  onFilterChange,
}: TeamMemberFiltersProps) {
  const [searchInput, setSearchInput] = useState(filter.search);
  const [status, setStatus] = useState(filter.status);
  const [role, setRole] = useState(filter.role || "all");

  // ---------------- Debounced handler ----------------
  const debouncedFilter = useMemo(
    () =>
      debounce((payload: { search: string; status: string; role: string }) => {
        onFilterChange(payload);
      }, 500),
    [onFilterChange]
  );

  // ---------------- Handlers ----------------
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedFilter({ search: value, status, role });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    onFilterChange({ search: "", status, role });
  };

  const handleStatusChange = (statusValue: string) => {
    setStatus(statusValue);
    onFilterChange({ search: searchInput, status: statusValue, role });
  };

  const handleRoleChange = (roleValue: string) => {
    setRole(roleValue);
    onFilterChange({ search: searchInput, status, role: roleValue });
  };

  // ---------------- Render ----------------
  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        {/* SEARCH */}
        <div className="w-full xl:max-w-md">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BiSearch
                className="text-slate-400 group-focus-within:text-primary transition-colors"
                size={20}
              />
            </div>

            <input
              className="block w-full h-11 pl-10 pr-9 bg-white dark:bg-[#111722]
                         border border-slate-200 dark:border-[#232f48]
                         rounded-lg text-slate-900 dark:text-white
                         placeholder-slate-400 dark:placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                         transition-all text-sm"
              placeholder="Search by name, email, phone, or user ID..."
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
            />

            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Clear search"
              >
                <BiX
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  size={18}
                />
              </button>
            )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* STATUS FILTER */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 h-10 px-3.5 bg-white dark:bg-[#111722]
                         hover:bg-slate-50 dark:hover:bg-[#232f48]
                         border border-slate-200 dark:border-[#232f48]
                         rounded-lg transition-colors"
            >
              <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                Status:{" "}
                <span className="text-slate-900 dark:text-white">
                  {STATUS_OPTIONS.find((opt) => opt.value === status)?.label ||
                    "All Status"}
                </span>
              </span>
              <BiFilter className="text-slate-400" size={18} />
            </button>

            {/* DROPDOWN */}
            <div
              className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-[#111722]
                            border border-slate-200 dark:border-[#232f48]
                            rounded-xl shadow-lg opacity-0 invisible
                            group-hover:opacity-100 group-hover:visible
                            transition-all z-20 overflow-hidden"
            >
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm
                    hover:bg-slate-50 dark:hover:bg-[#232f48]
                    transition-colors flex items-center gap-2
                    ${
                      status === option.value
                        ? "text-primary bg-primary/10"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <span className={`text-lg ${option.color}`}>
                    {option.icon}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* ROLE FILTER */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 h-10 px-3.5 bg-white dark:bg-[#111722]
                         hover:bg-slate-50 dark:hover:bg-[#232f48]
                         border border-slate-200 dark:border-[#232f48]
                         rounded-lg transition-colors"
            >
              <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                Role:{" "}
                <span className="text-slate-900 dark:text-white capitalize">
                  {role === "all" ? "All Roles" : role.replace("_", " ")}
                </span>
              </span>
              <BiFilter className="text-slate-400" size={18} />
            </button>

            <div
              className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-[#111722]
                            border border-slate-200 dark:border-[#232f48]
                            rounded-xl shadow-lg opacity-0 invisible
                            group-hover:opacity-100 group-hover:visible
                            transition-all z-20 overflow-hidden"
            >
              <button
                onClick={() => handleRoleChange("all")}
                className={`w-full text-left px-4 py-2.5 text-sm
                  hover:bg-slate-50 dark:hover:bg-[#232f48]
                  transition-colors flex items-center gap-2
                  ${role === "all" ? "text-primary bg-primary/10 font-bold" : "text-slate-700 dark:text-slate-300"}`}
              >
                All Roles
              </button>
              {ROLES.map((roleOption) => (
                <button
                  key={roleOption}
                  onClick={() => handleRoleChange(roleOption)}
                  className={`w-full text-left px-4 py-2.5 text-sm capitalize
                    hover:bg-slate-50 dark:hover:bg-[#232f48]
                    transition-colors flex items-center gap-2
                    ${
                      role === roleOption
                        ? "text-primary bg-primary/10 font-bold"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                >
                  {roleOption.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
