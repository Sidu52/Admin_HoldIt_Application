// app/components/driver/DriverFilters.tsx
"use client";

import React, { useState } from "react";
import { MdClose, MdDownload, MdFilterAltOff, MdKeyboardArrowDown, MdSearch } from "react-icons/md";

interface FilterState {
  search: string;
  status: string;
  is_online: boolean | null;
  vehicleType: string;
}

interface DriverFiltersProps {
  filters: FilterState;
  onSearch: (value: string) => void;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onClearFilters: () => void;
}

const DriverFilters: React.FC<DriverFiltersProps> = ({
  filters,
  onSearch,
  onFilterChange,
  onClearFilters
}) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = () => {
    onSearch(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
    { value: "suspended", label: "Suspended" },
  ];

  const availabilityOptions = [
    { value: null, label: "All Availability" },
    { value: true, label: "Online" },
    { value: false, label: "Offline" },
  ];

  const vehicleOptions = [
    { value: "", label: "All Vehicles" },
    { value: "Car", label: "Car" },
    { value: "Van", label: "Van" },
    { value: "Truck", label: "Truck" },
    { value: "Scooter", label: "Scooter" },
    { value: "Motorcycle", label: "Motorcycle" },
  ];

  return (
    <div className="px-6 pb-4 shrink-0">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        {/* Search */}
        <div className="w-full xl:max-w-md">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-[#135bec] transition-colors">
                <MdSearch />
              </span>
            </div>
            <input
              className="block w-full h-11 pl-10 pr-4 bg-surface-dark border border-surface-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#135bec]/50 focus:border-[#135bec] transition-all text-sm"
              placeholder="Search by name, email, ID, or license number..."
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              onBlur={handleSearchSubmit}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  onSearch("");
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="material-symbols-outlined text-slate-400 hover:text-white text-[18px]">
                  <MdClose />
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 h-9 px-3.5 bg-surface-dark hover:bg-surface-border border border-surface-border rounded-lg transition-colors">
              <span className="text-slate-300 text-sm font-medium">
                Status:{" "}
                <span className="text-white">
                  {statusOptions.find((opt) => opt.value === filters.status)?.label || "All"}
                </span>
              </span>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                <MdKeyboardArrowDown />
              </span>
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-surface-dark border border-surface-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange("status", option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-border transition-colors ${
                    filters.status === option.value
                      ? "text-[#135bec] bg-[#135bec]/10"
                      : "text-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 h-9 px-3.5 bg-surface-dark hover:bg-surface-border border border-surface-border rounded-lg transition-colors">
              <span className="text-slate-300 text-sm font-medium">
                Availability:{" "}
                <span className="text-white">
                  {availabilityOptions.find((opt) => opt.value === filters.is_online)?.label || "All"}
                </span>
              </span>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                <MdKeyboardArrowDown />
              </span>
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-surface-dark border border-surface-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {availabilityOptions.map((option) => (
                <button
                  key={String(option.value)}
                  onClick={() => onFilterChange("is_online", option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-border transition-colors ${
                    filters.is_online === option.value
                      ? "text-[#135bec] bg-[#135bec]/10"
                      : "text-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Type Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 h-9 px-3.5 bg-surface-dark hover:bg-surface-border border border-surface-border rounded-lg transition-colors">
              <span className="text-slate-300 text-sm font-medium">
                Vehicle:{" "}
                <span className="text-white">
                  {vehicleOptions.find((opt) => opt.value === filters.vehicleType)?.label || "All"}
                </span>
              </span>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                  <MdKeyboardArrowDown />
              </span>
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-surface-dark border border-surface-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {vehicleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange("vehicleType", option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-border transition-colors ${
                    filters.vehicleType === option.value
                      ? "text-[#135bec] bg-[#135bec]/10"
                      : "text-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-surface-border mx-1"></div>

          {/* Export Button */}
          <button
            className="flex items-center justify-center size-9 bg-surface-dark hover:bg-surface-border border border-surface-border rounded-lg transition-colors"
            title="Export Data"
          >
            <span className="material-symbols-outlined text-slate-400 hover:text-white text-[20px]">
              <MdDownload />
            </span>
          </button>

          {/* Clear Filters Button */}
          {(filters.status || filters.is_online !== null || filters.vehicleType) && (
            <button
              onClick={() => {
                onFilterChange("status", "");
                onFilterChange("is_online", null);
                onFilterChange("vehicleType", "");
              }}
              className="flex items-center gap-2 h-9 px-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                  <MdFilterAltOff />
              </span>
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverFilters;