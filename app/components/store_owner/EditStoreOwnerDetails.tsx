"use client";

import React, { useEffect, useState } from "react";
import { MdClose, MdPerson, MdAccountBalance, MdAdminPanelSettings, MdCheckCircle, MdSave } from "react-icons/md";
import { GENDER, ACCOUNT_STATUS, VERIFICATION_STATUS } from "@/app/enum";
import { StoreOwner, StoreOwnerUpdateData } from "@/app/types/storeOwner";

interface StoreOwnerProps {
  showEditModal: boolean;
  store_owner: StoreOwner;
  initialTab?: "personal" | "bank" | "account";
  isSubmitting?: boolean;
  onClose: () => void;
  handleSubmit: (data: StoreOwnerUpdateData) => void;
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

export function EditStoreOwnerDetails({
  store_owner,
  showEditModal,
  initialTab = "personal",
  isSubmitting = false,
  onClose,
  handleSubmit,
}: StoreOwnerProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "bank" | "account">("personal");

  const [form, setForm] = useState({
    // Personal details
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    address: "",

    // Bank details
    beneficiaryName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    preferredMode: "IMPS",
    isBankVerified: false,

    // Account operations
    account_status: ACCOUNT_STATUS.ACTIVE,
    verification_status: VERIFICATION_STATUS.PENDING,
    account_deactivated_reason: "",
  });

  // Re-sync form state whenever store_owner or showEditModal changes
  useEffect(() => {
    if (store_owner) {
      setForm({
        first_name: store_owner.first_name || "",
        last_name: store_owner.last_name || "",
        email: store_owner.email || "",
        phone: store_owner.phone || "",
        gender: store_owner.gender || "",
        date_of_birth: formatDateForInput(store_owner.date_of_birth),
        address: store_owner.address || "",

        beneficiaryName: store_owner.bankDetails?.beneficiaryName || "",
        accountNumber: store_owner.bankDetails?.accountNumber || "",
        ifscCode: store_owner.bankDetails?.ifscCode || "",
        upiId: store_owner.bankDetails?.upiId || "",
        preferredMode: store_owner.bankDetails?.preferredMode || "IMPS",
        isBankVerified: Boolean(store_owner.bankDetails?.isVerified),

        account_status: (store_owner.account_status as any) || ACCOUNT_STATUS.ACTIVE,
        verification_status: (store_owner.verification_status as any) || VERIFICATION_STATUS.PENDING,
        account_deactivated_reason: store_owner.account_deactivated_reason || "",
      });
    }
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [store_owner, showEditModal, initialTab]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: StoreOwnerUpdateData = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender: form.gender || undefined,
      date_of_birth: form.date_of_birth ? form.date_of_birth : undefined,
      address: form.address.trim() || undefined,
      account_status: form.account_status,
      verification_status: form.verification_status,
      account_deactivated_reason:
        form.account_status === ACCOUNT_STATUS.BLOCKED || form.account_status === ACCOUNT_STATUS.INACTIVE
          ? form.account_deactivated_reason.trim()
          : undefined,
      bankDetails: {
        beneficiaryName: form.beneficiaryName.trim() || null,
        accountNumber: form.accountNumber.trim() || null,
        ifscCode: form.ifscCode.trim().toUpperCase() || null,
        upiId: form.upiId.trim().toLowerCase() || null,
        preferredMode: form.preferredMode as "IMPS" | "NEFT" | "UPI",
        isVerified: form.isBankVerified,
      },
    };

    handleSubmit(payload);
  };

  if (!showEditModal) return null;

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
                Edit Store Owner Details
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Admin Control
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Modify personal details, payout bank credentials, and account statuses.
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
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "personal"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <MdPerson size={16} />
            <span>Personal Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bank")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "bank"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <MdAccountBalance size={16} />
            <span>Bank & Payouts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "account"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <MdAdminPanelSettings size={16} />
            <span>Account Operations</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="edit-store-owner-form" className="p-6 overflow-y-auto flex-1 space-y-5" onSubmit={submitForm}>
          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === "personal" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="first_name">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="last_name">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="gender">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    {Object.values(GENDER).map((g) => (
                      <option key={g} value={g}>
                        {g.charAt(0).toUpperCase() + g.slice(1).replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="date_of_birth">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="address">
                  Physical Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Street address, City, State, PIN"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: BANK & PAYOUT DETAILS */}
          {activeTab === "bank" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50">
                <div className="flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                  <MdAccountBalance size={18} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-bold">Admin Privileged Operation:</span> Store owners cannot modify their bank details after signup. As Admin CRM, verify documents thoroughly before saving or marking verified.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="beneficiaryName">
                  Beneficiary Account Name
                </label>
                <input
                  type="text"
                  id="beneficiaryName"
                  name="beneficiaryName"
                  value={form.beneficiaryName}
                  onChange={handleChange}
                  placeholder="Name as registered with the bank"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="accountNumber">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                  placeholder="e.g. 123456789012"
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="ifscCode">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    id="ifscCode"
                    name="ifscCode"
                    value={form.ifscCode}
                    onChange={(e) => setForm((prev) => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    className="w-full px-3.5 py-2.5 text-sm font-mono uppercase rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="preferredMode">
                    Disbursement Mode
                  </label>
                  <select
                    id="preferredMode"
                    name="preferredMode"
                    value={form.preferredMode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="IMPS">IMPS (Instant Settlement)</option>
                    <option value="NEFT">NEFT (Standard Batch)</option>
                    <option value="UPI">UPI (Direct VPA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="upiId">
                  UPI ID (VPA) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="upiId"
                  name="upiId"
                  value={form.upiId}
                  onChange={handleChange}
                  placeholder="e.g. storename@okaxis"
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Bank Verification Status Toggle */}
              <div className="pt-2">
                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-slate-50 dark:bg-[#232d46]/50 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-[#232d46]">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Mark Bank Credentials Verified
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Enables automated payout settlements via RazorpayX.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    name="isBankVerified"
                    checked={form.isBankVerified}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT OPERATIONS */}
          {activeTab === "account" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="account_status">
                  Account Status
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
                <p className="text-xs text-slate-500 mt-1">
                  Note: Setting status to Inactive or Blocked will automatically take all owner stores offline and invalidate their active sessions.
                </p>
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

              {(form.account_status === ACCOUNT_STATUS.BLOCKED || form.account_status === ACCOUNT_STATUS.INACTIVE) && (
                <div>
                  <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1.5" htmlFor="account_deactivated_reason">
                    Reason for Deactivation / Suspension <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="account_deactivated_reason"
                    name="account_deactivated_reason"
                    value={form.account_deactivated_reason}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Specify why this store owner account is being deactivated or blocked..."
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
            form="edit-store-owner-form"
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

export default EditStoreOwnerDetails;
