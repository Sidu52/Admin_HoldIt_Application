import { api } from "@/app/lib/axios";
import { UserProfile } from "../types/profile";

// Profile API endpoints
const profileApi = {
  getProfile: async () => {
    const res = await api.get("/profile");
    return res.data;
  },

  updateProfile: async (
    data: Partial<UserProfile>
  ) => {
    const res = await api.put("/profile", data);
    return res.data;
  },
};
export default profileApi;