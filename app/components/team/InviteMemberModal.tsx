"use client";

import { ROLES } from "@/app/enum";
import { useState } from "react";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; role: string }) => void;
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  onSubmit,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES.ADMIN);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!email) return setError("Email is required");
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Enter a valid email");

    setError("");
    onSubmit({ email, role });

    // reset + close
    setEmail("");
    setRole(ROLES.ADMIN);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-[#fff] text-[#000] p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Invite Team Member</h2>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="example@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground "
          >
            {Object.values(ROLES).filter(r => r !== "super_admin").map((r) => (
              <option className="capitalize" key={r} value={r}>
                {r.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}
