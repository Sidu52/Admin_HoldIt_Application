"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  MdArrowBack,
  MdEdit,
  MdPeople,
  MdAdd,
  MdSearch,
  MdClose,
  MdReceipt,
} from "react-icons/md";
import { RiCoupon3Line } from "react-icons/ri";
import { useToast } from "@/app/hooks/useToast";
import {
  useGetCoupanQuery,
  useUpdateCoupanMutation,
  useAssignCouponMutation,
  useUnassignCouponMutation,
  useGetAssignedUsersQuery,
  useGetCouponRedemptionsQuery,
} from "@/app/services/coupan.Api";
import { useGetUsersQuery } from "@/app/services/userApi";
import Pagination from "@/app/components/common/Pagination";

function CouponDetailPage() {
  const { coupon_id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = coupon_id as string;

  // Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "assigned" | "redemptions">("overview");

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Pagination for assigned users and redemptions
  const [assignedPage, setAssignedPage] = useState(1);
  const [redemptionPage, setRedemptionPage] = useState(1);

  // RTK Query hooks
  const { data: couponData, isLoading } = useGetCoupanQuery(id, { skip: !id });
  const [updateCoupon] = useUpdateCoupanMutation();
  const [assignCoupon, { isLoading: isAssigning }] = useAssignCouponMutation();
  const [unassignCoupon] = useUnassignCouponMutation();

  const { data: assignedData } = useGetAssignedUsersQuery(
    { couponId: id, page: assignedPage, limit: 20 },
    { skip: !id || activeTab !== "assigned" }
  );

  const { data: redemptionsData } = useGetCouponRedemptionsQuery(
    { couponId: id, page: redemptionPage, limit: 20 },
    { skip: !id || activeTab !== "redemptions" }
  );

  const { data: usersData } = useGetUsersQuery(
    { page: 1, limit: 20, search: userSearchQuery },
    { skip: !assignModalOpen }
  );

  const coupon = couponData?.data?.coupon;
  const analytics = couponData?.data?.analytics;

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleToggleActive = async () => {
    if (!coupon) return;
    try {
      await updateCoupon({ id: coupon._id, isActive: !coupon.isActive }).unwrap();
      toast.success(coupon.isActive ? "Coupon deactivated" : "Coupon activated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const handleAssign = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      await assignCoupon({ couponId: id, userIds: selectedUserIds }).unwrap();
      toast.success(`Coupon assigned to ${selectedUserIds.length} user(s)`);
      setAssignModalOpen(false);
      setSelectedUserIds([]);
      setUserSearchQuery("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to assign");
    }
  };

  const handleUnassign = async (userId: string) => {
    try {
      await unassignCoupon({ couponId: id, userIds: [userId] }).unwrap();
      toast.success("Coupon unassigned");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to unassign");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full gap-4 bg-background-light dark:bg-background-dark">
        <p className="text-lg font-bold text-slate-400">Coupon not found</p>
        <button onClick={() => router.push("/coupans")} className="text-primary font-semibold hover:underline">
          ← Back to Coupons
        </button>
      </div>
    );
  }

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: <RiCoupon3Line /> },
    { key: "assigned" as const, label: `Assigned Users (${analytics?.assignedUsersCount || 0})`, icon: <MdPeople /> },
    { key: "redemptions" as const, label: `Redemptions (${analytics?.totalRedemptions || 0})`, icon: <MdReceipt /> },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark px-4 py-6 sm:p-8">
      {/* Back + Header */}
      <div className="shrink-0 mb-6">
        <button
          onClick={() => router.push("/coupans")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary font-medium mb-4 transition-colors"
        >
          <MdArrowBack className="text-lg" /> Back to Coupons
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <RiCoupon3Line className="text-3xl text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {coupon.name}
                </h1>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  coupon.isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 bg-primary/5 rounded-lg font-mono font-bold text-primary text-sm tracking-wide">
                {coupon.code}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleActive}
              className={`h-9 px-4 rounded-lg font-semibold text-sm transition-colors border ${
                coupon.isActive
                  ? "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
              }`}
            >
              {coupon.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => { setAssignModalOpen(true); setSelectedUserIds([]); setUserSearchQuery(""); }}
              className="h-9 px-4 bg-violet-500/10 text-violet-500 border border-violet-500/30 hover:bg-violet-500/20 rounded-lg font-semibold text-sm transition-colors flex items-center gap-1.5"
            >
              <MdPeople /> Assign Users
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 shrink-0">
        {[
          { label: "Total Redemptions", value: analytics?.totalRedemptions || 0, color: "text-blue-500" },
          { label: "Unique Users", value: analytics?.uniqueUsers || 0, color: "text-violet-500" },
          { label: "Total Discount Given", value: `₹${(analytics?.totalDiscountGiven || 0).toLocaleString()}`, color: "text-emerald-500" },
          { label: "Assigned Users", value: analytics?.assignedUsersCount || 0, color: "text-amber-500" },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700/50 mb-6 shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Coupon Details</h3>
              {[
                { label: "Scope", value: coupon.scope || "PUBLIC" },
                { label: "Discount Type", value: coupon.discountType },
                { label: "Discount Value", value: coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}` },
                { label: "Max Discount", value: coupon.maxDiscount ? `₹${coupon.maxDiscount}` : "No limit" },
                { label: "Min Order Value", value: `₹${coupon.minOrderValue || 0}` },
                { label: "Description", value: coupon.description || "—" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/30 last:border-0">
                  <span className="text-sm text-slate-500 font-medium">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Usage & Validity</h3>
              {[
                { label: "Usage Count", value: `${coupon.usageCount || 0}${coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}` },
                { label: "Per User Limit", value: coupon.perUserLimit || 1 },
                { label: "Start Date", value: formatDate(coupon.startsAt) },
                { label: "Expiry Date", value: formatDate(coupon.expiresAt) },
                { label: "Created", value: formatDate(coupon.createdAt) },
                { label: "Updated", value: formatDate(coupon.updatedAt) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/30 last:border-0">
                  <span className="text-sm text-slate-500 font-medium">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{String(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ASSIGNED USERS TAB */}
        {activeTab === "assigned" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 font-medium">
                {assignedData?.data?.pagination?.totalItems || 0} user(s) assigned
              </p>
              <button
                onClick={() => { setAssignModalOpen(true); setSelectedUserIds([]); setUserSearchQuery(""); }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-lg flex items-center gap-1.5"
              >
                <MdAdd /> Assign More
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500">User</th>
                    <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500">Usage</th>
                    <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500">Assigned At</th>
                    <th className="px-4 py-3 text-right font-bold text-[11px] uppercase tracking-widest text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                  {(assignedData?.data?.assignments || []).map((a: any) => (
                    <tr key={a._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{a.userId?.first_name} {a.userId?.last_name}</p>
                          <p className="text-xs text-slate-400">{a.userId?.email || a.userId?.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                          a.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>{a.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">{a.usageCount || 0}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(a.assignedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {a.status === "ACTIVE" && (
                          <button
                            onClick={() => handleUnassign(a.userId?._id)}
                            className="px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(assignedData?.data?.assignments || []).length === 0 && (
                <div className="text-center py-12">
                  <MdPeople className="text-4xl text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No users assigned yet</p>
                </div>
              )}
            </div>

            {assignedData?.data?.pagination?.totalPages > 1 && (
              <Pagination
                currentPage={assignedData.data.pagination.currentPage}
                totalPages={assignedData.data.pagination.totalPages}
                onPageChange={setAssignedPage}
              />
            )}
          </div>
        )}

        {/* REDEMPTIONS TAB */}
        {activeTab === "redemptions" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500">User</th>
                    <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500">Discount</th>
                    <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500">Redeemed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                  {(redemptionsData?.data?.redemptions || []).map((r: any) => (
                    <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {r.userId?.first_name} {r.userId?.last_name}
                          </p>
                          <p className="text-xs text-slate-400">{r.userId?.email || r.userId?.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-500">₹{r.discountAmount}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(r.redeemedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(redemptionsData?.data?.redemptions || []).length === 0 && (
                <div className="text-center py-12">
                  <MdReceipt className="text-4xl text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No redemptions yet</p>
                </div>
              )}
            </div>

            {redemptionsData?.data?.pagination?.totalPages > 1 && (
              <Pagination
                currentPage={redemptionsData.data.pagination.currentPage}
                totalPages={redemptionsData.data.pagination.totalPages}
                onPageChange={setRedemptionPage}
              />
            )}
          </div>
        )}
      </div>

      {/* ASSIGN USERS MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700/50 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assign Coupon to Users</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Coupon: <span className="font-mono font-bold text-primary">{coupon.code}</span>
                </p>
              </div>
              <button onClick={() => setAssignModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-400">
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 shrink-0">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {selectedUserIds.length > 0 && (
                <p className="text-xs text-primary font-semibold mt-2">{selectedUserIds.length} user(s) selected</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {(usersData?.data?.users || []).map((user: any) => (
                <label
                  key={user._id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedUserIds.includes(user._id)
                      ? "bg-primary/5 dark:bg-primary/10 border border-primary/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/30 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user._id)}
                    onChange={() => {
                      setSelectedUserIds((prev) =>
                        prev.includes(user._id) ? prev.filter((id) => id !== user._id) : [...prev, user._id]
                      );
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.email || user.phone}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700/50 shrink-0">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={isAssigning || selectedUserIds.length === 0}
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isAssigning && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Assign ({selectedUserIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CouponDetailPage;
