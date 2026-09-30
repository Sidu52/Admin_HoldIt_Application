"use client";

import React, { useMemo, useState } from "react";
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
  BiShieldQuarter,
} from "react-icons/bi";
import { ROLES, VERIFICATION_STATUS } from "@/app/enum";

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

const VERIFICATION_OPTIONS = [
  { label: "All Verification", value: "", icon: <BiShieldQuarter />, color: "text-slate-400" },
  {
    label: "Verified",
    value: VERIFICATION_STATUS.VERIFIED,
    icon: <BiCheckCircle />,
    color: "text-emerald-500",
  },
  {
    label: "Pending Verification",
    value: VERIFICATION_STATUS.PENDING,
    icon: <BiTime />,
    color: "text-amber-500",
  },
  {
    label: "Rejected",
    value: VERIFICATION_STATUS.REJECTED,
    icon: <BiBlock />,
    color: "text-rose-500",
  },
] as const;

interface TeamMemberFiltersProps {
  filter: {
    search: string;
    account_status: string;
    verification_status?: string;
    role?: string;
  };
  onFilterChange: (value: {
    search: string;
    account_status: string;
    verification_status: string;
    role: string;
  }) => void;
}

export default function TeamMemberFilters({
  filter,
  onFilterChange,
}: TeamMemberFiltersProps) {
  const [searchInput, setSearchInput] = useState(filter.search);
  const [status, setStatus] = useState(filter.account_status || "");
  const [verificationStatus, setVerificationStatus] = useState(filter.verification_status || "");
  const [role, setRole] = useState(filter.role || "all");

  // ---------------- Debounced handler ----------------
  const debouncedFilter = useMemo(
    () =>
      debounce(
        (payload: {
          search: string;
          account_status: string;
          verification_status: string;
          role: string;
        }) => {
          onFilterChange(payload);
        },
        500
      ),
    [onFilterChange]
  );

  // ---------------- Handlers ----------------
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedFilter({
      search: value,
      account_status: status,
      verification_status: verificationStatus,
      role,
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    onFilterChange({
      search: "",
      account_status: status,
      verification_status: verificationStatus,
      role,
    });
  };

  const handleStatusChange = (statusValue: string) => {
    setStatus(statusValue);
    onFilterChange({
      search: searchInput,
      account_status: statusValue,
      verification_status: verificationStatus,
      role,
    });
  };

  const handleVerificationChange = (verifValue: string) => {
    setVerificationStatus(verifValue);
    onFilterChange({
      search: searchInput,
      account_status: status,
      verification_status: verifValue,
      role,
    });
  };

  const handleRoleChange = (roleValue: string) => {
    setRole(roleValue);
    onFilterChange({
      search: searchInput,
      account_status: status,
      verification_status: verificationStatus,
      role: roleValue,
    });
  };

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
              className="block w-full h-10 pl-10 pr-9 bg-white dark:bg-[#111722]
                         border border-slate-200 dark:border-[#232f48]
                         rounded-xl text-slate-900 dark:text-white
                         placeholder-slate-400 dark:placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                         transition-all text-xs"
              placeholder="Search by name, email, phone, or member ID..."
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
            />

            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
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
        <div className="flex flex-wrap items-center gap-2.5">
          {/* STATUS FILTER */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 h-10 px-3.5 bg-white dark:bg-[#111722]
                         hover:bg-slate-50 dark:hover:bg-[#232f48]
                         border border-slate-200 dark:border-[#232f48]
                         rounded-xl transition-colors cursor-pointer"
            >
              <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                Status:{" "}
                <span className="text-slate-900 dark:text-white font-bold">
                  {STATUS_OPTIONS.find((opt) => opt.value === status)?.label ||
                    "All Status"}
                </span>
              </span>
              <BiFilter className="text-slate-400" size={16} />
            </button>

            {/* DROPDOWN */}
            <div
              className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-[#111722]
                            border border-slate-200 dark:border-[#232f48]
                            rounded-xl shadow-lg opacity-0 invisible
                            group-hover:opacity-100 group-hover:visible
                            transition-all z-30 overflow-hidden"
            >
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`w-full text-left px-4 py-2 text-xs
                    hover:bg-slate-50 dark:hover:bg-[#232f48]
                    transition-colors flex items-center gap-2 cursor-pointer
                    ${status === option.value
                      ? "text-primary bg-primary/10 font-bold"
                      : "text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <span className={`text-base ${option.color}`}>
                    {option.icon}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* VERIFICATION STATUS FILTER */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 h-10 px-3.5 bg-white dark:bg-[#111722]
                         hover:bg-slate-50 dark:hover:bg-[#232f48]
                         border border-slate-200 dark:border-[#232f48]
                         rounded-xl transition-colors cursor-pointer"
            >
              <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                Verification:{" "}
                <span className="text-slate-900 dark:text-white font-bold">
                  {VERIFICATION_OPTIONS.find((opt) => opt.value === verificationStatus)?.label ||
                    "All Verification"}
                </span>
              </span>
              <BiFilter className="text-slate-400" size={16} />
            </button>

            {/* DROPDOWN */}
            <div
              className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#111722]
                            border border-slate-200 dark:border-[#232f48]
                            rounded-xl shadow-lg opacity-0 invisible
                            group-hover:opacity-100 group-hover:visible
                            transition-all z-30 overflow-hidden"
            >
              {VERIFICATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleVerificationChange(option.value)}
                  className={`w-full text-left px-4 py-2 text-xs
                    hover:bg-slate-50 dark:hover:bg-[#232f48]
                    transition-colors flex items-center gap-2 cursor-pointer
                    ${verificationStatus === option.value
                      ? "text-primary bg-primary/10 font-bold"
                      : "text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <span className={`text-base ${option.color}`}>
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
                         rounded-xl transition-colors cursor-pointer"
            >
              <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                Role:{" "}
                <span className="text-slate-900 dark:text-white font-bold capitalize">
                  {role === "all" ? "All Roles" : role.replace(/_/g, " ")}
                </span>
              </span>
              <BiFilter className="text-slate-400" size={16} />
            </button>

            <div
              className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-[#111722]
                            border border-slate-200 dark:border-[#232f48]
                            rounded-xl shadow-lg opacity-0 invisible
                            group-hover:opacity-100 group-hover:visible
                            transition-all z-30 overflow-hidden"
            >
              <button
                onClick={() => handleRoleChange("all")}
                className={`w-full text-left px-4 py-2 text-xs cursor-pointer
                  hover:bg-slate-50 dark:hover:bg-[#232f48]
                  transition-colors flex items-center gap-2
                  ${role === "all" ? "text-primary bg-primary/10 font-bold" : "text-slate-700 dark:text-slate-300"}`}
              >
                All Roles
              </button>
              {Object.values(ROLES).map((roleOption) => (
                <button
                  key={roleOption}
                  onClick={() => handleRoleChange(roleOption)}
                  className={`w-full text-left px-4 py-2 text-xs capitalize cursor-pointer
                    hover:bg-slate-50 dark:hover:bg-[#232f48]
                    transition-colors flex items-center gap-2
                    ${role === roleOption
                      ? "text-primary bg-primary/10 font-bold"
                      : "text-slate-700 dark:text-slate-300"
                    }`}
                >
                  {roleOption.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
