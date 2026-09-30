"use client";

import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdPerson,
  MdLocationOn,
  MdAdminPanelSettings,
  MdSave,
  MdWarning,
} from "react-icons/md";
import { BiCheckCircle, BiBlock } from "react-icons/bi";
import { GENDER, ACCOUNT_STATUS, VERIFICATION_STATUS } from "@/app/enum";
import { User, UserUpdateData, Address } from "@/app/types/user";

interface UserProps {
  showEditModal: boolean;
  user: User;
  initialTab?: "personal" | "addresses" | "account";
  isSubmitting?: boolean;
  onClose: () => void;
  handleSubmit: (data: UserUpdateData) => void;
  onOpenAddressManager?: () => void;
}

const formatDateForInput = (dateStr?: string | Date) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export function EditUserDetails({
  user,
  showEditModal,
  initialTab = "personal",
  isSubmitting = false,
  onClose,
  handleSubmit,
  onOpenAddressManager,
}: UserProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "addresses" | "account">("personal");

  const [form, setForm] = useState({
    // Personal Details
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",

    // Account Operations
    account_status: ACCOUNT_STATUS.ACTIVE,
    verification_status: VERIFICATION_STATUS.PENDING,
    is_serviceable: true,
    account_deactivated_reason: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        date_of_birth: formatDateForInput(user.date_of_birth),

        account_status: (user.account_status as any) || ACCOUNT_STATUS.ACTIVE,
        verification_status: (user.verification_status as any) || VERIFICATION_STATUS.PENDING,
        is_serviceable: user.is_serviceable !== undefined ? Boolean(user.is_serviceable) : true,
        account_deactivated_reason: user.account_deactivated_reason || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (showEditModal) {
      setActiveTab(initialTab);
    }
  }, [showEditModal, initialTab]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isDeactivating =
    form.account_status === ACCOUNT_STATUS.INACTIVE ||
    form.account_status === ACCOUNT_STATUS.BLOCKED;

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDeactivating && !form.account_deactivated_reason?.trim()) {
      setActiveTab("account");
      return;
    }

    const payload: UserUpdateData = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender: form.gender || undefined,
      date_of_birth: form.date_of_birth || undefined,
      account_status: form.account_status,
      verification_status: form.verification_status,
      is_serviceable: form.is_serviceable,
      account_deactivated_reason: isDeactivating
        ? form.account_deactivated_reason.trim()
        : "",
    };

    handleSubmit(payload);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-screen z-50 bg-white dark:bg-[#1a2333] text-slate-900 dark:text-white transition-all duration-300 ease-in-out shadow-2xl flex flex-col border-l border-slate-200 dark:border-[#2a3852] ${
        showEditModal ? "w-full max-w-[540px]" : "w-0 overflow-hidden pointer-events-none"
      }`}
    >
      {/* Header */}
      <div className="relative p-6 border-b border-slate-200 dark:border-[#2a3852] bg-slate-50/50 dark:bg-[#151c2a] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center font-bold text-lg">
            {user?.first_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">
              Edit User Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.first_name} {user?.last_name} &bull; <code className="font-mono">{user?._id}</code>
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <MdClose size={20} />
        </button>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 mt-5 border-b border-slate-200 dark:border-[#2a3852] -mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "personal"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdPerson size={16} />
            <span>Personal Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "addresses"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdLocationOn size={16} />
            <span>Addresses</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 font-mono">
              {user?.addresses?.length || 0}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "account"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdAdminPanelSettings size={16} />
            <span>Account Operations</span>
            {isDeactivating && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={submitForm} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === "personal" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                    htmlFor="first_name"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className="w-full border border-slate-200 dark:border-[#2a3852] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                    htmlFor="last_name"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className="w-full border border-slate-200 dark:border-[#2a3852] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                  htmlFor="email"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-slate-200 dark:border-[#2a3852] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                    htmlFor="phone"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91..."
                    className="w-full border border-slate-200 dark:border-[#2a3852] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                    htmlFor="gender"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full border border-slate-200 dark:border-[#2a3852] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Gender</option>
                    {Object.values(GENDER).map((g) => (
                      <option key={g} value={g}>
                        {g.replace(/_/g, " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                  htmlFor="date_of_birth"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className="w-full border border-slate-200 dark:border-[#2a3852] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ADDRESSES & PREFERENCES */}
          {activeTab === "addresses" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#2a3852]">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Saved Addresses ({user?.addresses?.length || 0})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    User addresses stored for booking delivery & pickup
                  </p>
                </div>
                {onOpenAddressManager && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddressManager();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    Manage / Add
                  </button>
                )}
              </div>

              {user?.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((addr: Address, idx: number) => (
                    <div
                      key={addr._id || idx}
                      className={`p-3.5 rounded-xl border text-xs ${
                        addr.is_default
                          ? "border-primary/40 bg-blue-50/40 dark:bg-blue-900/10"
                          : "border-slate-200 dark:border-[#2a3852] bg-slate-50/50 dark:bg-[#1c2438]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                          <span>{addr.is_default ? "Default Address" : `Address ${idx + 1}`}</span>
                          {addr.type && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {addr.type}
                            </span>
                          )}
                        </div>
                        {addr.is_serviceable !== undefined && (
                          <span
                            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              addr.is_serviceable
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                            }`}
                          >
                            {addr.is_serviceable ? (
                              <>
                                <BiCheckCircle size={10} /> Serviceable
                              </>
                            ) : (
                              <>
                                <BiBlock size={10} /> Unserviceable
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.postal_code}, {addr.country}
                      </p>
                      {addr.coordinates && addr.coordinates.length === 2 && (
                        <p className="text-[11px] font-mono text-slate-400 mt-1.5">
                          Coords: [{addr.coordinates[0]?.toFixed(4)}, {addr.coordinates[1]?.toFixed(4)}]
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-slate-200 dark:border-[#2a3852] rounded-xl text-slate-400 text-xs">
                  No saved addresses found for this user.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT OPERATIONS */}
          {activeTab === "account" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151c2a] border border-slate-200 dark:border-[#2a3852] text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2.5">
                <MdAdminPanelSettings className="text-primary shrink-0 mt-0.5" size={18} />
                <span>
                  Admin controls for user status, platform serviceability, and fraud/behavioral restrictions.
                </span>
              </div>

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                  htmlFor="account_status"
                >
                  Account Status
                </label>
                <select
                  id="account_status"
                  name="account_status"
                  value={form.account_status}
                  onChange={handleChange}
                  className="w-full border border-slate-200 dark:border-[#2a3852] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                >
                  {Object.values(ACCOUNT_STATUS).map((st) => (
                    <option key={st} value={st}>
                      {st.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                  htmlFor="verification_status"
                >
                  Verification Status
                </label>
                <select
                  id="verification_status"
                  name="verification_status"
                  value={form.verification_status}
                  onChange={handleChange}
                  className="w-full border border-slate-200 dark:border-[#2a3852] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {Object.values(VERIFICATION_STATUS).map((vs) => (
                    <option key={vs} value={vs}>
                      {vs.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serviceable Eligibility Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-[#2a3852] bg-white dark:bg-[#1a2333]">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    Serviceable Area Eligibility
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enable or restrict luggage booking eligibility
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_serviceable"
                    checked={form.is_serviceable}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Reason when Inactive or Blocked */}
              {isDeactivating && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1"
                    htmlFor="account_deactivated_reason"
                  >
                    Reason for Inactivation / Blocking <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="account_deactivated_reason"
                    name="account_deactivated_reason"
                    rows={3}
                    value={form.account_deactivated_reason}
                    onChange={handleChange}
                    placeholder="Enter reason for deactivation or blocking this user account..."
                    className="w-full border border-rose-300 dark:border-rose-900/60 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                    <MdWarning size={14} />
                    <span>Deactivating revokes active login sessions immediately.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-[#2a3852] bg-slate-50 dark:bg-[#151c2a] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-[#2a3852] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <MdSave size={16} />
            <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditUserDetails;
