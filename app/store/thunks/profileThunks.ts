import { createAsyncThunk } from "@reduxjs/toolkit";
import { profileApi } from "@/app/api/client";
import { UserProfile } from "@/app/types/profile";

export const fetchProfileThunk = createAsyncThunk<
  UserProfile,
  void
>("profile/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const res = await profileApi.getProfile();
    return res.data.data; // adjust based on API response
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to fetch profile");
  }
});

export const updateProfileThunk = createAsyncThunk<
  UserProfile,
  Partial<UserProfile>
>("profile/updateProfile", async (data, { rejectWithValue }) => {
  try {
    const res = await profileApi.updateProfile(data);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Profile update failed");
  }
});
