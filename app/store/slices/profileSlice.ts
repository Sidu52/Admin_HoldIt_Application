import { UserProfile } from "@/app/types/profile";
import { createSlice } from "@reduxjs/toolkit";
import { fetchProfileThunk, updateProfileThunk } from "../thunks/profileThunks";

const initialState = {
  profile: {
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    date_of_birth: "",
    status: "",
    gender: "",
    last_login_at: "",
    isVerified: false,
  } as UserProfile,
  loading: true,
  error: null as string | null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile(state) {
      state.profile = initialState.profile;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = {
          ...action.payload,
          id: action.payload.id, // mapping backend id
        };
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = {
          ...action.payload,
          id: action.payload.id,
        };
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
