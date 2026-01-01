"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { usegetUserById, useUpdateProfile } from "@/app/hooks/useUserManager";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setUserById } from "@/app/store/slices/usersSlice";
import {
  AccountDetails,
  Breadcrumbs,
  ProfileHeader,
} from "@/app/components/user_management/user-detail";
import UserUpdateForm from "@/app/components/user_management/user-detail/UserUpdateForm";
import { User } from "@/app/types/usermanager";
import { UserProfileDetailSkeleton } from "@/app/loading/user/UserDetailSkeleton";

interface UserDetailsProps {
  user_id: string;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user_id }) => {
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = usegetUserById(user_id);
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const { userById } = useAppSelector((state) => state.users);
  const [editUserToggle, setEditUserToggle] = useState<boolean>(false);

  /* Sync API data to Redux */
  useEffect(() => {
    const user = data?.data?.data;
    if (user) {
      dispatch(setUserById(user));
    }
  }, [data, dispatch]);

  const fullName = useMemo(() => {
    if (!userById) return "";
    return `${userById.first_name} ${userById.last_name}`;
  }, [userById]);

  const handleUpdateUser = useCallback(
    (user: User) => {
      if (!user?._id) return;

      const payload = {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.auth_user_id?.phone,
        gender: user.gender,
        dob: user.dob,
        address: user.address,
        status: user.status,
        role: user.auth_user_id?.role,
      };

      updateProfile(payload, {
        onSuccess: () => setEditUserToggle(false),
      });
    },
    [updateProfile]
  );

  const handleCancelUpdate = useCallback(() => {
    setEditUserToggle(false);
  }, []);

  /* Loading & Error States */
  if (isLoading) {
    return <UserProfileDetailSkeleton />;
  }

  if (error || !userById) {
    return <div className="p-4 text-red-500">Failed to load user.</div>;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white overflow-x-hidden">
      <div className="relative flex min-h-screen flex-col">
        <div className="layout-container flex grow flex-col">
          <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
              <Breadcrumbs userName={fullName} />

              <ProfileHeader
                user={userById}
                setEditUserToogle={setEditUserToggle}
              />

              <div className="w-full gap-8 px-4">
                <AccountDetails user={userById} />
              </div>
            </div>
          </div>
        </div>

        {/* Update User Form */}
        {editUserToggle && (
          <div className="absolute inset-0 bg-black/30">
            <UserUpdateForm
              user={userById}
              onSubmit={handleUpdateUser}
              onCancel={handleCancelUpdate}
              isLoading={isUpdating}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
