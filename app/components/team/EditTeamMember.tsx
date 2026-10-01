"use client";

import { TeamMember, TeamMemberUpdateData } from "@/app/types/team";
import React, { useState, useEffect } from "react";
import {
  MdClose,
  MdPerson,
  MdSecurity,
  MdAdminPanelSettings,
  MdSave,
  MdWarning,
} from "react-icons/md";
import { ROLES, ACCOUNT_STATUS, VERIFICATION_STATUS, GENDER } from "@/app/enum";

interface EditTeamMemberProps {
  showEditModal: boolean;
  member: TeamMember;
  initialTab?: "personal" | "role" | "account";
  onClose: () => void;
  handleSubmit: (data: TeamMemberUpdateData) => void;
  isLoading?: boolean;
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

const ROLE_DESCRIPTIONS: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: "Full administrative privileges across all system resources, settings, and team roles.",
  [ROLES.ADMIN]: "High-level access to manage users, stores, drivers, settlements, and staff members.",
  [ROLES.OPERATION_MANAGER]: "Operational access for bookings, luggage tracking, store capacity, and logistics.",
  [ROLES.CUSTOMER_SUPPORT]: "Support access to assist customers, view booking inquiries, and manage tickets.",
};

export function EditTeamMember({
  member,
  showEditModal,
  initialTab = "personal",
  onClose,
  handleSubmit,
  isLoading = false,
}: EditTeamMemberProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "role" | "account">("personal");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    address: "",
    role: ROLES.CUSTOMER_SUPPORT,
    account_status: ACCOUNT_STATUS.ACTIVE,
    verification_status: VERIFICATION_STATUS.PENDING,
    account_deactivated_reason: "",
  });

  useEffect(() => {
    if (member) {
      setForm({
        first_name: member.first_name || "",
        last_name: member.last_name || "",
        email: member.email || "",
        phone: member.phone || "",
        gender: member.gender || "",
        date_of_birth: formatDateForInput(member.date_of_birth),
        address: member.address || "",
        role: member.role || ROLES.CUSTOMER_SUPPORT,
        account_status: (member.account_status as any) || ACCOUNT_STATUS.ACTIVE,
        verification_status: (member.verification_status as any) || VERIFICATION_STATUS.PENDING,
        account_deactivated_reason: member.account_deactivated_reason || "",
      });
    }
  }, [member]);

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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    const payload: TeamMemberUpdateData = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      gender: form.gender || undefined,
      date_of_birth: form.date_of_birth || undefined,
      address: form.address.trim(),
      role: form.role,
      account_status: form.account_status,
      verification_status: form.verification_status,
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
      {/* Drawer Header */}
      <div className="relative p-6 border-b border-slate-200 dark:border-[#2a3852] bg-slate-50/50 dark:bg-[#151c2a] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg uppercase">
            {(member?.first_name?.[0] || "") + (member?.last_name?.[0] || "T")}
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">
              Edit Team Member
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {member?.first_name} {member?.last_name} &bull; <code className="font-mono">{member?._id}</code>
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

        {/* Navigation Tabs */}
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
            onClick={() => setActiveTab("role")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "role"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdSecurity size={16} />
            <span>Role & Access</span>
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
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91..."
                    className="w-full border border-slate-200 dark:border-[#2a3852] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs"
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

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                  htmlFor="address"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street, City, State..."
                  className="w-full border border-slate-200 dark:border-[#2a3852] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ROLE & ACCESS PERMISSIONS */}
          {activeTab === "role" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
                <MdSecurity className="shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" size={18} />
                <span>
                  Staff role assignment determines feature access and operation permissions across the CRM.
                </span>
              </div>

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
                  htmlFor="role"
                >
                  Assigned Team Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-slate-200 dark:border-[#2a3852] rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 text-slate-900 dark:text-white capitalize"
                  required
                >
                  {Object.values(ROLES).map((r) => (
                    <option key={r} value={r}>
                      {r.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role explanation box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151c2a] border border-slate-200 dark:border-[#2a3852]">
                <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1">
                  Role Capabilities & Scope
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ROLE_DESCRIPTIONS[form.role] || "Standard platform privileges."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT OPERATIONS */}
          {activeTab === "account" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151c2a] border border-slate-200 dark:border-[#2a3852] text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2.5">
                <MdAdminPanelSettings className="text-primary shrink-0 mt-0.5" size={18} />
                <span>
                  Admin controls for staff account status, onboarding verification, and session governance.
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

              {/* Reason when Inactive or Suspended */}
              {isDeactivating && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1"
                    htmlFor="account_deactivated_reason"
                  >
                    Reason for Deactivation / Suspension <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="account_deactivated_reason"
                    name="account_deactivated_reason"
                    rows={3}
                    value={form.account_deactivated_reason}
                    onChange={handleChange}
                    placeholder="Enter reason for deactivation or suspending this staff account..."
                    className="w-full border border-rose-300 dark:border-rose-900/60 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                    <MdWarning size={14} />
                    <span>Deactivating revokes active login access and refresh tokens immediately.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-[#2a3852] bg-slate-50 dark:bg-[#151c2a] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-[#2a3852] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <MdSave size={16} />
            <span>{isLoading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTeamMember;
