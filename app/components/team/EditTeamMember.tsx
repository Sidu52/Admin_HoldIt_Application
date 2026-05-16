"use client";

import { TeamMember, TeamMemberUpdateData } from "@/app/types/team";
import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { ROLES } from "@/app/constants/constant";

interface EditTeamMemberProps {
  showEditModal: boolean;
  member: TeamMember;
  onClose: () => void;
  handleSubmit: (data: TeamMemberUpdateData) => void;
  isLoading?: boolean;
}

function EditTeamMember({
  member,
  showEditModal,
  onClose,
  handleSubmit,
  isLoading,
}: EditTeamMemberProps) {
  const [form, setForm] = useState<TeamMemberUpdateData>({
    first_name: member.first_name || "",
    last_name: member.last_name || "",
    email: member.email || "",
    phone: member.phone || "",
    gender: member.gender || "",
    date_of_birth: member.date_of_birth || "",
    address: member.address || "",
    role: member.role || "",
  });

  useEffect(() => {
    setForm({
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      email: member.email || "",
      phone: member.phone || "",
      gender: member.gender || "",
      date_of_birth: member.date_of_birth || "",
      address: member.address || "",
      role: member.role || "",
    });
  }, [member]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(form);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-screen z-20 bg-background text-foreground transition-all duration-300 ease-in-out shadow-2xl overflow-auto ${
        showEditModal ? "w-full sm:w-[450px]" : "w-0"
      }`}
    >
      {/* Header */}
      <div className="relative p-6 border-b border-gray-200 dark:border-[#324467] bg-white dark:bg-[#1a2332]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Team Member
        </h2>
        <p className="text-sm text-gray-500 dark:text-[#92a4c9] mt-1">
          Update the profile details
        </p>

        {/* Close button */}
        <div
          className="absolute top-6 right-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#324467] p-2 rounded-full transition-colors duration-150"
          onClick={onClose}
        >
          <MdClose size={20} className="text-slate-500 dark:text-[#92a4c9]" />
        </div>
      </div>

      {/* Form */}
      <form className="p-6 space-y-5 bg-white dark:bg-[#1a2332] min-h-screen" onSubmit={submitForm}>
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-[#92a4c9] mb-1.5" htmlFor="first_name">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-[#324467] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-[#232f48] text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-[#92a4c9] mb-1.5" htmlFor="last_name">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-[#324467] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-[#232f48] text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#92a4c9] mb-1.5" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-[#324467] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-[#232f48] text-slate-900 dark:text-white"
            required
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#92a4c9] mb-1.5" htmlFor="phone">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-[#324467] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-[#232f48] text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-[#92a4c9] mb-1.5" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-[#324467] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-[#232f48] text-slate-900 dark:text-white"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-[#92a4c9] mb-1.5" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-[#324467] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-[#232f48] text-slate-900 dark:text-white capitalize"
            >
              <option value="">Select Role</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.split("_").join(" ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-[#92a4c9] mb-1.5" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 dark:border-[#324467] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-[#232f48] text-slate-900 dark:text-white"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTeamMember;
