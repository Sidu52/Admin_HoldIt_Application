"use client";

import React, { useEffect, useState } from "react";
import { MdClose, MdStore, MdInventory2, MdAdminPanelSettings, MdSave, MdAccessTime } from "react-icons/md";
import { ACCOUNT_STATUS, VERIFICATION_STATUS } from "@/app/enum";
import { Store, StoreUpdateData } from "@/app/types/store";

interface StoreProps {
  showEditModal: boolean;
  store: Store;
  initialTab?: "details" | "capacity" | "operations";
  isSubmitting?: boolean;
  onClose: () => void;
  handleSubmit: (data: StoreUpdateData) => void;
}

export function EditStoreDetails({
  store,
  showEditModal,
  initialTab = "details",
  isSubmitting = false,
  onClose,
  handleSubmit,
}: StoreProps) {
  const [activeTab, setActiveTab] = useState<"details" | "capacity" | "operations">("details");

  const [form, setForm] = useState({
    store_name: "",
    phone: "",
    store_contact_number: "",
    store_open_time: "08:00",
    store_close_time: "22:00",
    store_description: "",
    max_booking_capacity: 50,
    current_booking_count: 0,
    verification_status: VERIFICATION_STATUS.PENDING,
    account_status: ACCOUNT_STATUS.ACTIVE,
    is_online: false,
    store_deactivated_reason: "",
  });

  useEffect(() => {
    if (store) {
      setForm({
        store_name: store.store_name || "",
        phone: store.phone || "",
        store_contact_number: store.store_contact_number || "",
        store_open_time: store.store_open_time || "08:00",
        store_close_time: store.store_close_time || "22:00",
        store_description: store.store_description || "",
        max_booking_capacity: store.max_booking_capacity || 50,
        current_booking_count: store.current_booking_count || 0,
        verification_status: (store.verification_status as any) || VERIFICATION_STATUS.PENDING,
        account_status: (store.account_status as any) || ACCOUNT_STATUS.ACTIVE,
        is_online: Boolean(store.is_online),
        store_deactivated_reason: store.store_deactivated_reason || "",
      });
    }
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [store, showEditModal, initialTab]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: StoreUpdateData = {
      store_name: form.store_name.trim(),
      phone: form.phone.trim(),
      store_contact_number: form.store_contact_number.trim() || undefined,
      store_open_time: form.store_open_time,
      store_close_time: form.store_close_time,
      store_description: form.store_description.trim() || undefined,
      max_booking_capacity: Number(form.max_booking_capacity),
      current_booking_count: Math.max(0, Number(form.current_booking_count)),
      verification_status: form.verification_status,
      account_status: form.account_status,
      is_online: form.is_online,
      store_deactivated_reason:
        form.account_status === ACCOUNT_STATUS.BLOCKED || form.account_status === ACCOUNT_STATUS.INACTIVE
          ? form.store_deactivated_reason.trim()
          : undefined,
    };

    handleSubmit(payload);
  };

  if (!showEditModal) return null;

  const occupancyRatio = form.max_booking_capacity > 0
    ? Math.min(100, Math.round((form.current_booking_count / form.max_booking_capacity) * 100))
    : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity duration-200"
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[540px] z-50 bg-white dark:bg-[#1c2438] text-slate-900 dark:text-white shadow-2xl flex flex-col border-l border-slate-200 dark:border-[#2d3a58] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-[#2d3a58] flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#232d46]/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Edit Store Details
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Admin Control
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Modify store operating info, luggage capacities, and operational statuses.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2c3752] transition-colors"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-[#2d3a58] bg-slate-50/30 dark:bg-[#232d46]/20 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "details"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <MdStore size={16} />
            <span>Store & Hours</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("capacity")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "capacity"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <MdInventory2 size={16} />
            <span>Capacity & Space</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("operations")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "operations"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <MdAdminPanelSettings size={16} />
            <span>Account Operations</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="edit-store-form" className="p-6 overflow-y-auto flex-1 space-y-5" onSubmit={submitForm}>
          {/* TAB 1: STORE & HOURS */}
          {activeTab === "details" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="store_name">
                  Store Outlet Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="store_name"
                  name="store_name"
                  value={form.store_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="phone">
                    Registered Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="store_contact_number">
                    Secondary Contact Number
                  </label>
                  <input
                    type="tel"
                    id="store_contact_number"
                    name="store_contact_number"
                    value={form.store_contact_number}
                    onChange={handleChange}
                    placeholder="e.g. 022-12345678"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Operating Hours */}
              <div className="pt-2 border-t border-slate-100 dark:border-[#2d3b56]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <MdAccessTime size={16} className="text-blue-500" />
                  Operating Hours (24h Format)
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="store_open_time">
                      Opening Time (HH:mm)
                    </label>
                    <input
                      type="time"
                      id="store_open_time"
                      name="store_open_time"
                      value={form.store_open_time}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="store_close_time">
                      Closing Time (HH:mm)
                    </label>
                    <input
                      type="time"
                      id="store_close_time"
                      name="store_close_time"
                      value={form.store_close_time}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="store_description">
                  Store Description & Landmarks
                </label>
                <textarea
                  id="store_description"
                  name="store_description"
                  value={form.store_description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Directions, storage facilities, landmark notes..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CAPACITY & SPACE MANAGEMENT */}
          {activeTab === "capacity" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50">
                <div className="flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                  <MdInventory2 size={18} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-bold">Luggage Capacity Control:</span> Total capacity determines the maximum bags this store can accommodate concurrently. You can release or adjust current occupied slots to free up inventory for new bookings.
                  </p>
                </div>
              </div>

              {/* Real-time Occupancy Gauge */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-slate-50/50 dark:bg-[#232d46]/30">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Storage Utilization</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {form.current_booking_count} / {form.max_booking_capacity} Bags ({occupancyRatio}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      occupancyRatio >= 90
                        ? "bg-rose-500"
                        : occupancyRatio >= 70
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${occupancyRatio}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Available Space: <strong className="text-slate-800 dark:text-slate-200">{Math.max(0, form.max_booking_capacity - form.current_booking_count)} slots</strong></span>
                  <span>Max Limit: <strong className="text-slate-800 dark:text-slate-200">{form.max_booking_capacity} bags</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="max_booking_capacity">
                    Maximum Storage Capacity (Bags) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="max_booking_capacity"
                    name="max_booking_capacity"
                    min={1}
                    max={500}
                    value={form.max_booking_capacity}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="current_booking_count">
                    Currently Occupied Count (Bags)
                  </label>
                  <input
                    type="number"
                    id="current_booking_count"
                    name="current_booking_count"
                    min={0}
                    value={form.current_booking_count}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quick Release Action */}
              <div className="p-3 bg-slate-50 dark:bg-[#1c2438] rounded-xl border border-dashed border-slate-200 dark:border-[#2d3b56] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Quick Reset Occupancy
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Sets occupied count to 0 in this form.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, current_booking_count: 0 }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                >
                  Clear Occupancy
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT & OPERATIONS */}
          {activeTab === "operations" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="account_status">
                    Store Account Status
                  </label>
                  <select
                    id="account_status"
                    name="account_status"
                    value={form.account_status}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {Object.values(ACCOUNT_STATUS).map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="verification_status">
                    Verification Status
                  </label>
                  <select
                    id="verification_status"
                    name="verification_status"
                    value={form.verification_status}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {Object.values(VERIFICATION_STATUS).map((v) => (
                      <option key={v} value={v}>
                        {v.charAt(0).toUpperCase() + v.slice(1).replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Online status toggle */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-slate-50/50 dark:bg-[#232d46]/30">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Store Visibility (Online / Offline)
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      {form.is_online ? "🟢 Store is Online and visible on customer search" : "⚪ Offline"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    name="is_online"
                    checked={form.is_online}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </label>
              </div>

              {(form.account_status === ACCOUNT_STATUS.BLOCKED || form.account_status === ACCOUNT_STATUS.INACTIVE) && (
                <div>
                  <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1.5" htmlFor="store_deactivated_reason">
                    Reason for Deactivation / Suspension <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="store_deactivated_reason"
                    name="store_deactivated_reason"
                    value={form.store_deactivated_reason}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Specify why this store outlet is being deactivated or blocked..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-red-300 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                    required
                  />
                </div>
              )}
            </div>
          )}
        </form>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-[#2d3a58] flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-[#232d46]/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3a58] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2c3752] text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-store-form"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <MdSave size={16} />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default EditStoreDetails;
