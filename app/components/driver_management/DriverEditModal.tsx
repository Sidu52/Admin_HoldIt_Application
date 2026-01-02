"use client";

import React, { useState } from "react";
import { useUpdateDriver } from "@/app/hooks/useDrivers";
import { Driver, DriverUpdateData } from "@/app/types/driver";

interface DriverEditModalProps {
  driver: Driver;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDriver: Driver) => void;
}

const DriverEditModal: React.FC<DriverEditModalProps> = ({
  driver,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const updateDriver = useUpdateDriver();
  const [formData, setFormData] = useState<DriverUpdateData>({
    first_name: driver.first_name,
    last_name: driver.last_name,
    email: driver.email,
    gender: driver.gender,
    dob: driver.dob,
    address: driver.address,
    phone: driver.auth_user_id?.phone?.toString() || "",
    licenseNumber: driver.licenseNumber,
    vehicleType: driver.vehicleType,
    verification_status: driver.verification_status,
    status: driver.status,
    role: driver.auth_user_id?.role || "driver",
    is_online: driver.is_online,
    documents: [],
    currentLocation: {
      lat: 0,
      lng: 0,
      address: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedDriver = await updateDriver.mutateAsync({
        id: driver._id,
        ...formData,
      });
      onSuccess(updatedDriver);
      onClose();
    } catch (error) {
      console.error("Failed to update driver:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: DriverUpdateData) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: DriverUpdateData) => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-dark border border-surface-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-surface-border">
          <h3 className="text-xl font-bold text-white">Edit Driver</h3>
          <p className="text-slate-400 text-sm mt-1">
            Update driver information and settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-surface-dark border border-surface-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-surface-dark border border-surface-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-surface-dark border border-surface-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-surface-dark border border-surface-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-surface-dark border border-surface-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-surface-dark border border-surface-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Scooter">Scooter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-surface-dark border border-surface-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <input
                  type="checkbox"
                  name="is_online"
                  checked={formData.is_online}
                  onChange={handleChange}
                  className="rounded border-slate-600 bg-surface-dark text-primary focus:ring-offset-surface-dark focus:ring-primary/50"
                />
                Online Status
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateDriver.isPending}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateDriver.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverEditModal;