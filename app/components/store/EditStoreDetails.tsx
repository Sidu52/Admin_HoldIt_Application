"use client";

import { Store, StoreUpdateData } from "@/app/types/store";
import React, { useState } from "react";
import { MdClose } from "react-icons/md";

interface StoreProps {
  showEditModal: boolean;
  store: Store;
  onClose: () => void;
  handleSubmit: (data: StoreUpdateData) => void;
}


function EditStoreOwnerDetails({
  store,
  showEditModal,
  onClose,
  handleSubmit,
}: StoreProps) {
  const [form, setForm] = useState({
    store_name: store.store_name,
    store_address: store.store_address,
    store_open_time: store.store_open_time,
    store_close_time: store.store_close_time,
    store_description: store.store_description,
    store_contact_number: store.store_contact_number,
    location: {
      type: store.location.type,
      coordinates: store.location.coordinates,
      address: store.location.address,
    },
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
    handleSubmit(form as StoreUpdateData);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-screen z-20 bg-background text-foreground transition-all duration-150 ease-in-out shadow-2xl overflow-auto ${showEditModal ? "w-[400px]" : "w-0"
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
            htmlFor="store_name"
          >
            Store Name
          </label>
          <input
            type="text"
            id="store_name"
            name="store_name"
            value={form.store_name}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="store_contact_number">
            Contact Number
          </label>
          <input
            type="tel"
            id="store_contact_number"
            name="store_contact_number"
            value={form.store_contact_number}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="store_description">
            Description
          </label>
          <textarea
            id="store_description"
            name="store_description"
            value={form.store_description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
          ></textarea>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="store_address">
            Address
          </label>
          <textarea
            id="store_address"
            name="store_address"
            value={form.store_address}
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
