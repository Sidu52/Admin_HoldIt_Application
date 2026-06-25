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
} from "../../../services/adminApi";
import { useToast } from "../../../hooks/useToast";
import { TeamMemberFilter, TeamMemberTable } from "@/app/components/team";
import InviteMemberModal from "@/app/components/team/InviteMemberModal";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { hasControl } from "@/app/utils/role";

function TeamClient() {
  const router = useRouter();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filter, setFilter] = useState({ search: "", account_status: "all", role: "all" });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeamMember, setSelectTeamMember] = useState<TeamMember[]>([]);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const canControl = hasControl(loggedInUser?.role, "teams");

  // Mutation
  const [inviteTeamMember, { isLoading: isInviting }] = useInviteTeamMemberMutation();

  const toast = useToast();
  const { data, isLoading, isFetching, isError } = useGetTeamQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: filter.search,
    account_status: filter.account_status === "all" ? undefined : filter.account_status,
    role: filter.role === "all" ? undefined : filter.role,
  });

  const [deleteAdmins, { isLoading: isDeleting }] = useDeleteAdminsMutation();

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

  const handleFilterChange = ({ search, account_status, role }: { search: string; account_status: string; role: string }) => {
    setFilter({ search, account_status, role });
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

      {/* FILTERS */}
      <TeamMemberFilter filter={filter} onFilterChange={handleFilterChange} />

      <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {teamMember.length === 0 ? (
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
