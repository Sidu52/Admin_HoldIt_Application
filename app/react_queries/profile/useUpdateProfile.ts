import { useMutation } from "@tanstack/react-query";
import { profileApi } from "@/app/api";
import { queryClient } from "@/app/lib/queryClient";
import { UserUpdateData } from "@/app/types/user";

const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (data: Partial<UserUpdateData>) =>
      profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export default useUpdateProfile;
