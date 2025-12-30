import { UserProfile } from "@/app/types/profile";
import { createSlice } from "@reduxjs/toolkit";

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
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setUser(state, action) {
            console.log("action.payload.", action.payload);
            state.profile.id = action.payload._id;
            state.profile.first_name = action.payload.first_name;
            state.profile.last_name = action.payload.last_name;
            state.profile.email = action.payload.email;
            state.profile.role = action.payload.role;
            state.profile.phone = action.payload.phone;
            state.profile.address = action.payload.address;
            state.profile.date_of_birth = action.payload.date_of_birth;
            state.profile.status = action.payload.status;
            state.profile.gender = action.payload.gender;
            state.profile.last_login_at = action.payload.last_login_at;
            state.profile.isVerified = action.payload.isVerified;
        },
    },
});

export const { setUser } = profileSlice.actions;
export default profileSlice.reducer;