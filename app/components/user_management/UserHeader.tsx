"use client";
import React from "react";

interface UserHeaderProps {
  selectedCount: number;
  onAddUser: () => void;
  onDeleteSelected: () => void;
  onUpdateStatus: (status: string) => void;
  onClearSelected: () => void;
  onExportUsers: () => void;
  onImportUsers: () => void;
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
  onExportUsers,
  onImportUsers,
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
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                <span className="text-sm font-medium text-primary">
                  {selectedCount} selected
                </span>
                <button
                  onClick={onClearSelected}
                  className="text-primary hover:text-primary-dark p-0.5"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateStatus("active")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 h-9 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    check_circle
                  </span>
                  Activate
                </button>
                <button
                  onClick={() => onUpdateStatus("inactive")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 h-9 px-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    pause_circle
                  </span>
                  Deactivate
                </button>
                <button
                  onClick={onDeleteSelected}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 h-9 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                  Delete
                </button>
              </div>
              
              <div className="w-px h-6 bg-border-dark"></div>
            </>
          )}
          
          {/* Import/Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onImportUsers}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 h-9 px-4 bg-surface-dark hover:bg-surface-border border border-surface-border text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                upload
              </span>
              Import
            </button>
            <button
              onClick={onExportUsers}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 h-9 px-4 bg-surface-dark hover:bg-surface-border border border-surface-border text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              Export
            </button>
          </div>
          
          {/* Add User Button */}
          <button
            onClick={onAddUser}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 h-10 px-5 bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Add New User</span>
          </button>
        </div>
      </div>
      
      {/* Quick Actions Bar */}
      {selectedCount === 0 && (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => {/* Filter by active */}}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              person
            </span>
            All Users
          </button>
          <button
            onClick={() => {/* Filter by admins */}}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              shield_person
            </span>
            Admins Only
          </button>
          <button
            onClick={() => {/* Filter by recently active */}}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              schedule
            </span>
            Recently Active
          </button>
          <button
            onClick={() => {/* Filter by pending */}}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              hourglass_top
            </span>
            Pending Verification
          </button>
        </div>
      )}
    </header>
  );
};

export default UserHeader;