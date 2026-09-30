"use client";

import { useRouter } from "next/navigation";
import React, { useState, useMemo, useCallback } from "react";
import { CiDiscount1 } from "react-icons/ci";
import {
  MdOutlineDelete,
  MdAdd,
  MdEdit,
  MdSearch,
  MdClose,
  MdPeople,
  MdFilterList,
  MdVisibility,
} from "react-icons/md";
import { RiCoupon3Line } from "react-icons/ri";
import { DeleteConfirmationModal } from "@/app/components/common";
import Pagination from "@/app/components/common/Pagination";
import { useToast } from "@/app/hooks/useToast";
import {
  useGetCoupansQuery,
  useCreateCoupanMutation,
  useUpdateCoupanMutation,
  useDeleteCoupanMutation,
  useAssignCouponMutation,
  useUnassignCouponMutation,
  useGetAssignedUsersQuery,
} from "@/app/services/coupan.Api";
import { useGetUsersQuery } from "@/app/services/userApi";

// ─── TYPE DEFINITIONS ───────────────────────────────────────────────────────────

interface CouponFormData {
  code: string;
  name: string;
  description: string;
  scope: "PUBLIC" | "ASSIGNED";
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxDiscount: number | null;
  minOrderValue: number;
  startsAt: string;
  expiresAt: string;
  usageLimit: number | null;
  perUserLimit: number;
  isActive: boolean;
}

const EMPTY_FORM: CouponFormData = {
  code: "",
  name: "",
  description: "",
  scope: "PUBLIC",
  discountType: "PERCENTAGE",
  discountValue: 0,
  maxDiscount: null,
  minOrderValue: 0,
  startsAt: "",
  expiresAt: "",
  usageLimit: null,
  perUserLimit: 1,
  isActive: true,
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

function CoupanClient() {
  const router = useRouter();
  const toast = useToast();

  // Pagination & Filters
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filter, setFilter] = useState({ search: "", scope: "", isActive: "" });

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState<CouponFormData>(EMPTY_FORM);
  const [deleteModal, setDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<any>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignCouponTarget, setAssignCouponTarget] = useState<any>(null);
  const [assignedUsersModal, setAssignedUsersModal] = useState(false);
  const [assignedUsersCoupon, setAssignedUsersCoupon] = useState<any>(null);

  // User search for assignment
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // RTK Query hooks
  const { data, isLoading, isFetching } = useGetCoupansQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: filter.search || undefined,
    scope: filter.scope || undefined,
    isActive: filter.isActive !== "" ? filter.isActive : undefined,
  });

  const [createCoupon, { isLoading: isCreating }] = useCreateCoupanMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCoupanMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCoupanMutation();
  const [assignCoupon, { isLoading: isAssigning }] = useAssignCouponMutation();
  const [unassignCoupon] = useUnassignCouponMutation();

  // User search for assign modal
  const { data: usersData } = useGetUsersQuery(
    { page: 1, limit: 20, search: userSearchQuery },
    { skip: !assignModalOpen }
  );

  // Assigned users query
  const { data: assignedUsersData } = useGetAssignedUsersQuery(
    { couponId: assignedUsersCoupon?._id, page: 1, limit: 50 },
    { skip: !assignedUsersModal || !assignedUsersCoupon?._id }
  );

  const coupons = data?.data?.coupons || [];
  const paginationData = data?.data?.pagination;

  // ── HANDLERS ──────────────────────────────────────────────────────────────────

  const openCreateModal = useCallback(() => {
    setEditingCoupon(null);
    setFormData(EMPTY_FORM);
    setFormModalOpen(true);
  }, []);

  const openEditModal = useCallback((coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      name: coupon.name || "",
      description: coupon.description || "",
      scope: coupon.scope || "PUBLIC",
      discountType: coupon.discountType || "PERCENTAGE",
      discountValue: coupon.discountValue || 0,
      maxDiscount: coupon.maxDiscount ?? null,
      minOrderValue: coupon.minOrderValue || 0,
      startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : "",
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
      usageLimit: coupon.usageLimit ?? null,
      perUserLimit: coupon.perUserLimit || 1,
      isActive: coupon.isActive ?? true,
    });
    setFormModalOpen(true);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        maxDiscount: formData.maxDiscount || null,
        usageLimit: formData.usageLimit || null,
      };

      if (editingCoupon) {
        await updateCoupon({ id: editingCoupon._id, ...payload }).unwrap();
        toast.success("Coupon updated successfully");
      } else {
        await createCoupon(payload).unwrap();
        toast.success("Coupon created successfully");
      }
      setFormModalOpen(false);
      setEditingCoupon(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
      await deleteCoupon(couponToDelete._id).unwrap();
      toast.success("Coupon deleted successfully");
      setDeleteModal(false);
      setCouponToDelete(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete coupon");
    }
  };

  const handleAssign = async () => {
    if (!assignCouponTarget || selectedUserIds.length === 0) return;
    try {
      await assignCoupon({
        couponId: assignCouponTarget._id,
        userIds: selectedUserIds,
      }).unwrap();
      toast.success(`Coupon assigned to ${selectedUserIds.length} user(s)`);
      setAssignModalOpen(false);
      setSelectedUserIds([]);
      setUserSearchQuery("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to assign coupon");
    }
  };

  const handleUnassign = async (couponId: string, userId: string) => {
    try {
      await unassignCoupon({ couponId, userIds: [userId] }).unwrap();
      toast.success("Coupon unassigned successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to unassign coupon");
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (coupon: any) => {
    if (!coupon.isActive) return "bg-red-500/10 text-red-400 border-red-500/20";
    const now = new Date();
    if (new Date(coupon.expiresAt) < now) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  };

  const getStatusLabel = (coupon: any) => {
    if (!coupon.isActive) return "Inactive";
    const now = new Date();
    if (new Date(coupon.expiresAt) < now) return "Expired";
    return "Active";
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark px-4 py-6 sm:p-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 sm:mb-8 shrink-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <CiDiscount1 className="text-2xl" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-text-main-light dark:text-text-main-dark">
              Coupons Management
            </h1>
          </div>
          <p className="text-text-muted-light dark:text-text-muted-dark font-medium tracking-wide">
            Create, manage, and assign coupons to users across the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#f8f9fc] dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 dark:text-text-muted-dark uppercase tracking-widest">Total Coupons</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {paginationData?.totalItems?.toLocaleString() ?? "0"}
              </span>
            </div>
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md">
              <RiCoupon3Line className="text-xl" />
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="h-11 px-5 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
          >
            <MdAdd className="text-lg" />
            Create Coupon
          </button>
        </div>
      </header>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3 mb-6 shrink-0">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Search by code, name..."
            value={filter.search}
            onChange={(e) => {
              setFilter((f) => ({ ...f, search: e.target.value }));
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="w-full h-10 pl-10 pr-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <select
          value={filter.scope}
          onChange={(e) => {
            setFilter((f) => ({ ...f, scope: e.target.value }));
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="h-10 px-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="">All Scopes</option>
          <option value="PUBLIC">Public</option>
          <option value="ASSIGNED">Assigned</option>
        </select>
        <select
          value={filter.isActive}
          onChange={(e) => {
            setFilter((f) => ({ ...f, isActive: e.target.value }));
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="h-10 px-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-300 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
              <RiCoupon3Line className="text-4xl text-slate-400" />
            </div>
            <p className="text-sm font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">
              No coupons found
            </p>
            <button onClick={openCreateModal} className="text-primary text-sm font-semibold hover:underline">
              Create your first coupon →
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700/50">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Code</th>
                  <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Name</th>
                  <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Scope</th>
                  <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Discount</th>
                  <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Usage</th>
                  <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Assigned</th>
                  <th className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Valid Period</th>
                  <th className="px-4 py-3 text-right font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                {coupons.map((coupon: any) => (
                  <tr
                    key={coupon._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 dark:bg-primary/10 rounded-lg font-mono font-bold text-primary text-xs tracking-wide">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                          {coupon.name}
                        </span>
                        {coupon.description && (
                          <span className="text-xs text-slate-400 truncate max-w-[180px]">{coupon.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                        coupon.scope === "ASSIGNED"
                          ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {coupon.scope || "PUBLIC"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {coupon.discountType === "PERCENTAGE"
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue}`}
                      </span>
                      {coupon.maxDiscount && (
                        <span className="block text-xs text-slate-400">Max ₹{coupon.maxDiscount}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${getStatusColor(coupon)}`}>
                        {getStatusLabel(coupon)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                      {coupon.usageCount || 0}
                      {coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => { setAssignedUsersCoupon(coupon); setAssignedUsersModal(true); }}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        <MdPeople className="text-base" />
                        {coupon.assignedUsersCount || 0}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col gap-0.5">
                        <span>{formatDate(coupon.startsAt)}</span>
                        <span className="text-slate-400">→ {formatDate(coupon.expiresAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/coupans/${coupon._id}`)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-primary transition-colors"
                          title="View Details"
                        >
                          <MdVisibility className="text-lg" />
                        </button>
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <MdEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => { setAssignCouponTarget(coupon); setAssignModalOpen(true); setSelectedUserIds([]); setUserSearchQuery(""); }}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-violet-500 transition-colors"
                          title="Assign to Users"
                        >
                          <MdPeople className="text-lg" />
                        </button>
                        <button
                          onClick={() => { setCouponToDelete(coupon); setDeleteModal(true); }}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <MdOutlineDelete className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {paginationData && paginationData.totalPages > 1 && (
          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
          />
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* CREATE / EDIT MODAL                                                     */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl w-full max-w-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {editingCoupon ? "Update coupon details below" : "Fill in the details to create a new coupon"}
                </p>
              </div>
              <button onClick={() => setFormModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-400 transition-colors">
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Coupon Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SUMMER25"
                    required
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Coupon Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Summer Sale 25% Off"
                    required
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description..."
                  rows={2}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Scope */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scope</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData((f) => ({ ...f, scope: e.target.value as "PUBLIC" | "ASSIGNED" }))}
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    <option value="PUBLIC">Public (All Users)</option>
                    <option value="ASSIGNED">Assigned (Specific Users)</option>
                  </select>
                </div>

                {/* Discount Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData((f) => ({ ...f, discountType: e.target.value as "PERCENTAGE" | "FIXED" }))}
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Discount Value {formData.discountType === "PERCENTAGE" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData((f) => ({ ...f, discountValue: Number(e.target.value) }))}
                    min={0}
                    max={formData.discountType === "PERCENTAGE" ? 100 : undefined}
                    required
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Max Discount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount ?? ""}
                    onChange={(e) => setFormData((f) => ({ ...f, maxDiscount: e.target.value ? Number(e.target.value) : null }))}
                    min={0}
                    placeholder="No limit"
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Min Order Value */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Min Order (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData((f) => ({ ...f, minOrderValue: Number(e.target.value) }))}
                    min={0}
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Per User Limit */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Per User Limit</label>
                  <input
                    type="number"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData((f) => ({ ...f, perUserLimit: Number(e.target.value) }))}
                    min={1}
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Starts At */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) => setFormData((f) => ({ ...f, startsAt: e.target.value }))}
                    required
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Expires At */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expiry Date</label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData((f) => ({ ...f, expiresAt: e.target.value }))}
                    required
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Usage Limit */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit ?? ""}
                    onChange={(e) => setFormData((f) => ({ ...f, usageLimit: e.target.value ? Number(e.target.value) : null }))}
                    min={1}
                    placeholder="Unlimited"
                    className="h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData((f) => ({ ...f, isActive: !f.isActive }))}
                    className={`h-10 px-4 rounded-lg font-semibold text-sm transition-colors border ${
                      formData.isActive
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"
                    }`}
                  >
                    {formData.isActive ? "✓ Active" : "✕ Inactive"}
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {(isCreating || isUpdating) && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ASSIGN USERS MODAL                                                      */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {assignModalOpen && assignCouponTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700/50 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assign Coupon to Users</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Coupon: <span className="font-mono font-bold text-primary">{assignCouponTarget.code}</span>
                </p>
              </div>
              <button onClick={() => setAssignModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-400">
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 shrink-0">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search users by name, email, phone..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {selectedUserIds.length > 0 && (
                <p className="text-xs text-primary font-semibold mt-2">{selectedUserIds.length} user(s) selected</p>
              )}
            </div>

            {/* User List */}
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
                    onChange={() => toggleUserSelection(user._id)}
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
              {(usersData?.data?.users || []).length === 0 && (
                <p className="text-center text-sm text-slate-400 py-8">No users found</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700/50 shrink-0">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={isAssigning || selectedUserIds.length === 0}
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isAssigning && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Assign ({selectedUserIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ASSIGNED USERS VIEW MODAL                                               */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {assignedUsersModal && assignedUsersCoupon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700/50 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Users</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Coupon: <span className="font-mono font-bold text-primary">{assignedUsersCoupon.code}</span>
                </p>
              </div>
              <button onClick={() => setAssignedUsersModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-400">
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {(assignedUsersData?.data?.assignments || []).map((assignment: any) => (
                <div
                  key={assignment._id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {assignment.userId?.first_name} {assignment.userId?.last_name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {assignment.userId?.email || assignment.userId?.phone}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        assignment.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {assignment.status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Used: {assignment.usageCount || 0}
                      </span>
                    </div>
                  </div>
                  {assignment.status === "ACTIVE" && (
                    <button
                      onClick={() => handleUnassign(assignedUsersCoupon._id, assignment.userId?._id)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
              {(assignedUsersData?.data?.assignments || []).length === 0 && (
                <div className="text-center py-8">
                  <MdPeople className="text-4xl text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No users assigned to this coupon</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-700/50 shrink-0">
              <button
                onClick={() => {
                  setAssignedUsersModal(false);
                  setAssignCouponTarget(assignedUsersCoupon);
                  setAssignModalOpen(true);
                  setSelectedUserIds([]);
                  setUserSearchQuery("");
                }}
                className="px-4 py-2 text-primary hover:bg-primary/5 rounded-lg font-semibold text-sm flex items-center gap-1.5"
              >
                <MdAdd className="text-lg" />
                Assign More
              </button>
              <button
                onClick={() => setAssignedUsersModal(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && couponToDelete && (
        <DeleteConfirmationModal
          count={1}
          modalTitle="coupon"
          modalDescription="This will deactivate the coupon if it has existing redemptions, or permanently delete it otherwise."
          loading={isDeleting}
          onClose={() => { setDeleteModal(false); setCouponToDelete(null); }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default CoupanClient;