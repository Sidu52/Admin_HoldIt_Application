"use client";

import { useState } from "react";
import {
  useGetPriceRulesQuery,
  useUpdatePriceRuleMutation,
  useDeactivatePriceRuleMutation,
  useClonePriceRuleMutation,
} from "../../../services/priceRuleApi";
import { useGetServiceableAreasQuery } from "../../../services/serviceableAreaApi";
import { useToast } from "../../../hooks/useToast";
import { RoleGuard } from "../../../components/common/RoleGuard";
import { PricingRule } from "@/app/types/priceRule";
import { TableSkeleton } from "../../../components/common/Skeleton";
import Pagination from "@/app/components/common/Pagination";
import NoData from "@/app/NoData";
import {
  FaMoneyBillWave,
  FaEdit,
  FaBan,
  FaCopy,
  FaTimes,
  FaCheck,
  FaClock,
  FaTruck,
  FaSuitcaseRolling,
  FaBox,
} from "react-icons/fa";

export default function PriceRulesClient() {
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeOnly, setActiveOnly] = useState<boolean | undefined>(undefined);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  // Modal State for Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  // Form fields state (Zero Hardcoded Values - loaded strictly from DB/Rule)
  const [formData, setFormData] = useState({
    name: "",
    serviceAreaId: "",
    active: true,
    platformFee: "",
    handlingFee: "",
    packingFee: "",
    perKmRate: "",
    maxAdvanceDistanceKm: "",
    hourlyStorageRate: "",
    minChargeableHours: "",
    maxDailyRate: "",
    freeStorageHours: "",
    peakMultiplier: "",
    startHour: "",
    endHour: "",
    currency: "INR",
    // Bag-specific rates
    smallBase: "",
    smallHourly: "",
    mediumBase: "",
    mediumHourly: "",
    largeBase: "",
    largeHourly: "",
    otherBase: "",
    otherHourly: "",
  });

  const { data: areasData } = useGetServiceableAreasQuery({ limit: 100 });
  const areas = areasData?.data?.areas || [];

  const { data, isLoading, isFetching } = useGetPriceRulesQuery({
    page: currentPage,
    limit: 10,
    active: activeOnly,
    serviceAreaId: selectedAreaId || undefined,
  });

  const rules = data?.data?.rules || [];
  const pagination = data?.data?.pagination;

  const [updatePriceRule, { isLoading: isUpdating }] = useUpdatePriceRuleMutation();
  const [deactivateRule] = useDeactivatePriceRuleMutation();
  const [cloneRule] = useClonePriceRuleMutation();

  const handleOpenEditModal = (rule: PricingRule) => {
    setEditingRule(rule);
    const areaId = (rule.serviceAreaId && typeof rule.serviceAreaId === "object") ? (rule.serviceAreaId as any)._id : (rule.serviceAreaId || "");
    const bp = rule.bagPricing;

    setFormData({
      name: rule.name || "",
      serviceAreaId: areaId || "",
      active: rule.active ?? true,
      platformFee: rule.feeBreakdown?.platformFee !== undefined && rule.feeBreakdown?.platformFee !== null ? String(rule.feeBreakdown.platformFee) : "",
      handlingFee: rule.feeBreakdown?.handlingFee !== undefined && rule.feeBreakdown?.handlingFee !== null ? String(rule.feeBreakdown.handlingFee) : "",
      packingFee: rule.feeBreakdown?.packingFee !== undefined && rule.feeBreakdown?.packingFee !== null ? String(rule.feeBreakdown.packingFee) : "",
      perKmRate: rule.perKmRate !== undefined && rule.perKmRate !== null ? String(rule.perKmRate) : "",
      maxAdvanceDistanceKm: rule.maxAdvanceDistanceKm !== undefined && rule.maxAdvanceDistanceKm !== null ? String(rule.maxAdvanceDistanceKm) : "",
      hourlyStorageRate: rule.hourlyStorageRate !== undefined && rule.hourlyStorageRate !== null ? String(rule.hourlyStorageRate) : "",
      minChargeableHours: rule.minChargeableHours !== undefined && rule.minChargeableHours !== null ? String(rule.minChargeableHours) : "",
      maxDailyRate: rule.maxDailyRate !== null && rule.maxDailyRate !== undefined ? String(rule.maxDailyRate) : "",
      freeStorageHours: rule.freeStorageHours !== undefined && rule.freeStorageHours !== null ? String(rule.freeStorageHours) : "",
      peakMultiplier: rule.peakMultiplier !== undefined && rule.peakMultiplier !== null ? String(rule.peakMultiplier) : "",
      startHour: rule.peakHours?.startHour !== null && rule.peakHours?.startHour !== undefined ? String(rule.peakHours.startHour) : "",
      endHour: rule.peakHours?.endHour !== null && rule.peakHours?.endHour !== undefined ? String(rule.peakHours.endHour) : "",
      currency: rule.currency || "INR",
      smallBase: bp?.small?.basePrice !== undefined && bp?.small?.basePrice !== null ? String(bp.small.basePrice) : "",
      smallHourly: bp?.small?.hourlyRate !== undefined && bp?.small?.hourlyRate !== null ? String(bp.small.hourlyRate) : "",
      mediumBase: bp?.medium?.basePrice !== undefined && bp?.medium?.basePrice !== null ? String(bp.medium.basePrice) : "",
      mediumHourly: bp?.medium?.hourlyRate !== undefined && bp?.medium?.hourlyRate !== null ? String(bp.medium.hourlyRate) : "",
      largeBase: bp?.large?.basePrice !== undefined && bp?.large?.basePrice !== null ? String(bp.large.basePrice) : "",
      largeHourly: bp?.large?.hourlyRate !== undefined && bp?.large?.hourlyRate !== null ? String(bp.large.hourlyRate) : "",
      otherBase: bp?.other?.basePrice !== undefined && bp?.other?.basePrice !== null ? String(bp.other.basePrice) : "",
      otherHourly: bp?.other?.hourlyRate !== undefined && bp?.other?.hourlyRate !== null ? String(bp.other.hourlyRate) : "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    try {
      const payload: any = {
        name: formData.name.trim(),
        serviceAreaId: formData.serviceAreaId || undefined,
        active: formData.active,
        currency: (formData.currency || "INR").trim().toUpperCase(),
        feeBreakdown: {
          platformFee: parseFloat(formData.platformFee) || 0,
          handlingFee: parseFloat(formData.handlingFee) || 0,
          packingFee: parseFloat(formData.packingFee) || 0,
        },
        perKmRate: parseFloat(formData.perKmRate) || 0,
        maxAdvanceDistanceKm: formData.maxAdvanceDistanceKm !== "" ? Math.max(0, parseFloat(formData.maxAdvanceDistanceKm)) : 0,
        hourlyStorageRate: formData.hourlyStorageRate !== "" ? Math.max(0, parseFloat(formData.hourlyStorageRate)) : 0,
        minChargeableHours: formData.minChargeableHours !== "" ? Math.max(0, parseInt(formData.minChargeableHours)) : 0,
        maxDailyRate: formData.maxDailyRate ? Math.max(0, parseFloat(formData.maxDailyRate)) : null,
        freeStorageHours: formData.freeStorageHours !== "" ? Math.max(0, parseInt(formData.freeStorageHours)) : 0,
        peakMultiplier: formData.peakMultiplier !== "" ? Math.max(1.0, parseFloat(formData.peakMultiplier)) : 1.0,
        peakHours: {
          startHour: formData.startHour !== "" ? parseInt(formData.startHour) : null,
          endHour: formData.endHour !== "" ? parseInt(formData.endHour) : null,
        },
        bagPricing: {
          small: {
            basePrice: parseFloat(formData.smallBase) || 0,
            hourlyRate: parseFloat(formData.smallHourly) || 0,
          },
          medium: {
            basePrice: parseFloat(formData.mediumBase) || 0,
            hourlyRate: parseFloat(formData.mediumHourly) || 0,
          },
          large: {
            basePrice: parseFloat(formData.largeBase) || 0,
            hourlyRate: parseFloat(formData.largeHourly) || 0,
          },
          other: {
            basePrice: parseFloat(formData.otherBase) || 0,
            hourlyRate: parseFloat(formData.otherHourly) || 0,
          },
        },
      };

      await updatePriceRule({ id: editingRule._id, data: payload }).unwrap();
      toast.success("Price rule and storage policy updated successfully");
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save price rule");
    }
  };

  const handleDeactivate = async (ruleId: string) => {
    const reason = prompt("Enter reason for deactivating this price rule:");
    if (reason !== null) {
      try {
        await deactivateRule({ id: ruleId, deactivationReason: reason.trim() || "Deactivated by admin" }).unwrap();
        toast.success("Price rule deactivated");
      } catch {
        toast.error("Failed to deactivate price rule");
      }
    }
  };

  const handleClone = async (ruleId: string) => {
    const name = prompt("Enter name for cloned price rule:");
    if (name !== null) {
      try {
        await cloneRule({ id: ruleId, name: name.trim() || undefined }).unwrap();
        toast.success("Price rule cloned successfully");
      } catch {
        toast.error("Failed to clone price rule");
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background text-foreground p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaMoneyBillWave className="text-emerald-500" /> Price Rules Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Price rules are automatically initialized with every Serviceable Area. You can configure and update bag rates, storage fees, and distance pricing below.
          </p>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#1a2332] p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
        {/* Service Area Select */}
        <select
          value={selectedAreaId}
          onChange={(e) => {
            setSelectedAreaId(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="">All Service Areas</option>
          {areas.map((a: any) => (
            <option key={a.id || a._id} value={a.id || a._id}>
              {a.name} ({a.city})
            </option>
          ))}
        </select>

        {/* Active Toggle */}
        <select
          value={activeOnly === undefined ? "" : String(activeOnly)}
          onChange={(e) => {
            const val = e.target.value;
            setActiveOnly(val === "" ? undefined : val === "true");
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {/* ── Price Rules Table ── */}
      <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden flex-1 flex flex-col">
        {isLoading || isFetching ? (
          <div className="p-4">
            <TableSkeleton rows={6} cols={9} />
          </div>
        ) : rules.length === 0 ? (
          <div className="p-8">
            <NoData title="No price rules found matching criteria." />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs min-w-[950px]">
              <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Rule Name</th>
                  <th className="py-3.5 px-4">Service Area</th>
                  <th className="py-3.5 px-4">Bag Rates (Base • Hourly)</th>
                  <th className="py-3.5 px-4">Storage Policy</th>
                  <th className="py-3.5 px-4">Per KM</th>
                  <th className="py-3.5 px-4">Platform Fee</th>
                  <th className="py-3.5 px-4">Peak</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                {rules.map((rule: PricingRule) => {
                  const areaName = rule.serviceAreaId && typeof rule.serviceAreaId === "object" ? (rule.serviceAreaId as any).name || "Area" : "Area";
                  const bp = rule.bagPricing;

                  return (
                    <tr key={rule._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {rule.name}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-primary">
                        {areaName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                            🎒 ₹{bp?.small?.basePrice ?? 0} • ₹{bp?.small?.hourlyRate ?? 0}/h
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                            💼 ₹{bp?.medium?.basePrice ?? 0} • ₹{bp?.medium?.hourlyRate ?? 0}/h
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20">
                            🧳 ₹{bp?.large?.basePrice ?? 0} • ₹{bp?.large?.hourlyRate ?? 0}/h
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
                            📦 ₹{bp?.other?.basePrice ?? 0} • ₹{bp?.other?.hourlyRate ?? 0}/h
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <FaClock className="text-indigo-500 text-[10px]" /> ₹{rule.hourlyStorageRate}/hr
                          </span>
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                              Min: {rule.minChargeableHours ?? 0}h
                            </span>
                            {rule.maxDailyRate ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
                                Cap: ₹{rule.maxDailyRate}/d
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                                No Cap
                              </span>
                            )}
                            {(rule.freeStorageHours ?? 0) > 0 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                                {rule.freeStorageHours}h Free
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        ₹{rule.perKmRate}/km
                      </td>
                      <td className="py-3.5 px-4">
                        ₹{rule.feeBreakdown?.platformFee ?? 0}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-amber-600 dark:text-amber-400">
                        {rule.peakMultiplier ? `${rule.peakMultiplier}x` : "1.0x"}
                      </td>
                      <td className="py-3.5 px-4">
                        {rule.active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                            <button
                              onClick={() => handleOpenEditModal(rule)}
                              title="Edit Rate Rule & Bag Prices"
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-500/10 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleClone(rule._id)}
                              title="Clone Rule"
                              className="p-1.5 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white dark:bg-purple-500/10 dark:text-purple-400 rounded-lg transition-colors cursor-pointer"
                            >
                              <FaCopy />
                            </button>
                            {rule.active && (
                              <button
                                onClick={() => handleDeactivate(rule._id)}
                                title="Deactivate Rule"
                                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-500/10 dark:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              >
                                <FaBan />
                              </button>
                            )}
                          </RoleGuard>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/40">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* ── EDIT PRICE RULE & BAG PRICES MODAL ── */}
      {isModalOpen && editingRule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaMoneyBillWave className="text-primary" />
                Update Pricing Rule: {editingRule.name}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Rule Name & Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Rule Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Standard City Rate"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Service Area (Linked) *</label>
                  <select
                    value={formData.serviceAreaId}
                    onChange={(e) => setFormData({ ...formData, serviceAreaId: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold"
                  >
                    <option value="">Select Service Area</option>
                    {areas.map((area: any) => (
                      <option key={area._id} value={area._id}>
                        {area.name} ({area.city}, {area.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Currency Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Currency</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    placeholder="INR"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Rule Status</label>
                  <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                    </label>
                    <span className={`text-xs font-bold ${formData.active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                      {formData.active ? "Active (In Effect)" : "Inactive (Disabled)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── BAG SPECIFIC PRICING (BASE + HOURLY RATE) ── */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold uppercase tracking-wider text-[11px] text-primary flex items-center gap-1.5">
                    <FaSuitcaseRolling /> Bag Pricing (Base Pickup & Hourly Rates)
                  </p>
                  <span className="text-[10px] text-slate-500">Live User Rates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Small Bag */}
                  <div className="p-3 bg-white dark:bg-[#1a2332] rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">🎒 Small Bag (Handbag/Backpack)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Base Price (₹)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={formData.smallBase}
                          onChange={(e) => setFormData({ ...formData, smallBase: e.target.value })}
                          className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Hourly Rate (₹/hr)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={formData.smallHourly}
                          onChange={(e) => setFormData({ ...formData, smallHourly: e.target.value })}
                          className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medium Bag */}
                  <div className="p-3 bg-white dark:bg-[#1a2332] rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">💼 Medium Bag (Cabin / Duffle)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Base Price (₹)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={formData.mediumBase}
                          onChange={(e) => setFormData({ ...formData, mediumBase: e.target.value })}
                          className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Hourly Rate (₹/hr)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={formData.mediumHourly}
                          onChange={(e) => setFormData({ ...formData, mediumHourly: e.target.value })}
                          className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Large Bag */}
                  <div className="p-3 bg-white dark:bg-[#1a2332] rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">🧳 Large Bag (Check-in Suitcase)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Base Price (₹)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={formData.largeBase}
                          onChange={(e) => setFormData({ ...formData, largeBase: e.target.value })}
                          className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Hourly Rate (₹/hr)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={formData.largeHourly}
                          onChange={(e) => setFormData({ ...formData, largeHourly: e.target.value })}
                          className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Other / Odd Item */}
                  <div className="p-3 bg-white dark:bg-[#1a2332] rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">📦 Other / Odd Item</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Base Price (₹)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={formData.otherBase}
                          onChange={(e) => setFormData({ ...formData, otherBase: e.target.value })}
                          className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Hourly Rate (₹/hr)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={formData.otherHourly}
                          onChange={(e) => setFormData({ ...formData, otherHourly: e.target.value })}
                          className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── LUGGAGE STORAGE & DURATION RULES ── */}
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold uppercase tracking-wider text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <FaClock className="text-indigo-600 dark:text-indigo-400" /> Luggage Storage & Duration Rules
                  </p>
                  <span className="text-[10px] text-slate-500">Hourly Rates & Caps</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Min Chargeable Hours */}
                  <div className="p-3 bg-white dark:bg-[#1a2332] rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-200 text-xs">
                      Min Chargeable Hours *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={formData.minChargeableHours}
                      onChange={(e) => setFormData({ ...formData, minChargeableHours: e.target.value })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-bold text-sm"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Minimum hours charged even for short stays (e.g., 35 mins billed as 1 hr). Default: 1 hr.
                    </p>
                  </div>

                  {/* Fallback Hourly Rate */}
                  <div className="p-3 bg-white dark:bg-[#1a2332] rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-200 text-xs">
                      Default Storage Rate (₹/hr) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={formData.hourlyStorageRate}
                      onChange={(e) => setFormData({ ...formData, hourlyStorageRate: e.target.value })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-bold text-sm"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Fallback hourly rate if item-specific bag rates are not applicable.
                    </p>
                  </div>

                  {/* Max Daily Rate Cap */}
                  <div className="p-3 bg-white dark:bg-[#1a2332] rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-200 text-xs">
                      Max Daily Rate Cap (₹/day)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 299 (Leave blank for no cap)"
                      value={formData.maxDailyRate}
                      onChange={(e) => setFormData({ ...formData, maxDailyRate: e.target.value })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-bold text-sm"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Maximum cap per 24-hour storage cycle. Leave empty for uncapped storage.
                    </p>
                  </div>

                  {/* Free Storage Hours */}
                  <div className="p-3 bg-white dark:bg-[#1a2332] rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-200 text-xs">
                      Free Grace Hours
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.freeStorageHours}
                      onChange={(e) => setFormData({ ...formData, freeStorageHours: e.target.value })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-foreground font-bold text-sm"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Initial complimentary hours before storage billing begins (default: 0).
                    </p>
                  </div>
                </div>
              </div>

              {/* ── DISTANCE & SERVICE FEES ── */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 space-y-3">
                <p className="font-bold uppercase tracking-wider text-[11px] text-primary">Distance & Service Fees</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Per KM Distance Rate (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={formData.perKmRate}
                      onChange={(e) => setFormData({ ...formData, perKmRate: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700 rounded-lg text-foreground font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Base Platform Fee (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={formData.platformFee}
                      onChange={(e) => setFormData({ ...formData, platformFee: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700 rounded-lg text-foreground font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Thresholds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Handling Fee (₹)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formData.handlingFee}
                    onChange={(e) => setFormData({ ...formData, handlingFee: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Packing Fee (₹)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formData.packingFee}
                    onChange={(e) => setFormData({ ...formData, packingFee: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Max Distance (KM)</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={formData.maxAdvanceDistanceKm}
                    onChange={(e) => setFormData({ ...formData, maxAdvanceDistanceKm: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-foreground font-semibold"
                  />
                </div>
              </div>

              {/* Peak Hours & Multipliers */}
              <div className="p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20 space-y-3">
                <p className="font-bold uppercase tracking-wider text-[11px] text-amber-700 dark:text-amber-400">Peak Hours & Multipliers</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Peak Multiplier (e.g. 1.5x)</label>
                    <input
                      type="number"
                      step="any"
                      min="1.0"
                      value={formData.peakMultiplier}
                      onChange={(e) => setFormData({ ...formData, peakMultiplier: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700 rounded-lg text-foreground font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Peak Start Hour (0 - 23)</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      step="1"
                      placeholder="e.g. 18"
                      value={formData.startHour}
                      onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700 rounded-lg text-foreground font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Peak End Hour (0 - 23)</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      step="1"
                      placeholder="e.g. 22"
                      value={formData.endHour}
                      onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700 rounded-lg text-foreground font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <FaCheck /> Save Price Rule & Bag Rates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
