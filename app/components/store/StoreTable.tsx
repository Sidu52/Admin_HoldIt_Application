"use client";

import React, { useCallback, useMemo } from "react";
import Pagination from "../common/Pagination";
import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { getStatusBadge } from "../common/GetStatus";
import { Store } from "@/app/types/store";

interface PaginationProps {
  page: number;
  totalPages: number;
}

interface StoreTableProps {
  store: Store[];
  selectedStore: Store[];
  onSelectionChange: (stores: Store[]) => void;
  onViewDetails: (store: Store) => void;
  onDeleteClick: () => void;
  pagination: PaginationProps;
  onPageChange: (page: number) => void;
}

const StoreTable: React.FC<StoreTableProps> = ({
  store,
  selectedStore,
  onSelectionChange,
  onViewDetails,
  onDeleteClick,
  pagination,
  onPageChange,
}) => {
  const selectedIds = useMemo(
    () => new Set(selectedStore.map((u) => u._id)),
    [selectedStore]
  );

  const allSelected = store.length > 0 && store.every((u) => selectedIds.has(u._id));
  const someSelected = store.some((u) => selectedIds.has(u._id));

  const handleSelectStore = useCallback(
    (s: Store) => {
      if (selectedIds.has(s._id)) {
        onSelectionChange(selectedStore.filter((u) => u._id !== s._id));
      } else {
        onSelectionChange([...selectedStore, s]);
      }
    },
    [selectedIds, selectedStore, onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      const remaining = selectedStore.filter(
        (u) => !store.some((data) => data._id === u._id)
      );
      onSelectionChange(remaining);
    } else {
      const merged = [
        ...selectedStore.filter((u) => !store.some((data) => data._id === u._id)),
        ...store,
      ];
      onSelectionChange(merged);
    }
  }, [allSelected, store, selectedStore, onSelectionChange]);

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
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Store Identity</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark hidden lg:table-cell">Contact Info</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Status</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Operational Load</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {store.map((data) => (
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
                    onChange={() => handleSelectStore(data)}
                    className="rounded-lg border-border-light dark:border-border-dark text-primary focus:ring-primary/30 cursor-pointer h-4 w-4 transition-all"
                  />
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-[#1a2332] text-white flex items-center justify-center font-bold text-xs shadow-lg">
                      {data?.store_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark group-hover:text-primary transition-colors">
                        {data.store_name}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-tight">ID-ST-{data._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 hidden lg:table-cell">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark">{data.store_contact_number || "N/A"}</span>
                    <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-tight">{data.store_address || "No Address"}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  {getStatusBadge(data.status)}
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5 w-32">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                      <span className="text-text-muted-light dark:text-text-muted-dark">{data.current_booking_count || 0} / {data.max_booking_capacity || 0}</span>
                      <span className={((data.current_booking_count || 0) / (data.max_booking_capacity || 1)) > 0.8 ? "text-rose-500" : "text-emerald-500"}>
                        {Math.round(((data.current_booking_count || 0) / (data.max_booking_capacity || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ease-out rounded-full ${
                          ((data.current_booking_count || 0) / (data.max_booking_capacity || 1)) > 0.8 
                          ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" 
                          : ((data.current_booking_count || 0) / (data.max_booking_capacity || 1)) > 0.5 
                          ? "bg-amber-500" 
                          : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        }`}
                        style={{ width: `${Math.min(100, ((data.current_booking_count || 0) / (data.max_booking_capacity || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
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
            {store.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <p className="text-sm font-bold text-text-muted-light uppercase tracking-widest">No stores found</p>
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

export default StoreTable;
