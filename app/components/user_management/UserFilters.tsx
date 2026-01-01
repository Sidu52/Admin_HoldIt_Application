"use client";
import { useMemo, useState } from "react";
import { FilterState } from "@/app/types/usermanager";
import { BiLock, BiSearch } from "react-icons/bi";
import { CgCheck, CgUnblock } from "react-icons/cg";
import { GrGroup, GrSchedule } from "react-icons/gr";
import { updateFilter } from "@/app/store/slices/usersSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { debounce } from "@/app/utils/helper";

const STATUS_BUTTONS = [
  { label: "All Users", value: "", icon: <GrGroup />, active: true, color: "" },
  {
    label: "Active",
    value: "active",
    icon: <CgCheck />,
    color: "text-green-500",
  },
  {
    label: "Pending",
    value: "pending",
    icon: <GrSchedule />,
    color: "text-amber-500",
  },
  {
    label: "Blocked",
    value: "blocked",
    icon: <BiLock />,
    color: "text-red-500",
  },
  {
    label: "Inactive",
    value: "inactive",
    icon: <CgUnblock />,
    color: "text-red-200",
  },
] as const;

export default function UserFilters() {
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.users);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        dispatch(updateFilter({ search: value }));
      }, 500),
    [dispatch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleStatusChange = (status: FilterState["status"]) => {
    dispatch(updateFilter({ status }));
  };

  const clearFilters = () => {
    dispatch(updateFilter({ status: "", search: "" }));
  };

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-[#232f48]">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">
              <BiSearch fontSize={"20px"} />
            </span>
          </div>
          <input
            className="w-full h-12 pl-11 pr-4 rounded-lg bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-[#324467] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Search by name, email, or user ID..."
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Status Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#232f48]">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-2">
          Status:
        </span>

        {STATUS_BUTTONS.map(({ label, value, icon, color }) => (
          <button
            key={label}
            onClick={() => handleStatusChange(value)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === value || (value === "" && status === "")
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-slate-100 dark:bg-[#232f48] text-slate-600 dark:text-slate-300 border border-transparent hover:bg-slate-200 dark:hover:bg-[#324467]"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                color || "text-primary"
              }`}
            >
              {icon}
            </span>
            <span>{label}</span>
          </button>
        ))}

        <div className="flex-1"></div>

        <button
          onClick={clearFilters}
          className="text-sm text-slate-500 hover:text-primary underline decoration-dotted underline-offset-4"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
