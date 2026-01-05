"use client";
import React from "react";
import {
  MdAdd,
  MdOutlineCancel,
  MdOutlineCheckCircle,
  MdOutlineDelete,
  MdOutlineHourglassTop,
  MdOutlinePauseCircle,
  MdOutlinePerson,
  MdSchedule,
} from "react-icons/md";

interface UserHeaderProps {
  selectedCount: number;
  onAddUser: () => void;
  onDeleteSelected: () => void;
  onUpdateStatus: (status: string) => void;
  onClearSelected: () => void;
  isLoading?: boolean;
  totalUsers?: number;
  activeUsers?: number;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  selectedCount,
  onAddUser,
  onDeleteSelected,
  onUpdateStatus,
  onClearSelected,
  isLoading = false,
  totalUsers = 0,
  activeUsers = 0,
}) => {
  return (
    <header className="flex flex-col gap-6 px-6 pt-8 pb-4 shrink-0">
      {/* Top Heading & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Management
          </h1>
          <p className="text-slate-500 dark:text-[#92a4c9] text-base">
            Manage and view all registered users across the platform.
          </p>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-500 dark:text-[#92a4c9]">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeUsers}
                </span>{" "}
                Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-slate-400"></div>
              <span className="text-sm text-slate-500 dark:text-[#92a4c9]">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {totalUsers}
                </span>{" "}
                Total Users
              </span>
            </div>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <>
              <div
                onClick={onClearSelected}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer bg-primary/10 border border-primary/20 rounded-lg"
              >
                <span className="text-sm font-medium text-primary">
                  {selectedCount} selected
                </span>
                <button className="text-primary hover:text-primary-dark p-0.5 ">
                  <span className="material-symbols-outlined text-[18px]">
                    <MdOutlineCancel />
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateStatus("active")}
                  disabled={isLoading}
                  className="flex items-center cursor-pointer justify-center gap-2 h-9 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    <MdOutlineCheckCircle />
                  </span>
                  Activate
                </button>
                <button
                  onClick={() => onUpdateStatus("inactive")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 cursor-pointer h-9 px-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    <MdOutlinePauseCircle />
                  </span>
                  Deactivate
                </button>
                <button
                  onClick={onDeleteSelected}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 cursor-pointer h-9 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    <MdOutlineDelete />
                  </span>
                  Delete
                </button>
              </div>

              <div className="w-px h-6 bg-border-dark"></div>
            </>
          )}

          {/* Add User Button */}
          {/* <button
            onClick={onAddUser}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 cursor-pointer h-10 px-5 bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">
              {" "}
              <MdAdd />{" "}
            </span>
            <span>Add New User</span>
          </button> */}
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
