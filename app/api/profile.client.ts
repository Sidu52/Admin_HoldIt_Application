import { api } from "@/app/lib/axios";
import { UserProfile } from "../types/profile";

// Profile API endpoints
const profileApi = {
  getProfile: async () => {
    const res = await api.get("/admins/profile");
    return res.data;
  },

  updateProfile: async (
    data: Partial<UserProfile>
  ) => {
    const res = await api.put("/admins/profile", data);
    return res.data;
  },
};
export default profileApi;