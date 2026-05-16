"use client";

import { useEffect, useState } from "react";
import { BiEdit, BiSave } from "react-icons/bi";

import SkeletonLoader from "@/app/loading/profile/SkeletonLoader";
import { useGetProfileQuery, useUpdateProfileMutation } from "../../../services/adminApi";
import { useToast } from "../../../hooks/useToast";
import { UserProfile } from "@/app/types/profile";

const ProfilePage = () => {
  const toast = useToast();
  const [updateProfile] = useUpdateProfileMutation();
  const { data: profileData, isLoading } = useGetProfileQuery();
  const [profile, setProfile] = useState<UserProfile>({} as UserProfile);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profileData?.data) {
      setProfile(profileData.data);
    }
  }, [profileData]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev: UserProfile) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSave = async () => {
    try {
      await updateProfile(profile).unwrap();
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2">Profile Settings</h1>
            <p className="text-muted max-w-2xl">
              Manage your personal information, security preferences, and
              account settings.
            </p>
          </div>

          <div className="flex gap-3">
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg border border-theme bg-surface text-foreground text-sm font-semibold hover:opacity-80 transition"
              >
                Cancel
              </button>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow flex items-center gap-2 hover:opacity-90 transition"
            >
              {isEditing ? (
                <div onClick={handleSave} className="flex items-center gap-1.5">
                  <BiSave className="text-lg" />
                  Save Changes
                </div>
              ) : (
                <>
                  <BiEdit className="text-lg" />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="w-full">
          {/* Main */}
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <div className="w-full flex flex-col gap-8">
              <div className="bg-surface border border-theme rounded-xl p-6 md:p-8">
                {/* Profile header */}
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-8 border-b border-theme pb-8">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-background text-2xl font-bold border border-theme">
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">
                      {profile?.first_name} {profile?.last_name}
                    </h3>
                    <p className="text-muted mb-4">
                      {profile?.role?.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "First Name", key: "first_name", type: "text" },
                    { label: "Last Name", key: "last_name", type: "text" },
                    {
                      label: "Email Address",
                      key: "email",
                      type: "email",
                      full: true,
                    },
                    { label: "Phone Number", key: "phone", type: "tel" },
                    { label: "Location", key: "address", type: "text" },
                  ].map((field) => (
                    <div
                      key={field.key}
                      className={`flex flex-col gap-2 ${
                        field.full ? "md:col-span-2" : ""
                      }`}
                    >
                      <label className="text-sm font-medium">
                        {field.label}
                      </label>

                      <input
                        type={field.type}
                        disabled={!isEditing}
                        value={(profile as any)?.[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(
                            field.key as keyof UserProfile,
                            e.target.value
                          )
                        }
                        className={`w-full bg-background border border-theme rounded-lg px-4 py-3 outline-none focus:ring-2 ring-primary transition ${
                          !isEditing && "bg-disabled border-disabled"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
