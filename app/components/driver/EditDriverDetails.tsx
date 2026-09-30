"use client";

import React, { useEffect, useState } from "react";
import { MdClose, MdPerson, MdAccountBalance, MdAdminPanelSettings, MdDirectionsBike, MdSave } from "react-icons/md";
import { GENDER, ACCOUNT_STATUS, VERIFICATION_STATUS } from "@/app/enum";
import { Driver, DriverUpdateData } from "@/app/types/driver";

interface DriverProps {
  showEditModal: boolean;
  driver: Driver;
  initialTab?: "personal" | "bank" | "account";
  isSubmitting?: boolean;
  onClose: () => void;
  handleSubmit: (data: DriverUpdateData) => void;
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

const COMMON_VEHICLE_TYPES = [
  { value: "scooter", label: "Scooter" },
  { value: "motorcycle", label: "Motorcycle / Bike" },
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "truck", label: "Truck" },
  { value: "bicycle", label: "Bicycle" },
  { value: "other", label: "Other" },
];

export function EditDriverDetails({
  driver,
  showEditModal,
  initialTab = "personal",
  isSubmitting = false,
  onClose,
  handleSubmit,
}: DriverProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "bank" | "account">("personal");

  const [form, setForm] = useState({
    // Personal & Vehicle
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    address: "",
    vehicle_type: "scooter",
    license_number: "",

    // Bank Details
    beneficiaryName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    preferredMode: "IMPS",
    isBankVerified: false,

    // Account Operations & Duty
    account_status: ACCOUNT_STATUS.ACTIVE,
    verification_status: VERIFICATION_STATUS.PENDING,
    is_serviceable: true,
    is_online: false,
    account_deactivated_reason: "",
  });

  useEffect(() => {
    if (driver) {
      setForm({
        first_name: driver.first_name || "",
        last_name: driver.last_name || "",
        email: driver.email || "",
        phone: driver.phone || "",
        gender: driver.gender || "",
        date_of_birth: formatDateForInput(driver.date_of_birth),
        address: driver.address || "",
        vehicle_type: driver.vehicle_type || "scooter",
        license_number: driver.license_number || "",

        beneficiaryName: driver.bankDetails?.beneficiaryName || "",
        accountNumber: driver.bankDetails?.accountNumber || "",
        ifscCode: driver.bankDetails?.ifscCode || "",
        upiId: driver.bankDetails?.upiId || "",
        preferredMode: driver.bankDetails?.preferredMode || "IMPS",
        isBankVerified: Boolean(driver.bankDetails?.isVerified),

        account_status: (driver.account_status as any) || ACCOUNT_STATUS.ACTIVE,
        verification_status: (driver.verification_status as any) || VERIFICATION_STATUS.PENDING,
        is_serviceable: driver.is_serviceable !== undefined ? Boolean(driver.is_serviceable) : true,
        is_online: Boolean(driver.is_online),
        account_deactivated_reason: driver.account_deactivated_reason || "",
      });
    }
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [driver, showEditModal, initialTab]);

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

    const payload: DriverUpdateData = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender: form.gender || undefined,
      date_of_birth: form.date_of_birth ? form.date_of_birth : undefined,
      address: form.address.trim() || undefined,
      vehicle_type: form.vehicle_type || undefined,
      license_number: form.license_number.trim() || undefined,
      account_status: form.account_status,
      verification_status: form.verification_status,
      is_serviceable: form.is_serviceable,
      is_online: form.is_online,
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
                Edit Driver Details
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Admin Control
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage personal info, weekly settlement bank details, vehicle credentials, and duty operations.
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
            <span>Profile & Vehicle</span>
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
            <span>Account & Duty</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="edit-driver-form" className="p-6 overflow-y-auto flex-1 space-y-5" onSubmit={submitForm}>
          {/* TAB 1: PERSONAL & VEHICLE DETAILS */}
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

              {/* Vehicle Credentials */}
              <div className="pt-2 border-t border-slate-100 dark:border-[#2d3b56]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <MdDirectionsBike size={16} className="text-blue-500" />
                  Vehicle Credentials
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="vehicle_type">
                      Vehicle Type
                    </label>
                    <select
                      id="vehicle_type"
                      name="vehicle_type"
                      value={form.vehicle_type}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {COMMON_VEHICLE_TYPES.map((v) => (
                        <option key={v.value} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="license_number">
                      Driving License Number
                    </label>
                    <input
                      type="text"
                      id="license_number"
                      name="license_number"
                      value={form.license_number}
                      onChange={(e) => setForm((prev) => ({ ...prev, license_number: e.target.value.toUpperCase() }))}
                      placeholder="e.g. MH0120190012345"
                      className="w-full px-3.5 py-2.5 text-sm font-mono uppercase rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-white dark:bg-[#232d46] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
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
                  placeholder="Street address, locality, city, postal code"
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
                    <span className="font-bold">Weekly Driver Settlements:</span> Payouts trigger automatically every Monday at 08:00 AM via RazorpayX IMPS/UPI. Ensure the bank account is verified to prevent disbursement failures.
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
                  placeholder="Name registered with bank"
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
                  placeholder="e.g. driver@okhdfcbank"
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
                      Approves driver account for automated Monday payout batch disbursements.
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

          {/* TAB 3: ACCOUNT OPERATIONS & DUTY */}
          {activeTab === "account" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Duty & Serviceable Operations */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#2d3a58] bg-slate-50/50 dark:bg-[#232d46]/30 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Duty & Operational Control
                </span>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Duty Status (Online / Offline)
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      {form.is_online ? "🟢 Currently Online and accepting bookings" : "⚪ Offline"}
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

                <div className="pt-2 border-t border-slate-200/60 dark:border-[#2d3a58]">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Serviceable in Assigned Area
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        Allows driver to receive luggage drop/pickup assignments in service boundary.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      name="is_serviceable"
                      checked={form.is_serviceable}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                  </label>
                </div>
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
                    placeholder="Specify why this driver is being deactivated or blocked..."
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
            form="edit-driver-form"
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

export default EditDriverDetails;
