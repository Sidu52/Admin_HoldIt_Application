"use client";

import { useState } from "react";
import {
  BiBadge,
  BiHome,
  BiEdit,
  BiCopy,
  BiCheck,
} from "react-icons/bi";
import {
  MdAccountCircle,
  MdContactMail,
  MdMail,
  MdPhoneCallback,
  MdWc,
  MdCake,
  MdLocationOn,
  MdSecurity,
  MdAdminPanelSettings,
  MdWarning,
} from "react-icons/md";
import { BsFillCalendarMonthFill } from "react-icons/bs";
import Link from "next/link";
import NoData from "@/app/NoData";
import { formatDateTime } from "@/app/utils/helper";
import { useToast } from "../../../../hooks/useToast";
import { StatusBadge } from "../../../../components/common/StatusBadge";
import {
  useGetTeamMemberByIdQuery,
  useUpdateTeamMemberMutation,
} from "@/app/services/adminApi";
import { TeamMember, TeamMemberUpdateData } from "@/app/types/team";
import EditTeamMember from "@/app/components/team/EditTeamMember";
import { VERIFICATION_STATUS } from "@/app/enum";

// Loading component
const TeamDetailSkeleton = () => (
  <div className="flex-1 p-8 space-y-6">
    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
    <div className="flex gap-4 items-center">
      <div className="h-16 w-16 bg-gray-200 dark:bg-slate-800 rounded-full animate-pulse" />
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-48 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-32 animate-pulse" />
      </div>
    </div>
    <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
  </div>
);

const TeamDetailClient = ({ team_id }: { team_id: string }) => {
  const { data, isLoading, isError } = useGetTeamMemberByIdQuery(team_id);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalTab, setEditModalTab] = useState<"personal" | "role" | "account">("personal");
  const [activeTab, setActiveTab] = useState<"profile" | "activity" | "security">("profile");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const toast = useToast();

  const user: TeamMember = data?.data;

  const [updateTeamMember, { isLoading: isUpdating }] = useUpdateTeamMemberMutation();

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenEditModal = (tab: "personal" | "role" | "account") => {
    setEditModalTab(tab);
    setShowEditModal(true);
  };

  const handleUpdateTeamMember = async (formData: TeamMemberUpdateData) => {
    try {
      await updateTeamMember({ memberId: team_id, data: formData }).unwrap();
      toast.success("Team member updated successfully");
      setShowEditModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update team member");
    }
  };

  if (isLoading) return <TeamDetailSkeleton />;
  if (isError || !user) return <NoData />;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground relative overflow-hidden">
      <div className="flex flex-col max-w-[1240px] w-full mx-auto flex-1 min-h-0 px-4 sm:px-6 py-5 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex gap-2 px-2 py-1 mb-3 shrink-0">
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

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-[#232f48] p-5 rounded-2xl border border-slate-200 dark:border-[#324467] shadow-xs shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
            <div className="flex items-center justify-center h-16 w-16 shrink-0 bg-purple-50 dark:bg-[#1a2333] text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-[#324467] rounded-2xl font-bold text-xl shadow-xs uppercase">
              <p>
                {user?.first_name?.[0]?.toUpperCase() || ""}
                {user?.last_name?.[0]?.toUpperCase() || "T"}
              </p>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-[#111418] dark:text-white text-2xl sm:text-3xl font-bold leading-tight">
                  {user.first_name} {user.last_name}
                </h1>
                <StatusBadge account_status={user.account_status} />
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 uppercase tracking-wider">
                  {user.role ? user.role.replace(/_/g, " ") : "STAFF"}
                </span>
                {user?.verification_status && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                      user.verification_status === VERIFICATION_STATUS.VERIFIED
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : user.verification_status === VERIFICATION_STATUS.REJECTED
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {user.verification_status}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[#637588] dark:text-[#92a4c9] text-[13px] mt-1">
                <p className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">
                    <BiBadge />
                  </span>
                  <span>Member ID: <code className="font-mono">{user?._id}</code></span>
                  <button
                    onClick={() => handleCopy(user?._id, "memberId")}
                    className="p-1 hover:text-primary transition-colors cursor-pointer"
                    title="Copy Member ID"
                  >
                    {copiedKey === "memberId" ? <BiCheck className="text-emerald-500" size={14} /> : <BiCopy size={14} />}
                  </button>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">
                    <BsFillCalendarMonthFill />
                  </span>
                  <span>Joined {formatDateTime(user?.createdAt)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button
              onClick={() => handleOpenEditModal("personal")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 cursor-pointer rounded-xl h-10 px-4 bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <BiEdit size={16} />
              <span>Edit Team Member</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-[#324467] mt-6 shrink-0">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdAccountCircle size={16} />
            <span>Profile & Permissions</span>
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BsFillCalendarMonthFill size={14} />
            <span>Activity & Audit</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "security"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdSecurity size={16} />
            <span>Account Security & Status</span>
          </button>
        </div>

        {/* TAB 1: PROFILE & PERMISSIONS */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-8">
            {/* Contact Information Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MdContactMail className="text-primary" size={20} />
                  Contact Information
                </h3>
                <button
                  onClick={() => handleOpenEditModal("personal")}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                >
                  <BiEdit size={14} /> Edit
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-primary">
                    <MdAccountCircle size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Full Name
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-primary">
                    <MdMail size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Work Email Address
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {user.email}
                      </p>
                      <button
                        onClick={() => handleCopy(user.email, "email")}
                        className="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                        title="Copy Email"
                      >
                        {copiedKey === "email" ? <BiCheck className="text-emerald-500" size={14} /> : <BiCopy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-primary">
                    <MdPhoneCallback size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Phone Number
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {user.phone || "Not provided"}
                      </p>
                      {user.phone && (
                        <button
                          onClick={() => handleCopy(user.phone, "phone")}
                          className="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                          title="Copy Phone"
                        >
                          {copiedKey === "phone" ? <BiCheck className="text-emerald-500" size={14} /> : <BiCopy size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-primary">
                      <MdWc size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Gender
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {user.gender ? user.gender.replace(/_/g, " ") : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-primary">
                      <MdCake size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Date of Birth
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {user.date_of_birth ? formatDateTime(user.date_of_birth, "date") : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {user.address && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-primary">
                      <MdLocationOn size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Office / Home Address
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {user.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Role & Access Permissions Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MdSecurity className="text-primary" size={20} />
                    Role & System Access
                  </h3>
                  <button
                    onClick={() => handleOpenEditModal("role")}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <BiEdit size={14} /> Change Role
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block mb-1">
                      Assigned System Role
                    </span>
                    <p className="text-lg font-black text-purple-900 dark:text-purple-200 uppercase tracking-wide">
                      {user.role ? user.role.replace(/_/g, " ") : "CUSTOMER SUPPORT"}
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438]">
                      <span className="text-slate-500 dark:text-slate-400">Portal Access</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Holdit Admin CRM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438]">
                      <span className="text-slate-500 dark:text-slate-400">Role Level</span>
                      <span className="font-bold text-slate-900 dark:text-white capitalize">
                        {user.role?.toLowerCase().replace(/_/g, " ") || "Standard Staff"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438]">
                      <span className="text-slate-500 dark:text-slate-400">KYC Verification</span>
                      <span className="font-bold uppercase tracking-wider text-primary font-mono">
                        {user.verification_status || "PENDING"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-[#2a3852] flex justify-end">
                <button
                  onClick={() => handleOpenEditModal("account")}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-colors cursor-pointer"
                >
                  Manage Account Operations & Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVITY & AUDIT */}
        {activeTab === "activity" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-8">
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
                <BsFillCalendarMonthFill className="text-primary" size={18} />
                Activity Timeline & Sessions
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-[#1c2438]">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Last Login Timestamp</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                    {user.last_login_at ? formatDateTime(user.last_login_at) : "Never logged in"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-[#1c2438]">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Account Registered</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                    {formatDateTime(user.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-[#1c2438]">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Profile Last Modified</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                    {formatDateTime(user.updatedAt)}
                  </span>
                </div>

                {user.invited_by && (
                  <div className="flex justify-between items-center py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-[#1c2438]">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Invited By</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                      {typeof user.invited_by === "object"
                        ? `${user.invited_by.first_name || ""} ${user.invited_by.last_name || ""}`.trim()
                        : user.invited_by}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
                  <MdAdminPanelSettings className="text-primary" size={20} />
                  Audit Governance
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-[#1c2438] p-4 rounded-xl border border-slate-100 dark:border-[#2d3b56]">
                  Every profile update, role elevation, or status change performed on this staff account is attributed to the acting administrator and recorded in the audit trail.
                </p>
              </div>
              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-[#2a3852] text-[11px] text-slate-400">
                Staff Account ID: <code className="font-mono">{user._id}</code>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACCOUNT SECURITY & STATUS */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-8">
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MdAdminPanelSettings className="text-primary" size={20} />
                  Account Status & Access Control
                </h3>
                <StatusBadge account_status={user.account_status} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-[#324467]">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Account Status
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      CRM login access state
                    </p>
                  </div>
                  <StatusBadge account_status={user.account_status} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-[#324467]">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Verification Status
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Staff credentials & onboarding
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
                    {user.verification_status || "PENDING"}
                  </span>
                </div>

                {user.account_deactivated_reason && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">
                      Reason for Deactivation / Suspension
                    </p>
                    <p className="text-xs text-rose-800 dark:text-rose-300">
                      {user.account_deactivated_reason}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-[#2a3852] flex justify-end">
                <button
                  onClick={() => handleOpenEditModal("account")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <BiEdit size={16} /> Edit Account Status & Reason
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <MdSecurity className="text-primary" size={20} />
                  Session & Token Governance
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
                    <MdWarning className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" size={18} />
                    <div className="space-y-1">
                      <p className="font-bold">Instant Token Revocation</p>
                      <p className="leading-relaxed">
                        Setting this staff account to <code className="font-mono text-rose-600">INACTIVE</code> or <code className="font-mono text-rose-600">SUSPENDED</code> immediately purges all active access tokens and Redis refresh tokens, forcing an immediate logout on all their devices.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852] space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Super Admin Safeguard
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Only a verified Super Admin can modify or deactivate other Super Admin accounts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-[#2a3852]">
                <p className="text-[11px] text-slate-400">
                  Last verified: {formatDateTime(user.updatedAt || user.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Team Member Sliding Drawer */}
      <EditTeamMember
        showEditModal={showEditModal}
        member={user}
        initialTab={editModalTab}
        isLoading={isUpdating}
        onClose={() => setShowEditModal(false)}
        handleSubmit={handleUpdateTeamMember}
      />
    </div>
  );
};

export default TeamDetailClient;
