"use client";

import { useState } from "react";
import {
  BiBadge,
  BiHome,
} from "react-icons/bi";
import {
  MdAccountCircle,
  MdContactMail,
  MdMail,
  MdPhoneCallback,
  MdUpdate,
  MdWc,
  MdLocationOn,
  MdEdit,
} from "react-icons/md";
import { BsFillCalendarMonthFill } from "react-icons/bs";
import Link from "next/link";
import NoData from "@/app/NoData";
import { formatDateTime } from "@/app/utils/helper";
import { useToast } from "../../../../hooks/useToast";
import UpdateStatusPopup from "@/app/components/common/UpdateStatusPopupProps";
import { StatusBadge } from "../../../../components/common/StatusBadge";
import { useGetTeamMemberByIdQuery, useUpdateTeamMemberMutation, useUpdateAccountStatusMutation } from "@/app/services/adminApi";
import { TeamMemberUpdateData } from "@/app/types/team";
import EditTeamMember from "@/app/components/team/EditTeamMember";

// Loading component
const TeamDetailSkeleton = () => (
  <div className="flex-1 p-8 space-y-6">
    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
    <div className="flex gap-4 items-center">
      <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse" />
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
    </div>
    <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
  </div>
);

const TeamDetailClient = ({ team_id }: { team_id: string }) => {
  const { data, isLoading, isError } = useGetTeamMemberByIdQuery(team_id);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const toast = useToast();

  const user = data?.data?.admin;

  const [updateTeamMember, { isLoading: isUpdating }] = useUpdateTeamMemberMutation();
  
  const handleUpdateTeamMember = async (formData: TeamMemberUpdateData) => {
    try {
      await updateTeamMember({ memberId: team_id, data: formData }).unwrap();
      toast.success("Team member updated successfully");
      setShowEditModal(false);
    } catch {
      toast.error("Failed to update team member");
    }
  };

  const [updateStatus] = useUpdateAccountStatusMutation();

  const handleUpdateStatus = async (
    status: string,
    reason: string,
    is_active: boolean
  ) => {
    try {
      await updateStatus({ adminId: team_id, status }).unwrap();
      toast.success("Team member status updated");
      setShowUpdateStatusModal(false);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) return <TeamDetailSkeleton />;
  if (isError || !user) return <NoData />;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground relative">
      <div className="flex flex-col max-w-[1200px] flex-1 min-h-0 px-6 py-5">
        <div className="flex gap-2 px-4 py-2 mb-4">
          <Link
            className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal flex items-center gap-1 hover:text-primary"
            href="/dashboard"
          >
            <span className="material-symbols-outlined text-sm">
              <BiHome />
            </span>{" "}
            Home
          </Link>
          <span className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal">
            /
          </span>
          <Link
            className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal hover:text-primary"
            href="/team"
          >
            Team Manager
          </Link>
          <span className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal">
            /
          </span>
          <span className="text-[#111418] dark:text-white text-[13px] font-medium leading-normal">
            {user.first_name} {user.last_name}
          </span>
        </div>

        <div className="flex items-center gap-2 justify-between">
          {/* Profile Header */}
          <div className="flex gap-6 items-start">
            <div className="flex items-center justify-center h-16 w-16 bg-[#1a2332] text-white rounded-full font-bold text-xl uppercase tracking-wider">
              <p> {(user.first_name?.[0] || "") + (user.last_name?.[0] || "")}</p>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[#111418] dark:text-white text-[32px] font-bold leading-tight">
                  {user.first_name} {user.last_name}
                </h1>
                <span
                  className={`${
                    user.is_active
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20"
                  } text-xs font-bold px-2 py-1 rounded-full border uppercase tracking-wide`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                  {user.role}
                </span>
              </div>
              <p className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-normal leading-normal flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  <BiBadge />
                </span>
                Member ID: {user._id}
              </p>
              <p className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-normal leading-normal flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-[18px]">
                  <BsFillCalendarMonthFill />
                </span>
                Joined {formatDateTime(user.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] mr-1">
                <MdEdit />
              </span>
              <span className="truncate">Edit Profile</span>
            </button>
            <button
              onClick={() => setShowUpdateStatusModal(true)}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-[#111418] dark:text-white hover:bg-gray-50 dark:hover:bg-[#2a3855] text-sm font-bold shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] mr-1">
                <MdUpdate />
              </span>
              <span className="truncate">Update Status</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0 mt-8 mb-8 auto-rows-max">
          {/* Left Column: User Info & Stats */}
          <div className="flex flex-col gap-6">
            {/* Contact Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-100 dark:border-[#324467] shadow-sm">
              <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  <MdContactMail />
                </span>
                Contact Information
              </h3>

              <div className="flex flex-col gap-5">
                {/* Full Name */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl text-blue-600">
                    <MdAccountCircle size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-[#92a4c9] text-[11px] font-bold uppercase tracking-wider mb-0.5">
                      Full Name
                    </span>
                    <span className="text-slate-800 dark:text-white font-medium text-sm">
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                </div>
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl text-blue-600">
                    <MdMail size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-[#92a4c9] text-[11px] font-bold uppercase tracking-wider mb-0.5">
                      Email Address
                    </span>
                    <span className="text-slate-800 dark:text-white font-medium text-sm">
                      {user.email}
                    </span>
                  </div>
                </div>
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl text-blue-600">
                    <MdPhoneCallback size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-[#92a4c9] text-[11px] font-bold uppercase tracking-wider mb-0.5">
                      Phone Number
                    </span>
                    <span className="text-slate-800 dark:text-white font-medium text-sm">
                      {user?.phone || "Not provided"}
                    </span>
                  </div>
                </div>
                {/* Gender */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl text-blue-600">
                    <MdWc size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-[#92a4c9] text-[11px] font-bold uppercase tracking-wider mb-0.5">
                      Gender
                    </span>
                    <span className="text-slate-800 dark:text-white font-medium text-sm capitalize">
                      {user.gender || "Not specified"}
                    </span>
                  </div>
                </div>
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl text-blue-600">
                    <MdLocationOn size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-[#92a4c9] text-[11px] font-bold uppercase tracking-wider mb-0.5">
                      Primary Address
                    </span>
                    <span className="text-slate-800 dark:text-white font-medium text-sm">
                      {user.address || "No address provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Account Details Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-100 dark:border-[#324467] shadow-sm">
              <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-6 flex items-center gap-2">
                <MdAccountCircle className="text-primary text-xl" />
                Account Overview
              </h3>

              <div className="space-y-4">
                {/* Account Status */}
                <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-[#324467] group">
                  <span className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">
                    Account Status
                  </span>
                  <span className="text-[#111418] capitalize dark:text-white font-medium text-sm">
                    <StatusBadge status={user.status} />
                  </span>
                </div>

                {/* Email Verification */}
                <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-[#324467] group">
                  <span className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">
                    Verified Email
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md tracking-wide uppercase ${
                      user.isVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {user.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>

                {/* Role */}
                <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-[#324467] group">
                  <span className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">
                    Security Role
                  </span>
                  <span className="text-[#111418] dark:text-white font-medium text-sm capitalize">
                    {user.role}
                  </span>
                </div>

                {/* Last Login */}
                <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-[#324467] group">
                  <span className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">
                    Last Session
                  </span>
                  <span className="text-[#111418] dark:text-white font-medium text-sm">
                    {user.last_login_at
                      ? formatDateTime(user.last_login_at)
                      : "Never logged in"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpdateStatusPopup
        is_active={user.is_active}
        show={showUpdateStatusModal}
        currentStatus={user.status}
        onClose={() => setShowUpdateStatusModal(false)}
        onSubmit={handleUpdateStatus}
      />

      <EditTeamMember
        showEditModal={showEditModal}
        member={user}
        onClose={() => setShowEditModal(false)}
        handleSubmit={handleUpdateTeamMember}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default TeamDetailClient;
