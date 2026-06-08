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
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Welcome Header - Similar to image */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome, {profile?.first_name || "Amanda"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{formattedDate}</p>
        </div>

        {/* Main Profile Card */}
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Profile Header with Avatar */}
            <div className="p-6 md:p-8 border-b border-gray-100">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Avatar - similar to image style */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold shadow-sm">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0] || profile?.first_name?.[1]}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1 capitalize">
                    {profile?.role?.replaceAll("_", " ") || "Member"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  {isEditing ? (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={profile?.first_name || ""}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={profile?.last_name || ""}
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Last Name"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-800 text-base">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      value={profile?.gender || ""}
                      onChange={(e) => handleInputChange("gender" as keyof UserProfile, e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  ) : (
                    <p className="text-gray-800 text-base">{profile?.gender || "—"}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="space-y-4">
                  {/* Primary Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-full">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Primary Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profile?.email || ""}
                          onChange={(e) => handleInputChange("email" as keyof UserProfile, e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      ) : (
                        <p className="text-gray-800 text-base mt-1">{profile?.email || "alexarawles@gmail.com"}</p>
                      )}
                    </div>

                    {/* Phone  */}
                    <div className="flex items-start justify-between w-full">
                      <div className="w-full">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile?.phone || ""}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        ) : (
                          <p className="text-gray-800 text-base mt-1">{profile?.phone || "+"}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Address */}
                    <div className="flex items-start justify-between">
                      <div>
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Location
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile?.address || ""}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        ) : (
                          <p className="text-gray-800 text-base mt-1">{profile?.address || ""}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                  }}
                  className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
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
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
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