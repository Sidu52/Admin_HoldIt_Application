import { User, UserUpdateData } from "@/app/types/usermanager";
import React, { useState } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { updateUserThunk } from "@/app/store/thunks/userThunks";

const EditUserDetails = ({
  userData,
  onClose,
}: {
  userData: User;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<UserUpdateData>({
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    phone: userData.auth_user_id?.phone || "",
    gender: userData.gender,
    dob: userData.dob,
    address: userData.address,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(updateUserThunk({ ...form, id: userData._id }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
      {/* Sheet */}
      <div className="bg-white dark:bg-[#232f48] w-full max-w-xl h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#e5e7eb] dark:border-[#324467]">
          <h2 className="text-2xl font-bold text-[#111418] dark:text-white">
            Edit User Details
          </h2>
          <p className="text-sm text-[#637588] dark:text-[#92a4c9] mt-1">
            Update profile and access information
          </p>
        </div>

        {/* Scrollable Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
            />
            <Input
              label="Last Name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          {/* Phone */}
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
          />

          {/* Gender */}
          <Input
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          />

          {/* Date of Birth */}
          <Input
            label="Date of Birth"
            name="dob"
            type="string"
            value={form.dob}
            onChange={handleChange}
          />

          {/* Address */}
          <Input
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e7eb] dark:border-[#324467] flex justify-end gap-3 bg-white dark:bg-[#232f48]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 cursor-pointer rounded-lg border border-[#e5e7eb] dark:border-[#324467] text-sm font-medium text-[#111418] dark:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 cursor-pointer rounded-lg bg-primary text-white text-sm font-bold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

type InputProps = {
  label: string;
  name: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
};

const Input = ({ label, name, value, onChange, type = "text" }: InputProps) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-[#111418] dark:text-white">
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="h-11 rounded-lg border border-[#e5e7eb] dark:border-[#324467] bg-white dark:bg-[#1f2a44] px-4 text-sm text-[#111418] dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
      />
    </label>
  );
};

export default EditUserDetails;
