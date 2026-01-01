"use client";
import {
  UserFilters,
  UserTable,
  UserHeader,
} from "@/app/components/user_management";
import { useUsers } from "@/app/hooks/useUserManager";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setUsers } from "@/app/store/slices/usersSlice";
import UserSkeleton from "@/app/loading/user/UserSkeleton";

export default function Home() {
  const dispatch = useAppDispatch();
  const { search, status, pagination } = useAppSelector((state) => state.users);
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useUsers({
    page: pagination.currentPage,
    limit: pagination.itemsPerPage,
    status,
    search,
  });

  // Dispatch actions on data updates
  useEffect(() => {
    if (userData) {
      dispatch(setUsers(userData.data.data));
    }
  }, [userData, dispatch]);

  if (userLoading) return <UserSkeleton />;

  return (
    <main className="flex-1 flex flex-col items-center py-6 px-4 md:px-8">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <UserHeader />
        <UserFilters />
        <UserTable />
      </div>
    </main>
  );
}
