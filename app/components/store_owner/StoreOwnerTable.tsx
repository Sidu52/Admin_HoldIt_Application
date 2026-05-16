"use client";

import React, { useCallback, useMemo } from "react";
import Pagination from "../common/Pagination";
import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import {
  formatDateTime,
  getFullName,
  getUserNameFirstChar,
} from "@/app/utils/helper";
import { getStatusBadge } from "../common/GetStatus";
import { StoreOwner } from "@/app/types/storeOwner";

interface PaginationProps {
  page: number;
  totalPages: number;
}

interface StoreOwnerTableProps {
  store_owner: StoreOwner[];
  selectedStoreOwners: StoreOwner[];
  onSelectionChange: (owners: StoreOwner[]) => void;
  onViewDetails: (owner: StoreOwner) => void;
  onDeleteClick: () => void;
  pagination: PaginationProps;
  onPageChange: (page: number) => void;
}

const StoreOwnerTable: React.FC<StoreOwnerTableProps> = ({
  store_owner,
  selectedStoreOwners,
  onSelectionChange,
  onViewDetails,
  onDeleteClick,
  pagination,
  onPageChange,
}) => {
  const selectedIds = useMemo(
    () => new Set(selectedStoreOwners.map((u) => u._id)),
    [selectedStoreOwners]
  );

  const allSelected = store_owner.length > 0 && store_owner.every((u) => selectedIds.has(u._id));
  const someSelected = store_owner.some((u) => selectedIds.has(u._id));

  const handleSelectOwner = useCallback(
    (owner: StoreOwner) => {
      if (selectedIds.has(owner._id)) {
        onSelectionChange(selectedStoreOwners.filter((u) => u._id !== owner._id));
      } else {
        onSelectionChange([...selectedStoreOwners, owner]);
      }
    },
    [selectedIds, selectedStoreOwners, onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      const remaining = selectedStoreOwners.filter(
        (u) => !store_owner.some((data) => data._id === u._id)
      );
      onSelectionChange(remaining);
    } else {
      const merged = [
        ...selectedStoreOwners.filter((u) => !store_owner.some((data) => data._id === u._id)),
        ...store_owner,
      ];
      onSelectionChange(merged);
    }
  }, [allSelected, store_owner, selectedStoreOwners, onSelectionChange]);

  return (
    <div className="card-premium flex-1 flex flex-col overflow-hidden p-0 bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-premium/5">
      <div className="flex-1 overflow-auto text-sm">
        <table className="w-full border-separate border-spacing-0">
          <thead className="bg-background-light dark:bg-background-dark">
            <tr>
              <th className="sticky top-0 z-10 w-14 px-6 py-4 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !allSelected && someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="rounded-lg border-border-light dark:border-border-dark text-primary focus:ring-primary/30 cursor-pointer h-4 w-4 transition-all"
                  />
                </div>
              </th>
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Owner Identity</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark hidden lg:table-cell">Contact Info</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Status</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark hidden md:table-cell">Last Active</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {store_owner.map((data) => (
              <tr
                key={data._id}
                className={`group transition-all duration-200 hover:bg-background-light dark:hover:bg-background-dark/50 ${
                  selectedIds.has(data._id) ? "bg-primary/[0.02]" : ""
                }`}
              >
                <td className="px-6 py-5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(data._id)}
                    onChange={() => handleSelectOwner(data)}
                    className="rounded-lg border-border-light dark:border-border-dark text-primary focus:ring-primary/30 cursor-pointer h-4 w-4 transition-all"
                  />
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-[#1a2332] text-white flex items-center justify-center font-bold text-xs shadow-lg">
                      {getUserNameFirstChar(data.first_name, data.last_name)}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark group-hover:text-primary transition-colors">
                        {getFullName(data.first_name, data.last_name)}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-tight">ID-SO-{data._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 hidden lg:table-cell">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark">{data.phone || "N/A"}</span>
                    <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-tight">{data.email}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  {getStatusBadge(data.status)}
                </td>
                <td className="px-6 py-5 hidden md:table-cell text-center">
                  <span className="text-[13px] font-bold text-text-muted-light dark:text-text-muted-dark">
                    {data.last_login_at ? formatDateTime(data.last_login_at, "date") : "Never"}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onViewDetails(data)}
                      className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:text-primary hover:bg-primary/10 transition-all"
                    >
                      <MdOutlineEdit size={18} />
                    </button>
                    <button
                      onClick={onDeleteClick}
                      className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:text-rose-600 hover:bg-rose-500/10 transition-all"
                    >
                      <MdOutlineDelete size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {store_owner.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <p className="text-sm font-bold text-text-muted-light uppercase tracking-widest">No owners found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="px-8 py-5 bg-background-light/30 dark:bg-background-dark/30 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-bold text-text-muted-light uppercase tracking-wider">
            Page <span className="text-text-main-light dark:text-text-main-dark">{pagination.page}</span> of <span className="text-primary">{pagination.totalPages}</span>
          </p>
          <div className="flex items-center gap-4">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-2 rounded-xl border border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark disabled:opacity-30 transition-all"
            >
              <RiArrowLeftSLine size={20} className="text-text-main-light dark:text-text-main-dark" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-2 rounded-xl border border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark disabled:opacity-30 transition-all"
            >
              <RiArrowRightSLine size={20} className="text-text-main-light dark:text-text-main-dark" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreOwnerTable;
