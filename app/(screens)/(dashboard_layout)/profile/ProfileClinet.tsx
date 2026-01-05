import { Input, PasswordInput } from "@/app/components/profile";
import { UserProfileUpdateData } from "@/app/types/profile";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchProfileThunk, updateProfileThunk } from "@/app/store/thunks/profileThunks";

const ProfileUpdate: React.FC = () => {
    const dispatch = useAppDispatch();
    const { profile } = useAppSelector((state) => state.profile);
  const [profileData, setProfileData] = useState<UserProfileUpdateData>(profile as UserProfileUpdateData);

  // New state to toggle edit mode
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => { 
    dispatch(fetchProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setProfileData(profile);
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Updated Profile:", profileData);
    dispatch(updateProfileThunk(profileData));
    setIsEditing(false); // Disable edit mode after saving
  };

  const handleEdit = () => {
    setIsEditing(!isEditing); // Toggle between edit and view mode
  };

  return (
    <main className="flex-1 px-4 lg:px-10 py-6 max-w-6xl mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <a className="text-text-muted hover:text-primary text-sm font-medium" href="#">Home</a>
        <span className="text-text-muted text-sm">/</span>
        <a className="text-text-muted hover:text-primary text-sm font-medium" href="#">Settings</a>
        <span className="text-text-muted text-sm">/</span>
        <span className="text-white text-sm font-medium">Profile</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-white text-3xl font-black mb-2">Profile Settings</h1>
          <p className="text-text-muted max-w-2xl">
            Manage your personal information, security preferences, and account settings.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-lg border border-surface-card text-white text-sm font-bold hover:bg-surface-card"
            onClick={() => setIsEditing(false)} // Cancel edit
            disabled={!isEditing}
          >
            Cancel
          </button>
          <button
            onClick={isEditing ? handleSave : handleEdit}
            className={`px-6 py-2 rounded-lg ${isEditing ? 'bg-primary hover:bg-blue-600' : 'bg-surface-card hover:bg-surface-card/80'} text-white text-sm font-bold flex items-center gap-2 shadow-lg`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isEditing ? "save" : "edit"}
            </span>
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* Profile Card */}
          <div className="bg-surface-dark border border-[#232f48] rounded-xl p-6 md:p-8">
            {/* Avatar */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-8 border-b border-[#232f48] pb-8">
              <div className="relative">
                <div
                  className="bg-cover bg-center rounded-full h-28 w-28 ring-4 ring-[#232f48]"
                  style={{
                    backgroundImage:
                      'url("https://randomuser.me/api/portraits/women/44.jpg")',
                  }}
                />
                <button className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2 border-2 border-surface-dark">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">
                  {profileData.first_name} {profileData.last_name}
                </h3>
                <p className="text-text-muted mb-4">Senior Administrator • USA</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-lg bg-[#232f48] text-white text-sm font-bold">
                    Change Avatar
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-bold">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="first_name"
                value={profileData.first_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Last Name"
                name="last_name"
                value={profileData.last_name}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-white/90">Email Address</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted">
                    mail
                  </span>
                  <input
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full bg-surface-card rounded-lg text-white pl-11 pr-4 py-3 focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <Input
                label="Phone Number"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Location"
                name="address"
                value={profileData.address}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <div>
                <label className="text-sm font-medium text-white/90">Gender</label>
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-2 bg-surface-card rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-primary"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-white/90">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={profileData.date_of_birth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-2 bg-surface-card rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN – Security */}
        <div className="flex flex-col gap-8">
          <div className="bg-surface-dark border border-[#232f48] rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lock</span>
              Security
            </h3>

            <div className="flex flex-col gap-4">
              <PasswordInput label="Current Password" disabled={!isEditing} />
              <PasswordInput label="New Password" disabled={!isEditing} />
              <PasswordInput label="Confirm Password" disabled={!isEditing} />

              <button
                className="mt-2 w-full py-3 rounded-lg border border-[#232f48] hover:bg-[#232f48] text-white text-sm font-bold transition-colors"
                disabled={!isEditing}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </main>
  );
};

export default ProfileUpdate;


