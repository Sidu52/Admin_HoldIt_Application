"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks/useUserStore";
import {
  updateFilter,
  clearFilters,
} from "@/app/store/slices/userSlice";
import { debounce } from "@/app/utils/helper";
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

const STATUS_OPTIONS = [
  { label: "All Status", value: "", icon: <BiUser />, color: "text-slate-500" },
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

export default function UserFilters({
  onSearch,
  onFilterChange,
}: {
  onSearch: (value: string) => void;
  onFilterChange: (value: any) => void;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.user);
  const { status, search } = filters;

  // Sync local search input with Redux state
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        onFilterChange(value);
      }, 500),
    [dispatch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleStatusChange = (statusValue: string) => {
    dispatch(updateFilter({ status: statusValue }));
  };

  const handleClearAll = () => {
    dispatch(clearFilters());
    setSearchInput("");
  };

  const hasActiveFilters = status || search;

  return (
    <div className="flex flex-col gap-4 px-6 pb-4">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        {/* Search */}
        <div className="w-full xl:max-w-md">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BiSearch
                className="text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors"
                size={20}
              />
            </div>
            <input
              className="block w-full h-11 pl-10 pr-4 bg-white dark:bg-[#111722] border border-slate-200 dark:border-[#232f48] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
              placeholder="Search by name, email, phone, or user ID..."
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  dispatch(updateFilter({ search: "" }));
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <BiX
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  size={18}
                />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 h-9 px-3.5 bg-white dark:bg-[#111722] hover:bg-slate-50 dark:hover:bg-[#232f48] border border-slate-200 dark:border-[#232f48] rounded-lg transition-colors">
              <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                Status:{" "}
                <span className="text-slate-900 dark:text-white">
                  {STATUS_OPTIONS.find((opt) => opt.value === status)?.label ||
                    "All"}
                </span>
              </span>
              <BiFilter className="text-slate-400" size={18} />
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#111722] border border-slate-200 dark:border-[#232f48] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-[#232f48] transition-colors flex items-center gap-2 ${
                    status === option.value
                      ? "text-primary bg-primary/10"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className={`text-[18px] ${option.color}`}>
                    {option.icon}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 dark:bg-[#232f48] mx-1"></div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 h-9 px-3.5 bg-white dark:bg-[#111722] hover:bg-slate-50 dark:hover:bg-[#232f48] border border-slate-200 dark:border-[#232f48] rounded-lg transition-colors"
          >
            <BiFilter className="text-slate-400" size={18} />
            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
              Advanced
            </span>
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 h-9 px-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-sm font-medium rounded-lg transition-colors"
            >
              <BiX size={18} />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-[#232f48] rounded-lg p-4 mt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Advanced Filters
            </h3>
            <button
              onClick={() => setShowAdvancedFilters(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <BiX size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Verification Status */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Email Verified
              </label>
              <select className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#232f48] border border-slate-200 dark:border-[#324467] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>

            {/* Last Login */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Last Login
              </label>
              <select className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#232f48] border border-slate-200 dark:border-[#324467] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Any time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="90">Last 90 days</option>
                <option value="never">Never logged in</option>
              </select>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Created Date
              </label>
              <input
                type="date"
                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#232f48] border border-slate-200 dark:border-[#324467] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
              />
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Sort By
              </label>
              <select className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#232f48] border border-slate-200 dark:border-[#324467] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="created_at:desc">Newest First</option>
                <option value="created_at:asc">Oldest First</option>
                <option value="last_name:asc">Name (A-Z)</option>
                <option value="last_name:desc">Name (Z-A)</option>
                <option value="last_login:desc">Recently Active</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#232f48]">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Active Filters:
          </span>

          {status && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              Status:{" "}
              {STATUS_OPTIONS.find((opt) => opt.value === status)?.label}
              <button
                onClick={() => handleStatusChange("")}
                className="ml-1 hover:text-primary-dark"
              >
                <BiX size={14} />
              </button>
            </span>
          )}

          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full">
              Search: "{search}"
              <button
                onClick={() => {
                  setSearchInput("");
                  dispatch(updateFilter({ search: "" }));
                }}
                className="ml-1 hover:text-amber-600"
              >
                <BiX size={14} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
