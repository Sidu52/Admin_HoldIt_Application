"use client";

import { useState } from "react";
import { User, UserRole, UserStatus } from "@/app/types/usermanager";
import UserTableRow from "./UserTableRow";
import { useAppSelector } from "@/app/store/hooks";
import { useSelector } from "react-redux";
import NoData from "@/app/NoData";
import { useRouter } from "next/navigation";
import Pagination from "../common/Pagination";

export default function UserTable() {
  const router = useRouter();
  const { users, pagination } = useAppSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 9;

  const handleViewDetails = (userId: string) => {
    console.log("View details for user:", userId);
    router.push(`/users/${userId}`);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {};

  if (users && users.length === 0) {
    return <NoData />;
  }

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-[#324467] overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#192233] border-b border-slate-200 dark:border-[#324467]">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider hidden sm:table-cell">
                Email
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider hidden md:table-cell">
                Joined Date
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#324467]">
            {users.map((user) => (
              <UserTableRow
                key={user._id}
                user={user}
                onViewDetails={handleViewDetails}
              />
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
