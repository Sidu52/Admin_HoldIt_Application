"use client";

import { StoreOwner, StoreOwnerUpdateData } from "@/app/types/storeOwner";
import React, { useState } from "react";
import { MdClose } from "react-icons/md";

interface StoreOwnerProps {
  showEditModal: boolean;
  store_owner: StoreOwner;
  onClose: () => void;
  handleSubmit: (data: StoreOwnerUpdateData) => void;
}

const GENDER_OPTIONS = ["male", "female", "other", "prefer_not_to_say"];

function EditStoreOwnerDetails({
  store_owner,
  showEditModal,
  onClose,
  handleSubmit,
}: StoreOwnerProps) {
  const [form, setForm] = useState(
    {
      first_name: store_owner.first_name,
      last_name: store_owner.last_name,
      email: store_owner.email,
      phone: store_owner.phone || "",
      gender: store_owner.gender || "",
      date_of_birth: store_owner.date_of_birth || "",
      address: store_owner.address || "",
    }
  );

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
    handleSubmit(form as StoreOwnerUpdateData);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-screen z-20 bg-background text-foreground transition-all duration-150 ease-in-out shadow-2xl overflow-auto ${
        showEditModal ? "w-[400px]" : "w-0"
      }`}
    >
      {/* Header */}
      <div className="relative p-6 border-b border-gray-200 dark:border-[#324467]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Store Owner Details
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
          Update Store Owner profile
        </p>

        {/* Close button */}
        <div
          className="absolute top-4 right-4 cursor-pointer hover:scale-110 transition-transform duration-150"
          onClick={onClose}
        >
          <MdClose size={24} />
        </div>
      </div>

      {/* Form */}
      <form className="p-6 space-y-4" onSubmit={submitForm}>
        {/* First Name */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="first_name"
          >
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="last_name">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select Gender</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="date_of_birth">
            Date of Birth
          </label>
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-150"
        >
          Update Store Owner
        </button>
      </form>
    </div>
  );
}

export default EditStoreOwnerDetails;
