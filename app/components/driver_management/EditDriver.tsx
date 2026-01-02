// app/components/driver/EditDriver.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { updateDriver, setCurrentDriver } from "@/app/store/slices/driverSlice";
import { Driver, DriverUpdateData } from "@/app/types/driver";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface EditDriverProps {
  driver: Driver;
  onClose?: () => void;
  isModal?: boolean;
}

const EditDriver: React.FC<EditDriverProps> = ({ 
  driver, 
  onClose, 
  isModal = false 
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { operationLoading, operationError } = useAppSelector((state) => state.driver);

  const [formData, setFormData] = useState<DriverUpdateData>({
    first_name: driver.first_name || "",
    last_name: driver.last_name || "",
    email: driver.email || "",
    gender: driver.gender || "",
    dob: driver.dob || "",
    address: driver.address || "",
    phone: driver.auth_user_id?.phone?.toString() || "",
    licenseNumber: driver.licenseNumber || "",
    vehicleType: driver.vehicleType || "",
    verification_status: driver.verification_status || "",
    status: driver.status || "active",
    role: driver.auth_user_id?.role || "driver",
    is_online: driver.is_online || false,
    documents: [],
    currentLocation: {
      lat: 0,
      lng: 0,
      address: "",
    },
  });

  const [licenseFiles, setLicenseFiles] = useState<{
    front: File | null;
    back: File | null;
  }>({ front: null, back: null });
  const [licenseFrontPreview, setLicenseFrontPreview] = useState<string>("");
  const [licenseBackPreview, setLicenseBackPreview] = useState<string>("");

  useEffect(() => {
    if (operationError) {
      toast.error(operationError);
    }
  }, [operationError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "date") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = (side: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image or PDF file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setLicenseFiles((prev) => ({ ...prev, [side]: file }));

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === "front") {
          setLicenseFrontPreview(reader.result as string);
        } else {
          setLicenseBackPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData = {
        id: driver._id,
        ...formData,
      };

      // If there are new license files, upload them first
      if (licenseFiles.front || licenseFiles.back) {
        // Implement file upload logic here
        toast.success("License documents uploaded successfully");
      }

      await dispatch(updateDriver(updateData)).unwrap();
      
      toast.success("Driver updated successfully");
      
      if (isModal && onClose) {
        onClose();
      } else {
        router.push(`/dashboard/drivers/${driver._id}`);
      }
    } catch (error) {
      toast.error("Failed to update driver");
    }
  };

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
            Active Status
          </span>
        );
      case "inactive":
        return (
          <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 text-xs font-medium border border-slate-500/20">
            Inactive Status
          </span>
        );
      case "suspended":
        return (
          <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
            Suspended
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
            {status}
          </span>
        );
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return (
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
            Verified License
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
            Pending Verification
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 text-xs font-medium border border-slate-500/20">
            Not Verified
          </span>
        );
    }
  };

  return (
    <div className={`${!isModal ? "p-6 lg:p-10" : ""}`}>
      <div className={`${!isModal ? "mx-auto max-w-[1200px]" : ""}`}>
        {/* Page Header & Profile Summary */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div>
              <h1 className="text-white text-3xl font-bold leading-tight mb-1">
                Edit Driver Details
              </h1>
              <p className="text-[#92a4c9] text-sm">
                Updating information for Driver ID: #{driver._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/drivers/${driver._id}/logs`)}
                className="flex items-center gap-2 px-4 py-2 bg-[#232f48] text-[#92a4c9] hover:text-white hover:bg-[#2d3b55] rounded-lg text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">history</span>
                View Log
              </button>
              <button
                type="button"
                onClick={() => {
                  // Implement suspend logic
                  toast.success("Driver suspension initiated");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">block</span>
                Suspend Driver
              </button>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-[#1c2433] rounded-xl p-6 border border-[#232f48]">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative">
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-full h-24 w-24 border-4 border-[#111722] flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {driver.first_name?.[0]}
                    {driver.last_name?.[0]}
                  </span>
                </div>
                <div
                  className={`absolute bottom-0 right-0 size-5 rounded-full border-4 border-[#1c2433] ${
                    driver.is_online ? "bg-green-500" : "bg-slate-500"
                  }`}
                  title={driver.is_online ? "Online" : "Offline"}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white">
                  {driver.first_name} {driver.last_name}
                </h3>
                <p className="text-[#92a4c9] text-sm mb-3">
                  Joined {new Date(driver.createdAt).toLocaleDateString("en-US", { 
                    month: "long", 
                    year: "numeric" 
                  })} • 4.8 Rating
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {getStatusBadge(driver.status)}
                  {getVerificationBadge(driver.verification_status)}
                  <span className="px-3 py-1 rounded-full bg-[#232f48] text-[#92a4c9] text-xs font-medium border border-[#34425e]">
                    Gold Tier
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Section: Personal Information */}
          <div className="bg-[#1c2433] rounded-xl border border-[#232f48] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#232f48] flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              <h3 className="text-white font-bold text-lg">Personal Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  First Name *
                </label>
                <input
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-[#3d485e]"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Last Name *
                </label>
                <input
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-[#3d485e]"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    className="w-full h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 pl-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-[#3d485e]"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#586885] text-[20px]">
                    mail
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    className="w-full h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 pl-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-[#3d485e]"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#586885] text-[20px]">
                    call
                  </span>
                </div>
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">Gender</label>
                <select
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Date of Birth
                </label>
                <input
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:dark]"
                  type="date"
                  name="dob"
                  value={formatDateForInput(formData.dob)}
                  onChange={handleChange}
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Residential Address
                </label>
                <input
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-[#3d485e]"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section: License & Identification */}
          <div className="bg-[#1c2433] rounded-xl border border-[#232f48] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#232f48] flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">badge</span>
              <h3 className="text-white font-bold text-lg">License & Identification</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* License Number */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  License Number *
                </label>
                <input
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Expiration Date */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Expiration Date
                </label>
                <input
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:dark]"
                  type="date"
                  name="licenseExpiry"
                  // You might need to add this field to your formData
                  // value={formData.licenseExpiry}
                  // onChange={handleChange}
                />
              </div>

              {/* License Class */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  License Class
                </label>
                <div className="relative">
                  <select className="w-full h-11 appearance-none rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                    <option>Class A</option>
                    <option>Class B</option>
                    <option selected>Class C (Standard)</option>
                    <option>Class M</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#586885] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Verification Status */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Verification Status
                </label>
                <select
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  name="verification_status"
                  value={formData.verification_status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Driver Status */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Driver Status
                </label>
                <select
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              {/* Online Status */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Online Status
                </label>
                <div className="flex items-center h-11">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_online"
                      checked={formData.is_online}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_online: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    <span className="ml-3 text-sm text-[#92a4c9]">
                      {formData.is_online ? "Online" : "Offline"}
                    </span>
                  </label>
                </div>
              </div>

              {/* License Document Scans */}
              <div className="flex flex-col gap-2 md:col-span-3">
                <label className="text-sm font-medium text-[#92a4c9]">
                  License Document Scans
                </label>
                <div className="flex flex-wrap gap-4">
                  {/* Front License */}
                  <div className="relative">
                    <input
                      type="file"
                      id="license-front"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("front", e)}
                    />
                    <label
                      htmlFor="license-front"
                      className="relative w-32 h-20 rounded-lg border border-[#232f48] overflow-hidden group cursor-pointer flex flex-col items-center justify-center"
                    >
                      {licenseFrontPreview ? (
                        <div
                          className="bg-cover bg-center w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundImage: `url(${licenseFrontPreview})` }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                          <span className="material-symbols-outlined text-[#586885] text-2xl">
                            credit_card
                          </span>
                          <span className="text-xs text-[#586885] mt-1">Front</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-all">
                        <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                          Front
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Back License */}
                  <div className="relative">
                    <input
                      type="file"
                      id="license-back"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("back", e)}
                    />
                    <label
                      htmlFor="license-back"
                      className="relative w-32 h-20 rounded-lg border border-[#232f48] overflow-hidden group cursor-pointer flex flex-col items-center justify-center"
                    >
                      {licenseBackPreview ? (
                        <div
                          className="bg-cover bg-center w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundImage: `url(${licenseBackPreview})` }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                          <span className="material-symbols-outlined text-[#586885] text-2xl">
                            credit_card
                          </span>
                          <span className="text-xs text-[#586885] mt-1">Back</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-all">
                        <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                          Back
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Upload Button */}
                  <div
                    onClick={() => document.getElementById("license-front")?.click()}
                    className="w-32 h-20 rounded-lg border border-dashed border-[#586885] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <span className="material-symbols-outlined text-[#586885] group-hover:text-primary">
                      upload
                    </span>
                    <span className="text-[10px] text-[#586885] group-hover:text-primary">
                      Upload Document
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#586885] mt-2">
                  Upload front and back of driver's license (JPG, PNG, or PDF, max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Section: Assigned Vehicle */}
          <div className="bg-[#1c2433] rounded-xl border border-[#232f48] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#232f48] flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                directions_car
              </span>
              <h3 className="text-white font-bold text-lg">Assigned Vehicle</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Vehicle Type */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Vehicle Type *
                </label>
                <select
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Car">Car</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Bicycle">Bicycle</option>
                </select>
              </div>

              {/* Make & Model */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Make & Model
                </label>
                <input
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  type="text"
                  placeholder="e.g., Toyota Camry SE Hybrid"
                  // You might need to add vehicle model to your formData
                  // value={formData.vehicleModel}
                  // onChange={handleChange}
                />
              </div>

              {/* Year */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">Year</label>
                <select
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  // You might need to add vehicle year to your formData
                  // value={formData.vehicleYear}
                  // onChange={handleChange}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 20 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Plate Number */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Plate Number
                </label>
                <input
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono tracking-wider"
                  type="text"
                  placeholder="e.g., 6XRT882"
                  // You might need to add plate number to your formData
                  // value={formData.plateNumber}
                  // onChange={handleChange}
                />
              </div>

              {/* Vehicle Color */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Vehicle Color
                </label>
                <input
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  type="text"
                  placeholder="e.g., Grey"
                  // You might need to add vehicle color to your formData
                  // value={formData.vehicleColor}
                  // onChange={handleChange}
                />
              </div>

              {/* Insurance Expiry */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#92a4c9]">
                  Insurance Expiry
                </label>
                <input
                  className="h-11 rounded-lg bg-[#111722] border border-[#232f48] px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:dark]"
                  type="date"
                  // You might need to add insurance expiry to your formData
                  // value={formData.insuranceExpiry}
                  // onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="sticky bottom-0 z-10 -mx-6 -mb-8 mt-4 px-6 py-4 bg-[#111722]/95 backdrop-blur-sm border-t border-[#232f48] flex justify-between items-center">
            <button
              type="button"
              onClick={handleCancel}
              disabled={operationLoading}
              className="text-[#92a4c9] hover:text-white px-6 py-2 text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  // Save as draft logic
                  toast.success("Saved as draft");
                }}
                disabled={operationLoading}
                className="px-6 py-2.5 rounded-lg border border-[#232f48] bg-[#1c2433] text-white font-medium hover:bg-[#232f48] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={operationLoading}
                className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading ? (
                  <>
                    <span className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Bottom spacer to account for sticky footer overlay */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default EditDriver;