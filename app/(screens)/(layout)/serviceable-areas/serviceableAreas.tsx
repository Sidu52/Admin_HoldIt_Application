"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NoData from "@/app/NoData";
import { 
  useGetServiceableAreasQuery, 
  useDeleteServiceableAreaMutation, 
  useToggleServiceableAreaStatusMutation 
} from "../../../services/serviceableAreaApi";
import { useToast } from "../../../hooks/useToast";
import { RoleGuard } from "../../../components/common/RoleGuard";
import { 
  FaEdit, 
  FaTrash, 
  FaPowerOff, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaMapMarkerAlt,
} from "react-icons/fa";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";

export default function ServiceableAreasClient() {
  const router = useRouter();
  const toast = useToast();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useGetServiceableAreasQuery({
    page: pagination.page,
    limit: pagination.limit,
    is_active: statusFilter === "all" ? undefined : statusFilter === "active",
    search: searchTerm || undefined,
  });

  const [deleteArea] = useDeleteServiceableAreaMutation();
  const [toggleStatus] = useToggleServiceableAreaStatusMutation();

  const areas: any[] = data?.data?.areas || [];
  const { totalPages, currentPage, totalItems } = data?.data?.pagination || { 
    totalPages: 1, 
    currentPage: 1, 
    totalItems: areas.length 
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this serviceable area?")) {
      try {
        await deleteArea(id).unwrap();
        toast.success("Area deleted successfully");
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to delete area");
      }
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStatus({ areaId: id, isActive: !currentStatus }).unwrap();
      toast.success(`Area ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-text-muted-light dark:text-text-muted-dark font-bold text-xs uppercase tracking-widest">Loading zones...</p>
        </div>
      </div>
    );
  }

  if (isError) return <NoData />;

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark p-8 overflow-hidden">
      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <FaMapMarkerAlt className="text-xl" />
            </div>
            <h1 className="text-4xl font-extrabold font-display tracking-tight text-text-main-light dark:text-text-main-dark">
              Serviceable Areas
            </h1>
          </div>
          <p className="text-text-muted-light dark:text-text-muted-dark font-medium tracking-wide">
            Define and manage delivery territories for your logistics network.
          </p>
        </div>

        <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <button 
            onClick={() => router.push("/serviceable-areas/new")}
            className="flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FaPlus className="text-sm" />
            Create Zone
          </button>
        </RoleGuard>
      </header>

      {/* Controls Area */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by area name or pincode..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-text-main-light dark:text-text-main-dark"
          />
        </div>
        
        <div className="flex items-center gap-2 px-4 h-12 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl">
          <FaFilter className="text-text-muted-light dark:text-text-muted-dark text-xs" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent outline-none font-bold text-xs uppercase tracking-widest text-text-main-light dark:text-text-main-dark pr-2 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="card-premium flex-1 flex flex-col overflow-hidden p-0 border-none shadow-none bg-transparent">
        <div className="flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead className="bg-background-light dark:bg-background-dark">
              <tr>
                <th className="sticky top-0 z-10 px-8 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Zone Details</th>
                <th className="sticky top-0 z-10 px-8 py-5 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Location</th>
                <th className="sticky top-0 z-10 px-8 py-5 text-center text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Operational Info</th>
                <th className="sticky top-0 z-10 px-8 py-5 text-center text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Status</th>
                <th className="sticky top-0 z-10 px-8 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
              {areas.map((area) => (
                <tr key={area._id} className="group hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark group-hover:text-primary transition-colors">
                        {area.name}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-tight">Pin: {area.pincode || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark">{area.city}</span>
                      <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-tight">{area.state}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                        {area.service_radius_km} KM Radius
                      </span>
                      <span className="text-xs font-bold text-text-main-light dark:text-text-main-dark">
                        ₹{area.delivery_charge || 0} Delivery Fee
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-300 ${
                      area.is_active 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                    }`}>
                      <span className={`size-1.5 rounded-full ${area.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                      {area.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                        <button 
                          onClick={() => handleToggle(area._id, area.is_active)}
                          className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                          title={area.is_active ? "Deactivate" : "Activate"}
                        >
                          <FaPowerOff size={16} />
                        </button>
                        <button 
                          onClick={() => router.push(`/serviceable-areas/${area._id}`)}
                          className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:text-primary hover:bg-primary/10 transition-all"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(area._id)}
                          className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:text-rose-600 hover:bg-rose-500/10 transition-all"
                          title="Remove"
                        >
                          <FaTrash size={16} />
                        </button>
                      </RoleGuard>
                    </div>
                  </td>
                </tr>
              ))}
              {areas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-text-muted-light uppercase tracking-widest">No serviceable areas found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-8 py-5 bg-background-light/30 dark:bg-background-dark/30 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-bold text-text-muted-light uppercase tracking-wider">
            Showing <span className="text-text-main-light dark:text-text-main-dark">{(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, totalItems)}</span> of <span className="text-primary">{totalItems}</span> zones
          </p>
          
          <div className="flex items-center gap-4">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPagination({ ...pagination, page: currentPage - 1 })}
              className="p-2 rounded-xl border border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark disabled:opacity-30 transition-all"
            >
              <RiArrowLeftSLine size={20} className="text-text-main-light dark:text-text-main-dark" />
            </button>
            
            <span className="text-xs font-bold text-text-main-light dark:text-text-main-dark tabular-nums">
              Page <span className="text-primary">{currentPage}</span> of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPagination({ ...pagination, page: currentPage + 1 })}
              className="p-2 rounded-xl border border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark disabled:opacity-30 transition-all"
            >
              <RiArrowRightSLine size={20} className="text-text-main-light dark:text-text-main-dark" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
