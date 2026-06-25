// profile.tsx
"use client";

import { useEffect, useState } from "react";
import { BiEdit, BiSave, BiPlus, BiGlobe, BiTime, BiUser, BiEnvelope, BiMapPin, BiChat } from "react-icons/bi";

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
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    if (profileData?.data) {
      setProfile(profileData.data);
      // Sample additional emails - replace with actual data from API if available
      if (profileData.data.additional_emails) {
        setAdditionalEmails(profileData.data.additional_emails);
      }
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
      const updatedProfile = {
        ...profile,
        additional_emails: additionalEmails,
      };
      await updateProfile(updatedProfile).unwrap();
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const handleAddEmail = () => {
    if (newEmail && !additionalEmails.includes(newEmail)) {
      setAdditionalEmails([...additionalEmails, newEmail]);
      setNewEmail("");
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setAdditionalEmails(additionalEmails.filter(email => email !== emailToRemove));
  };

  // Sample data for welcome header
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-transparent text-text-main-light dark:text-text-main-dark">
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark tracking-tight">
            Welcome, {profile?.first_name || "Amanda"}
          </h1>
          <p className="text-text-muted-light dark:text-text-muted-dark text-sm mt-1">{formattedDate}</p>
        </div>

        {/* Main Profile Card */}
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-soft overflow-hidden">
            {/* Profile Header with Avatar */}
            <div className="p-6 md:p-8 border-b border-border-light dark:border-border-dark">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold shadow-sm ring-2 ring-white/20">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0] || profile?.first_name?.[1]}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-text-muted-light dark:text-text-muted-dark text-sm mt-1 capitalize font-medium">
                    {profile?.role?.replaceAll("_", " ") || "Member"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Full Name */}
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
                    Full Name
                  </label>
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={profile?.first_name || ""}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                        className="flex-1 border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 text-text-main-light dark:text-text-main-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={profile?.last_name || ""}
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                        className="flex-1 border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 text-text-main-light dark:text-text-main-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Last Name"
                      />
                    </div>
                  ) : (
                    <p className="text-text-main-light dark:text-text-main-dark text-base font-semibold">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      value={profile?.gender || ""}
                      onChange={(e) => handleInputChange("gender" as keyof UserProfile, e.target.value)}
                      className="w-full border border-border-light dark:border-border-dark rounded-lg px-4 py-2.5 bg-white dark:bg-slate-800 text-text-main-light dark:text-text-main-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  ) : (
                    <p className="text-text-main-light dark:text-text-main-dark text-base font-semibold">{profile?.gender || "—"}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Primary Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
                      Primary Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile?.email || ""}
                        onChange={(e) => handleInputChange("email" as keyof UserProfile, e.target.value)}
                        className="w-full border border-border-light dark:border-border-dark rounded-lg px-4 py-2.5 bg-white dark:bg-slate-800 text-text-main-light dark:text-text-main-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    ) : (
                      <p className="text-text-main-light dark:text-text-main-dark text-base font-semibold mt-1">{profile?.email || "alexarawles@gmail.com"}</p>
                    )}
                  </div>

                  {/* Phone  */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile?.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full border border-border-light dark:border-border-dark rounded-lg px-4 py-2.5 bg-white dark:bg-slate-800 text-text-main-light dark:text-text-main-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    ) : (
                      <p className="text-text-main-light dark:text-text-main-dark text-base font-semibold mt-1">{profile?.phone || "+"}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile?.address || ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="w-full border border-border-light dark:border-border-dark rounded-lg px-4 py-2.5 bg-white dark:bg-slate-800 text-text-main-light dark:text-text-main-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    ) : (
                      <p className="text-text-main-light dark:text-text-main-dark text-base font-semibold mt-1">{profile?.address || "—"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 md:px-8 py-4 bg-background-light/30 dark:bg-background-dark/30 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                  }}
                  className="px-5 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-main-light dark:text-text-main-dark text-sm font-semibold hover:bg-background-light dark:hover:bg-slate-700/50 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-2 hover:bg-primary-dark transition shadow-sm cursor-pointer"
              >
                {isEditing ? (
                  <>
                    <BiSave className="text-base" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <BiEdit className="text-base" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;