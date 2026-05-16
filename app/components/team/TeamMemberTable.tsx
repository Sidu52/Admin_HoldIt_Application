"use client";

import React, { useCallback, useMemo } from "react";
import Pagination from "../common/Pagination";
import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import { getStatusBadge } from "../common/GetStatus";
import { TeamMember } from "@/app/types/team";
import { formatDateTime, getFullName, getUserNameFirstChar } from "@/app/utils/helper";

interface PaginationProps {
  page: number;
  totalPages: number;
}

interface TeamMemberTableProps {
  teamMember: TeamMember[];
  selectedTeamMember: TeamMember[];
  onSelectionChange: (members: TeamMember[]) => void;
  onViewDetails: (member: TeamMember) => void;
  onDeleteClick: () => void;
  pagination: PaginationProps;
  onPageChange: (page: number) => void;
}

const TeamMemberTable: React.FC<TeamMemberTableProps> = ({
  teamMember,
  selectedTeamMember,
  onSelectionChange,
  onViewDetails,
  onDeleteClick,
  pagination,
  onPageChange,
}) => {
  const selectedIds = useMemo(
    () => new Set(selectedTeamMember.map((u) => u._id)),
    [selectedTeamMember]
  );

  const allSelected = teamMember.length > 0 && teamMember.every((u) => selectedIds.has(u._id));
  const someSelected = teamMember.some((u) => selectedIds.has(u._id));

  const handleSelectMember = useCallback(
    (member: TeamMember) => {
      if (selectedIds.has(member._id)) {
        onSelectionChange(selectedTeamMember.filter((u) => u._id !== member._id));
      } else {
        onSelectionChange([...selectedTeamMember, member]);
      }
    },
    [selectedIds, selectedTeamMember, onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      const remaining = selectedTeamMember.filter(
        (u) => !teamMember.some((data) => data._id === u._id)
      );
      onSelectionChange(remaining);
    } else {
      const merged = [
        ...selectedTeamMember.filter((u) => !teamMember.some((data) => data._id === u._id)),
        ...teamMember,
      ];
      onSelectionChange(merged);
    }
  }, [allSelected, teamMember, selectedTeamMember, onSelectionChange]);

  return (
    <div className="card-premium overflow-hidden border-none shadow-none bg-transparent">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-background-light dark:bg-background-dark">
              <th className="sticky top-0 z-10 px-6 py-4 text-center border-b border-border-light dark:border-border-dark">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
                  onChange={handleSelectAll}
                  className="rounded-md border-border-light dark:border-border-dark text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer transition-all"
                />
              </th>
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">
                Team Member
              </th>
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark hidden lg:table-cell">
                Contact
              </th>
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">
                Status
              </th>
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">
                Role
              </th>
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark hidden md:table-cell">
                Last Activity
              </th>
              <th className="sticky top-0 z-10 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
            {teamMember.map((team) => (
              <tr
                key={team._id}
                className={`group hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors ${selectedIds.has(team._id) ? "bg-primary/5" : ""}`}
              >
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(team._id)}
                    onChange={() => handleSelectMember(team)}
                    className="rounded-md border-border-light dark:border-border-dark text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer transition-all"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-primary/20">
                      {getUserNameFirstChar(team.first_name, team.last_name)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark leading-none mb-1">
                        {getFullName(team.first_name, team.last_name)}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-tight">
                        TM-{team._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-xs font-medium text-text-main-light dark:text-text-main-dark">
                    {team.phone || "-"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(team.status)}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg bg-background-light dark:bg-background-dark text-[11px] font-bold text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark uppercase tracking-wider">
                    {team.role ? team.role.replace("_", " ") : "-"}
                  </span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark">
                    {team.last_login_at ? formatDateTime(team.last_login_at, "date") : "Never"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onViewDetails(team)}
                      className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:text-primary hover:bg-primary/10 transition-all"
                      title="Edit"
                    >
                      <MdOutlineEdit size={18} />
                    </button>
                    <button
                      onClick={onDeleteClick}
                      className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:text-rose-600 hover:bg-rose-500/10 transition-all"
                      title="Delete"
                    >
                      <MdOutlineDelete size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {teamMember.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <p className="text-sm font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">No team members found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 bg-background-light/30 dark:bg-background-dark/30 border-t border-border-light dark:border-border-dark">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            siblingCount={1}
          />
        </div>
      )}
    </div>
  );
};

export default TeamMemberTable;
