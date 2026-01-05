"use client";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { fetchUserByIdThunk } from "@/app/store/thunks/userThunks";
import {
  BiBadge,
  BiBlock,
  BiCheckCircle,
  BiEdit,
  BiHome,
} from "react-icons/bi";
import {
  MdAccountCircle,
  MdContactMail,
  MdLocationOn,
  MdLockReset,
  MdMail,
  MdPhoneCallback,
} from "react-icons/md";
import { UserDetailSkeleton } from "@/app/loading/user";
import { EditUserDetails } from "@/app/components/user_management";
import { BsFillCalendarMonthFill } from "react-icons/bs";

const UserDetail = ({ user_id }: { user_id: string }) => {
  const dispatch = useAppDispatch();
  const [showEditModal, setShowEditModal] = useState(false);
  const {
    currentUser: user,
    operationLoading,
    operationError,
  } = useAppSelector((state) => state.user);

  const formattedDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  useEffect(() => {
    dispatch(fetchUserByIdThunk(user_id));
  }, [dispatch, user_id]);

  if (operationLoading) {
    return <UserDetailSkeleton />;
  } else if (operationError || !user) {
    return <div>User Not Found</div>;
  }

  return (
    <div className="layout-container flex h-full grow flex-col">
      <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
        <div className="flex flex-col max-w-[1200px] flex-1">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 px-4 py-2 mb-4">
            <a
              className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal flex items-center gap-1 hover:text-primary"
              href="/dashboard"
            >
              <span className="material-symbols-outlined text-sm">
                <BiHome />
              </span>{" "}
              Home
            </a>
            <span className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal">
              /
            </span>
            <a
              className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal hover:text-primary"
              href="/users"
            >
              User Manager
            </a>
            <span className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal">
              /
            </span>
            <span className="text-[#111418] dark:text-white text-[13px] font-medium leading-normal">
              {user.first_name} {user.last_name}
            </span>
          </div>

          {/* Profile Header */}
          <div className="flex px-4 py-2 mb-6">
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:justify-between lg:items-end">
              <div className="flex gap-6 items-start">
                <div className="flex items-center justify-center px-4 py-3.5 bg-[#f0f2f4] dark:bg-[#324467] rounded-full">
                  <p> {user.first_name[0] + user.last_name[0]}</p>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-[#111418] dark:text-white text-[32px] font-bold leading-tight">
                      {user.first_name} {user.last_name}
                    </h1>
                    <span
                      className={`bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wide`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-normal leading-normal flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      <BiBadge />
                    </span>
                    User ID: {user._id}
                  </p>
                  <p className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-normal leading-normal flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-[18px]">
                      <BsFillCalendarMonthFill />
                    </span>
                    Joined {formattedDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex w-full lg:w-auto gap-3 flex-wrap">
                <button
                  onClick={() => setShowEditModal(!showEditModal)}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-blue-700 text-white text-sm font-bold"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    <BiEdit />
                  </span>
                  <span className="truncate">Edit Profile</span>
                </button>
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-[#111418] dark:text-white hover:bg-gray-50 dark:hover:bg-[#2a3855] text-sm font-bold">
                  <span className="material-symbols-outlined text-[20px]">
                    <MdLockReset />
                  </span>
                  <span className="truncate">Reset Password</span>
                </button>
                <button
                  className="flex min-w-[40px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-3 bg-white dark:bg-[#232f48] border border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold"
                  title="Suspend User"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    <BiBlock />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 px-4 h-full overflow-y-auto">
            {/* Left Column: User Info & Stats */}
            <div className="flex flex-col gap-6">
              {/* Contact Card */}
              <div className="bg-white dark:bg-[#232f48] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
                <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    <MdContactMail />
                  </span>
                  Contact Information
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        <MdMail />
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                        Email Address
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#111418] dark:text-white font-medium text-sm">
                          {user.email}
                        </span>
                        <span
                          className="material-symbols-outlined text-emerald-500 text-[16px]"
                          title="Verified"
                        >
                          <BiCheckCircle />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        <MdPhoneCallback />
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                        Phone
                      </span>
                      <span className="text-[#111418] dark:text-white font-medium text-sm">
                        {user.auth_user_id?.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        <MdLocationOn />
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                        Location
                      </span>
                      <span className="text-[#111418] dark:text-white font-medium text-sm">
                        {user.address || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details Card */}
              <div className="bg-white dark:bg-[#232f48] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
                <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    <MdAccountCircle />
                  </span>
                  Account Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                      Last Login
                    </span>
                    <span className="text-[#111418] dark:text-white font-medium text-sm">
                      {formattedDate(user.last_login_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                      Status
                    </span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        user.is_active
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showEditModal && 
      <EditUserDetails 
      userData={user}
      onClose={() => setShowEditModal(false)}
       />}

    </div>
  );
};

export default UserDetail;
