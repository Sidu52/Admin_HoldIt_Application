"use client";

import {
  Driver,
  DriverUpdateData,
  DriverUpdateProps,
} from "@/app/types/driverManager";
import { useState, useEffect } from "react";
import { CgMail } from "react-icons/cg";
import {
  MdBadge,
  MdCalendarMonth,
  MdLocationOn,
  MdPhone,
  MdSave,
} from "react-icons/md";

export default function DriverUpdateForm({
  driver,
  onSubmit,
  onCancel,
  isLoading = false,
}: DriverUpdateProps) {
  const [formData, setFormData] = useState<Driver>(driver);
  const [errors, setErrors] = useState<
    Partial<Record<keyof DriverUpdateData, string>>
  >({});

  // Update form when driver prop changes
  useEffect(() => {
    setFormData(driver);
  }, [driver]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name as keyof DriverUpdateData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DriverUpdateData, string>> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.auth_user_id?.phone) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = "Date of birth cannot be in the future";
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    setFormData(driver);
    setErrors({});
    onCancel();
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622] text-gray-900 dark:text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-[#2A364D]  pb-6 mb-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Update Driver Details
            </h2>
            <p className="text-gray-500 dark:text-[#92a4c9] text-base">
              Manage profile information, role access, and security settings.
            </p>
          </div>
          <div className="flex gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                formData.status === "active"
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : formData.status === "inactive"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  formData.status === "active"
                    ? "bg-green-500"
                    : formData.status === "inactive"
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              ></span>
              {formData?.status?.charAt(0).toUpperCase() +
                formData?.status?.slice(1)}{" "}
              Driver
            </span>
          </div>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1A2230] border border-gray-200 dark:border-[#2A364D]  rounded-xl shadow-sm overflow-hidden flex flex-col"
        >
          {/* Section: Personal Info */}
          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#135bec]">
                  person
                </span>
                Personal Information
              </h3>
              <p className="text-sm text-gray-500 dark:text-[#92a4c9]">
                Update the driver's basic identification details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  First Name *
                </label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.first_name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 dark:border-[#2A364D]  focus:border-[#135bec] focus:ring-[#135bec]/20 dark:focus:border-[#135bec]"
                  } bg-gray-50 dark:bg-[#151C29]  text-gray-900 dark:text-white h-12 px-4 placeholder-gray-400 dark:placeholder-gray-500 transition-colors`}
                  placeholder="e.g. John"
                  type="text"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Last Name *
                </label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.last_name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 dark:border-[#2A364D]  focus:border-[#135bec] focus:ring-[#135bec]/20 dark:focus:border-[#135bec]"
                  } bg-gray-50 dark:bg-[#151C29]  text-gray-900 dark:text-white h-12 px-4 placeholder-gray-400 dark:placeholder-gray-500 transition-colors`}
                  placeholder="e.g. Doe"
                  type="text"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.last_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Email Address *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">
                    <CgMail />
                  </span>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-lg border ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 dark:border-[#2A364D]  focus:border-[#135bec] focus:ring-[#135bec]/20 dark:focus:border-[#135bec]"
                    } bg-gray-50 dark:bg-[#151C29]  text-gray-900 dark:text-white h-12 pl-11 pr-4 placeholder-gray-400 dark:placeholder-gray-500 transition-colors`}
                    placeholder="name@company.com"
                    type="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Phone Number *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">
                    <MdPhone />
                  </span>
                  <input
                    name="phone"
                    value={formData.auth_user_id?.phone}
                    onChange={handleChange}
                    className={`w-full rounded-lg border ${
                      errors?.phone
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 dark:border-[#2A364D]  focus:border-[#135bec] focus:ring-[#135bec]/20 dark:focus:border-[#135bec]"
                    } bg-gray-50 dark:bg-[#151C29]  text-gray-900 dark:text-white h-12 pl-11 pr-4 placeholder-gray-400 dark:placeholder-gray-500 transition-colors`}
                    placeholder="+1 (555) 123-4567"
                    type="tel"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Date of Birth *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">
                    <MdCalendarMonth />
                  </span>
                  <input
                    name="dob"
                    value={formatDateForInput(formData.dob)}
                    onChange={handleChange}
                    className={`w-full rounded-lg border ${
                      errors.dob
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 dark:border-[#2A364D]  focus:border-[#135bec] focus:ring-[#135bec]/20 dark:focus:border-[#135bec]"
                    } bg-gray-50 dark:bg-[#151C29]  text-gray-900 dark:text-white h-12 pl-11 pr-4 placeholder-gray-400 dark:placeholder-gray-500 transition-colors`}
                    type="date"
                  />
                </div>
                {errors.dob && (
                  <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
                )}
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2A364D]  bg-gray-50 dark:bg-[#151C29]  text-gray-900 dark:text-white focus:border-[#135bec] focus:ring-[#135bec]/20 dark:focus:border-[#135bec] h-12 px-4 transition-colors cursor-pointer"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Address *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-gray-400 material-symbols-outlined text-[20px]">
                    <MdLocationOn />
                  </span>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full rounded-lg border ${
                      errors.address
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 dark:border-[#2A364D]  focus:border-[#135bec] focus:ring-[#135bec]/20 dark:focus:border-[#135bec]"
                    } bg-gray-50 dark:bg-[#151C29]  text-gray-900 dark:text-white p-4 pl-11 placeholder-gray-400 dark:placeholder-gray-500 transition-colors resize-none`}
                    placeholder="123 Main St, City, State, ZIP Code"
                  />
                </div>
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 dark:bg-[#2A364D]  w-full"></div>

          {/* Section: Role & Status */}
          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#135bec]">
                  <MdBadge />
                </span>
                Access & Permissions
              </h3>
              <p className="text-sm text-gray-500 dark:text-[#92a4c9]">
                Control what this driver can view and edit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Role Select */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Assigned Role
                </label>
                <select
                  name="role"
                  value={formData.auth_user_id?.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2A364D]  bg-gray-50 dark:bg-[#151C29]  text-gray-900 dark:text-white focus:border-[#135bec] focus:ring-[#135bec]/20 dark:focus:border-[#135bec] h-12 px-4 transition-colors cursor-pointer"
                >
                  <option value="admin">Administrator</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  {formData.auth_user_id?.role === "admin" &&
                    "Full access to all system features and settings."}
                  {formData.auth_user_id?.role === "editor" &&
                    "Can manage content but cannot change system settings."}
                  {formData.auth_user_id?.role === "viewer" &&
                    "Read-only access to view content without editing capabilities."}
                </p>
              </div>

              {/* Status Toggle */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 dark:border-[#2A364D]  bg-gray-50 dark:bg-[#151C29] /50">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      Account Status
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Control driver access to the platform
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="rounded-lg border border-gray-300 dark:border-[#2A364D]  bg-white dark:bg-[#151C29] text-gray-900 dark:text-white focus:border-[#135bec] focus:ring-[#135bec]/20 dark:focus:border-[#135bec] h-10 px-3 text-sm transition-colors cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          formData.status === "active"
                            ? "bg-green-500"
                            : formData.status === "inactive"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formData?.status &&
                          formData?.status?.charAt(0).toUpperCase() +
                            formData?.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-6 border-t border-gray-200 dark:border-[#2A364D]  bg-white dark:bg-[#1A2230] flex items-center justify-end gap-3 rounded-b-xl sticky bottom-0 z-10">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-[#2A364D]  text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-[#135bec] hover:bg-[#1d6bf5] text-white font-medium shadow-lg shadow-[#135bec]/25 transition-all hover:shadow-[#135bec]/40 focus:ring-4 focus:ring-[#135bec]/30 focus:outline-none flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    <MdSave />
                  </span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
