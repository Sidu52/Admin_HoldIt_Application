"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineDelete, MdAdd } from "react-icons/md";
import { FaUsersCog } from "react-icons/fa";
import { DeleteConfirmationModal } from "@/app/components/common";
import NoData from "@/app/NoData";
import { TeamMember } from "@/app/types/team";
import {
  useGetTeamQuery,
  useDeleteAdminsMutation,
  useInviteTeamMemberMutation,
  useGetJoinRequestsQuery,
  useApproveJoinRequestMutation,
  useRejectJoinRequestMutation,
} from "../../../services/adminApi";
import { useToast } from "../../../hooks/useToast";
import { TeamMemberFilter, TeamMemberTable } from "@/app/components/team";
import InviteMemberModal from "@/app/components/team/InviteMemberModal";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { hasControl } from "@/app/utils/role";
import { TableSkeleton } from "@/app/components/common/Skeleton";
import { FaUserPlus, FaCheck, FaTimes, FaUserClock } from "react-icons/fa";

function TeamClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"members" | "requests">("members");
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filter, setFilter] = useState({
    search: "",
    account_status: "",
    verification_status: "",
    role: "",
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeamMember, setSelectTeamMember] = useState<TeamMember[]>([]);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const canControl = hasControl(loggedInUser?.role, "teams");

  // Mutations & Queries
  const [inviteTeamMember, { isLoading: isInviting }] = useInviteTeamMemberMutation();
  const [approveJoinRequest, { isLoading: isApproving }] = useApproveJoinRequestMutation();
  const [rejectJoinRequest, { isLoading: isRejecting }] = useRejectJoinRequestMutation();

  const toast = useToast();
  const { data, isLoading, isFetching, isError } = useGetTeamQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: filter.search || undefined,
    account_status: filter.account_status && filter.account_status !== "all" ? filter.account_status : undefined,
    verification_status: filter.verification_status && filter.verification_status !== "all" ? filter.verification_status : undefined,
    role: filter.role && filter.role !== "all" ? filter.role : undefined,
  });

  const { data: requestsData, isLoading: requestsLoading } = useGetJoinRequestsQuery();
  const joinRequests = requestsData?.data?.requests || [];

  const [deleteAdmins, { isLoading: isDeleting }] = useDeleteAdminsMutation();

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveJoinRequest(requestId).unwrap();
      toast.success("Join request approved! Login credentials sent and member added to team.");
      setActiveTab("members");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to approve join request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt("Enter reason for rejecting this join request:");
    if (reason !== null) {
      try {
        await rejectJoinRequest({ id: requestId, rejectionReason: reason.trim() }).unwrap();
        toast.success("Join request rejected");
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to reject join request");
      }
    }
  };

  const handleViewDetail = (teamMember: TeamMember) => router.push(`/team/${teamMember._id}`);

  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleDeleteTeamMember = async () => {
    try {
      const ids = memberToDelete ? [memberToDelete._id] : selectedTeamMember.map((u) => u._id);
      await deleteAdmins({ auth_id: ids }).unwrap();
      toast.success("Team members successfully deleted");
      setSelectTeamMember([]);
      setMemberToDelete(null);
      
      setShowDeleteModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete team members");
    }
  };

  const handleInviteMember = async (data: { email: string; role: string }) => {
    try {
      await inviteTeamMember(data).unwrap();
      toast.success("Team member invited successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to invite team member");
    }
  };

  const handleFilterChange = ({
    search,
    account_status,
    verification_status,
    role,
  }: {
    search: string;
    account_status: string;
    verification_status?: string;
    role: string;
  }) => {
    setFilter({
      search,
      account_status,
      verification_status: verification_status || "",
      role,
    });
    setPagination((p) => ({ ...p, page: 1 }));
  };

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading team...</p>
      </div>
    </div>
  );
  if (isError || !data) return <NoData />;

  const teamMember = data.data.teams || [];
  const paginationData = data?.data?.pagination;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background text-foreground py-4 px-6 relative">
      {/* HEADER */}
      <header className="flex flex-col gap-6 pt-6 pb-2 shrink-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col max-w-2xl gap-1.5">
            <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
              Team Management
            </h1>
            <p className="text-slate-500 dark:text-text-muted-dark text-sm leading-relaxed">
              Manage and view all registered team members across the platform through an
              editorial-grade interface designed for high-level orchestration.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {canControl && selectedTeamMember.length > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 h-10 px-4 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors"
              >
                <MdOutlineDelete size={18} />
                Delete ({selectedTeamMember.length})
              </button>
            )}
            {canControl && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                <MdAdd size={20} />
                Add Team Member
              </button>
            )}
            <div className="bg-[#f8f9fc] dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 flex items-center justify-between min-w-[200px] shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 dark:text-text-muted-dark uppercase tracking-widest">
                  Total Members
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {paginationData?.totalItems?.toLocaleString() ?? data?.totalRecords?.toLocaleString() ?? "0"}
                </span>
              </div>
              <div className="h-10 w-10 bg-[#1a2332] rounded-xl flex items-center justify-center text-white shadow-md ml-4">
                <FaUsersCog size={18} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tabs Header ── */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-2">
        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === "members"
              ? "bg-primary text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <FaUsersCog /> Team Members ({data?.data?.pagination?.totalItems ?? teamMember.length})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === "requests"
              ? "bg-primary text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <FaUserClock /> Join Requests ({joinRequests.filter((r: any) => r.status === "PENDING").length})
        </button>
      </div>

      {activeTab === "members" && (
        <TeamMemberFilter filter={filter} onFilterChange={handleFilterChange} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "requests" ? (
          requestsLoading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : joinRequests.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-xs font-medium">
              No team join requests found.
            </div>
          ) : (
            <div className="overflow-x-auto flex-1 bg-white dark:bg-[#1a2332] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-sm">
                  <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Applicant</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Contact</th>
                    <th className="py-3.5 px-4">Desired Role</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Experience / Notes</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Submitted At</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                  {joinRequests.map((req: any) => (
                    <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div>
                          {`${req.first_name || ""} ${req.last_name || ""}`.trim()}
                          <p className="sm:hidden text-[11px] font-normal text-slate-400 mt-0.5">{req.email}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5 hidden sm:table-cell">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{req.email}</p>
                        <p className="text-[11px] text-slate-400">{req.phone}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-primary uppercase text-[11px]">
                        {req.desired_role}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400 hidden md:table-cell">
                        {req.experience_notes || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 hidden sm:table-cell">
                        {new Date(req.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : req.status === "REJECTED"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === "PENDING" && canControl && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveRequest(req._id)}
                              disabled={isApproving}
                              title="Approve & Send Invite Link"
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <FaCheck className="text-[10px]" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req._id)}
                              disabled={isRejecting}
                              title="Reject Request"
                              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <FaTimes className="text-[10px]" /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : teamMember.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <p className="text-sm">
                No team members found for the current filters.
              </p>
            </div>
          </div>
        ) : (
          <TeamMemberTable
            teamMember={teamMember}
            selectedTeamMember={selectedTeamMember}
            onSelectionChange={setSelectTeamMember}
            onViewDetails={handleViewDetail}
            onDeleteClick={handleDeleteClick}
            actorRole={loggedInUser?.role}
            pagination={{
              page: paginationData?.page ?? 1,
              totalPages: paginationData?.totalPages ?? 1,
            }}
            onPageChange={(page: number) => setPagination((p) => ({ ...p, page }))}
          />
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          count={memberToDelete ? 1 : selectedTeamMember.length}
          modalTitle="team member"
          modalDescription="This action cannot be undone."
          loading={isDeleting}
          onClose={() => {
            setShowDeleteModal(false);
            setMemberToDelete(null);
          }}
          onConfirm={handleDeleteTeamMember}
        />
      )}

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInviteMember}
      />
    </div>
  );
}

export default TeamClient;
