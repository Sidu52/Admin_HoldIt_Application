"use client";
import { UserProfile } from "@/app/types/profile";
import { User } from "@/app/types/usermanager";
import { BiEdit, BiLock, BiLockAlt } from "react-icons/bi";

export default function ProfileHeader({
  user,
  setEditUserToogle,
}: {
  user: User;
  setEditUserToogle: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const handleEditProfile = () => {
    setEditUserToogle(true);
  };

  const handleResetPassword = () => {
    console.log("Reset password for:", user._id);
  };

  const handleSuspendUser = () => {
    console.log("Suspend user:", user._id);
  };

  return (
    <div className="flex px-4 py-2 @container mb-6">
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:justify-between lg:items-end">
        <div className="flex gap-6 items-start">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full py-5 px-6 shadow-lg ring-4 ring-white dark:ring-[#232f48] relative">
            <span className="text-3xl text-[#333] dark:text-[#fff]">
              {" "}
              {user?.first_name?.charAt(0)}
              {user?.last_name?.charAt(0)}
            </span>
          </div>

          <div className="flex flex-col pt-2">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[#111418] dark:text-white text-[32px] font-bold leading-tight tracking-[-0.015em]">
                {user.first_name} {user.last_name}
              </h1>
              <span className="text-[#637588] dark:text-[#92a4c9] text-base font-normal leading-normal flex items-center gap-2 mt-1">
                {user?.auth_user_id?.role?.replaceAll("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full lg:w-auto gap-3 flex-wrap">
          <button
            onClick={handleEditProfile}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#3b82f6] hover:bg-blue-700 text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1 lg:flex-auto shadow-md transition-all gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">
              <BiEdit />
            </span>
            <span className="truncate">Edit Profile</span>
          </button>

          <button
            onClick={handleResetPassword}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-[#111418] dark:text-white hover:bg-gray-50 dark:hover:bg-[#2a3855] text-sm font-bold leading-normal tracking-[0.015em] flex-1 lg:flex-auto transition-all gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">
              <BiLock />
            </span>
            <span className="truncate">Reset Password</span>
          </button>

          <button
            onClick={handleSuspendUser}
            className="flex min-w-[40px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-3 bg-white dark:bg-[#232f48] border border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold leading-normal tracking-[0.015em] transition-all"
            title="Suspend User"
          >
            <span className="material-symbols-outlined text-[20px]">
              <BiLockAlt />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
