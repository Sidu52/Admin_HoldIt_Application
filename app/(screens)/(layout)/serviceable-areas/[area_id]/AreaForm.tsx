"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useGetServiceableAreaQuery,
  useCreateServiceableAreaMutation,
  useUpdateServiceableAreaMutation,
} from "../../../../services/serviceableAreaApi";
import {
  useGetPriceRulesQuery,
  useGetActivePriceRuleByServiceAreaQuery,
  useCreatePriceRuleMutation,
} from "../../../../services/priceRuleApi";
import { PricingRule } from "../../../../types/priceRule";
import { useToast } from "../../../../hooks/useToast";
import { RoleGuard } from "../../../../components/common/RoleGuard";
import {
  FaArrowLeft,
  FaSave,
  FaMapMarkerAlt,
  FaGlobeAmericas,
  FaMoneyBillWave,
  FaRulerCombined,
  FaSuitcaseRolling,
  FaLayerGroup,
  FaPlusCircle,
  FaClock,
} from "react-icons/fa";

export default function AreaFormClient({ areaId }: { areaId: string }) {
  const isNew = areaId === "new";
  const router = useRouter();
  const toast = useToast();

  const { data, isLoading } = useGetServiceableAreaQuery(areaId, { skip: isNew });
  const { data: activeRuleData } = useGetActivePriceRuleByServiceAreaQuery(areaId, { skip: isNew });
  const { data: priceRulesData } = useGetPriceRulesQuery({ limit: 100 });

  const [createArea, { isLoading: isCreating }] = useCreateServiceableAreaMutation();
  const [updateArea, { isLoading: isUpdating }] = useUpdateServiceableAreaMutation();
  const [createPriceRule, { isLoading: isCreatingRule }] = useCreatePriceRuleMutation();

  const allPriceRules: PricingRule[] = priceRulesData?.data?.rules || [];

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    pincode: "",
    lat: "",
    lng: "",
    service_radius_km: "5",
    delivery_charge: "0",
    is_active: true,
  });

  // Price Rule Selection / Creation State
  const [pricingMode, setPricingMode] = useState<"existing" | "custom">("existing");
  const [selectedPriceRuleId, setSelectedPriceRuleId] = useState<string>("");

  const [priceRuleData, setPriceRuleData] = useState({
    name: "",
    platformFee: "10",
    handlingFee: "0",
    packingFee: "0",
    perKmRate: "12",
    maxAdvanceDistanceKm: "15",
    hourlyStorageRate: "25",
    minChargeableHours: "1",
    maxDailyRate: "",
    smallBase: "49",
    smallHourly: "15",
    mediumBase: "99",
    mediumHourly: "25",
    largeBase: "149",
    largeHourly: "40",
    otherBase: "199",
    otherHourly: "50",
  });

  useEffect(() => {
    if (data?.data) {
      const area = data.data;
      setFormData({
        name: area.name || "",
        city: area.city || "",
        state: area.state || "",
        pincode: area.pincode || "",
        lat: area.location?.coordinates?.[1]?.toString() || "",
        lng: area.location?.coordinates?.[0]?.toString() || "",
        service_radius_km: area.service_radius_km?.toString() || "5",
        delivery_charge: area.delivery_charge?.toString() || "0",
        is_active: area.is_active ?? true,
      });
    }
  }, [data]);

  // Sync active price rule if available for existing area
  useEffect(() => {
    if (activeRuleData?.data?._id) {
      setSelectedPriceRuleId(activeRuleData.data._id);
    }
  }, [activeRuleData]);

  // Auto-select first price rule when creating a new zone if none selected
  useEffect(() => {
    if (isNew && !selectedPriceRuleId && allPriceRules.length > 0) {
      setSelectedPriceRuleId(allPriceRules[0]._id);
    }
  }, [isNew, allPriceRules, selectedPriceRuleId]);

  const selectedRule =
    allPriceRules.find((r) => r._id === selectedPriceRuleId) || activeRuleData?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Coordinates validation
    const latNum = parseFloat(formData.lat);
    const lngNum = parseFloat(formData.lng);
    const radiusNum = parseFloat(formData.service_radius_km);
    const chargeNum = parseFloat(formData.delivery_charge);

    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error("Invalid coordinates. Please enter valid Lat/Lng numbers.");
      return;
    }

    try {
      const payload: any = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        location: {
          type: "Point",
          coordinates: [lngNum, latNum], // GeoJSON format: [lng, lat]
        },
        service_radius_km: radiusNum,
        delivery_charge: chargeNum,
        is_active: formData.is_active,
      };

      if (isNew) {
        if (pricingMode === "existing") {
          if (!selectedPriceRuleId) {
            toast.error("Please select a price rule to apply to this new zone");
            return;
          }
          payload.priceRuleId = selectedPriceRuleId;
        } else {
          // Custom price rule
          payload.priceRule = {
            name: priceRuleData.name.trim() || `${formData.name || formData.city || "Zone"} Standard Rate Card`,
            feeBreakdown: {
              platformFee: priceRuleData.platformFee !== "" ? Math.max(0, parseFloat(priceRuleData.platformFee)) : 0,
              handlingFee: priceRuleData.handlingFee !== "" ? Math.max(0, parseFloat(priceRuleData.handlingFee)) : 0,
              packingFee: priceRuleData.packingFee !== "" ? Math.max(0, parseFloat(priceRuleData.packingFee)) : 0,
            },
            perKmRate: priceRuleData.perKmRate !== "" ? Math.max(0, parseFloat(priceRuleData.perKmRate)) : 0,
            maxAdvanceDistanceKm: priceRuleData.maxAdvanceDistanceKm !== "" ? Math.max(0, parseFloat(priceRuleData.maxAdvanceDistanceKm)) : 15,
            hourlyStorageRate: priceRuleData.hourlyStorageRate !== "" ? Math.max(0, parseFloat(priceRuleData.hourlyStorageRate)) : 0,
            minChargeableHours: priceRuleData.minChargeableHours !== "" ? Math.max(0, parseInt(priceRuleData.minChargeableHours)) : 1,
            maxDailyRate: priceRuleData.maxDailyRate ? Math.max(0, parseFloat(priceRuleData.maxDailyRate)) : null,
            bagPricing: {
              small: {
                basePrice: priceRuleData.smallBase !== "" ? Math.max(0, parseFloat(priceRuleData.smallBase)) : 0,
                hourlyRate: priceRuleData.smallHourly !== "" ? Math.max(0, parseFloat(priceRuleData.smallHourly)) : 0,
              },
              medium: {
                basePrice: priceRuleData.mediumBase !== "" ? Math.max(0, parseFloat(priceRuleData.mediumBase)) : 0,
                hourlyRate: priceRuleData.mediumHourly !== "" ? Math.max(0, parseFloat(priceRuleData.mediumHourly)) : 0,
              },
              large: {
                basePrice: priceRuleData.largeBase !== "" ? Math.max(0, parseFloat(priceRuleData.largeBase)) : 0,
                hourlyRate: priceRuleData.largeHourly !== "" ? Math.max(0, parseFloat(priceRuleData.largeHourly)) : 0,
              },
              other: {
                basePrice: priceRuleData.otherBase !== "" ? Math.max(0, parseFloat(priceRuleData.otherBase)) : 0,
                hourlyRate: priceRuleData.otherHourly !== "" ? Math.max(0, parseFloat(priceRuleData.otherHourly)) : 0,
              },
            },
            currency: "INR",
          };
        }

        await createArea(payload).unwrap();
        toast.success("Serviceable area and pricing rule created successfully");
      } else {
        // Updating existing area
        if (pricingMode === "existing" && selectedPriceRuleId) {
          payload.priceRuleId = selectedPriceRuleId;
        }

        await updateArea({ areaId, data: payload }).unwrap();

        if (pricingMode === "custom") {
          const customPayload: any = {
            name: priceRuleData.name.trim() || `${formData.name || formData.city || "Zone"} Custom Rate Card`,
            serviceAreaId: areaId,
            feeBreakdown: {
              platformFee: priceRuleData.platformFee !== "" ? Math.max(0, parseFloat(priceRuleData.platformFee)) : 0,
              handlingFee: priceRuleData.handlingFee !== "" ? Math.max(0, parseFloat(priceRuleData.handlingFee)) : 0,
              packingFee: priceRuleData.packingFee !== "" ? Math.max(0, parseFloat(priceRuleData.packingFee)) : 0,
            },
            perKmRate: priceRuleData.perKmRate !== "" ? Math.max(0, parseFloat(priceRuleData.perKmRate)) : 0,
            maxAdvanceDistanceKm: priceRuleData.maxAdvanceDistanceKm !== "" ? Math.max(0, parseFloat(priceRuleData.maxAdvanceDistanceKm)) : 15,
            hourlyStorageRate: priceRuleData.hourlyStorageRate !== "" ? Math.max(0, parseFloat(priceRuleData.hourlyStorageRate)) : 0,
            minChargeableHours: priceRuleData.minChargeableHours !== "" ? Math.max(0, parseInt(priceRuleData.minChargeableHours)) : 1,
            maxDailyRate: priceRuleData.maxDailyRate ? Math.max(0, parseFloat(priceRuleData.maxDailyRate)) : null,
            bagPricing: {
              small: {
                basePrice: priceRuleData.smallBase !== "" ? Math.max(0, parseFloat(priceRuleData.smallBase)) : 0,
                hourlyRate: priceRuleData.smallHourly !== "" ? Math.max(0, parseFloat(priceRuleData.smallHourly)) : 0,
              },
              medium: {
                basePrice: priceRuleData.mediumBase !== "" ? Math.max(0, parseFloat(priceRuleData.mediumBase)) : 0,
                hourlyRate: priceRuleData.mediumHourly !== "" ? Math.max(0, parseFloat(priceRuleData.mediumHourly)) : 0,
              },
              large: {
                basePrice: priceRuleData.largeBase !== "" ? Math.max(0, parseFloat(priceRuleData.largeBase)) : 0,
                hourlyRate: priceRuleData.largeHourly !== "" ? Math.max(0, parseFloat(priceRuleData.largeHourly)) : 0,
              },
              other: {
                basePrice: priceRuleData.otherBase !== "" ? Math.max(0, parseFloat(priceRuleData.otherBase)) : 0,
                hourlyRate: priceRuleData.otherHourly !== "" ? Math.max(0, parseFloat(priceRuleData.otherHourly)) : 0,
              },
            },
            currency: "INR",
          };
          await createPriceRule(customPayload).unwrap();
        }

        toast.success("Serviceable area and linked pricing rule updated successfully");
      }

      router.push("/serviceable-areas");
    } catch (err: any) {
      toast.error(err?.data?.message || (isNew ? "Failed to create area and price rule" : "Failed to update area"));
    }
  };

  if (isLoading && !isNew) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-8 font-bold text-slate-400 animate-pulse">
        Fetching area details...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f172a] text-foreground p-6 sm:p-8 overflow-y-auto">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold mb-2 group cursor-pointer"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to areas
          </button>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {isNew ? "Create New Zone" : `Edit: ${formData.name}`}
          </h1>
        </div>
      </header>

      <div className="w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details Section */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50 dark:border-slate-800">
                <FaMapMarkerAlt className="text-primary text-xl" />
                <h2 className="text-xl font-bold">Standard Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Area Name / Label</label>
                  <input
                    required
                    placeholder="e.g. Downtown Core"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">City</label>
                  <input
                    required
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">State</label>
                  <input
                    required
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Pincode</label>
                  <input
                    required
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50 dark:border-slate-800">
                <FaGlobeAmericas className="text-indigo-500 text-xl" />
                <h2 className="text-xl font-bold">Geographic Center</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Latitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="e.g. 19.1761"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Longitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="e.g. 72.8463"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold"
                  />
                </div>
                <p className="md:col-span-2 text-xs text-slate-400 font-bold italic">
                  * Coordinates in decimal degrees (e.g. Lat 19.1761, Lng 72.8463 for Mumbai)
                </p>
              </div>
            </section>

            {/* ── ZONE PRICING RULE & RATES (CONNECT OR CREATE) ── */}
            <section className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <FaMoneyBillWave className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Zone Pricing Rule & Rates</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Choose which Price Rule applies to this Serviceable Area or create a custom rate card
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                    selectedRule
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                  }`}
                >
                  {selectedRule ? "Price Rule Selected" : (isNew ? "Selection Required" : "No Active Rule")}
                </span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setPricingMode("existing")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pricingMode === "existing"
                      ? "bg-white dark:bg-[#0f172a] text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <FaLayerGroup /> Choose Existing Price Rule
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode("custom")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pricingMode === "custom"
                      ? "bg-white dark:bg-[#0f172a] text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <FaPlusCircle /> Create New Custom Rate Card
                </button>
              </div>

              {/* OPTION 1: CHOOSE EXISTING PRICE RULE */}
              {pricingMode === "existing" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Select Price Rule for this Area *
                    </label>
                    <select
                      value={selectedPriceRuleId}
                      onChange={(e) => setSelectedPriceRuleId(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold text-sm text-foreground"
                    >
                      <option value="">-- Select a Price Rule --</option>
                      {allPriceRules.map((rule) => {
                        const areaName =
                          rule.serviceAreaId && typeof rule.serviceAreaId === "object"
                            ? (rule.serviceAreaId as any).name
                            : "";
                        const isCurrentActive = activeRuleData?.data?._id === rule._id;
                        return (
                          <option key={rule._id} value={rule._id}>
                            {rule.name} (₹{rule.perKmRate}/km • ₹{rule.hourlyStorageRate}/hr)
                            {areaName ? ` [Zone: ${areaName}]` : ""}
                            {isCurrentActive ? " ★ CURRENT ACTIVE" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Summary of Selected Price Rule */}
                  {selectedRule ? (
                    <div className="p-5 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4">
                      <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/20 pb-3">
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            {selectedRule.name}
                            {activeRuleData?.data?._id === selectedRule._id && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                                Active on this Area
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Currency: {selectedRule.currency || "INR"} • Max Advance Distance:{" "}
                            {selectedRule.maxAdvanceDistanceKm ?? 15} km
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            selectedRule.active
                              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {selectedRule.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Rule Key Rates */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Distance Rate
                          </span>
                          <p className="font-black text-base text-primary mt-0.5">
                            ₹{selectedRule.perKmRate}
                            <span className="text-[10px] font-normal text-slate-400">/km</span>
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Base Platform Fee
                          </span>
                          <p className="font-black text-base text-slate-800 dark:text-slate-200 mt-0.5">
                            ₹{selectedRule.feeBreakdown?.platformFee ?? 0}
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Hourly Storage
                          </span>
                          <p className="font-black text-base text-indigo-600 dark:text-indigo-400 mt-0.5">
                            ₹{selectedRule.hourlyStorageRate}
                            <span className="text-[10px] font-normal text-slate-400">/hr</span>
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Min Chargeable
                          </span>
                          <p className="font-black text-base text-slate-800 dark:text-slate-200 mt-0.5">
                            {selectedRule.minChargeableHours ?? 1}{" "}
                            <span className="text-[10px] font-normal text-slate-400">hr(s)</span>
                          </p>
                        </div>
                      </div>

                      {/* Bag Items Rates */}
                      <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                          <FaSuitcaseRolling /> Bag Item Rates (Base • Hourly)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                            <span className="font-bold text-amber-800 dark:text-amber-300 text-[11px] block">
                              🎒 Small
                            </span>
                            <span className="font-extrabold text-xs">
                              ₹{selectedRule.bagPricing?.small?.basePrice ?? 0}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">
                              • ₹{selectedRule.bagPricing?.small?.hourlyRate ?? 0}/h
                            </span>
                          </div>
                          <div className="p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-900/30">
                            <span className="font-bold text-blue-800 dark:text-blue-300 text-[11px] block">
                              💼 Medium
                            </span>
                            <span className="font-extrabold text-xs">
                              ₹{selectedRule.bagPricing?.medium?.basePrice ?? 0}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">
                              • ₹{selectedRule.bagPricing?.medium?.hourlyRate ?? 0}/h
                            </span>
                          </div>
                          <div className="p-2 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200/50 dark:border-rose-900/30">
                            <span className="font-bold text-rose-800 dark:text-rose-300 text-[11px] block">
                              🧳 Large
                            </span>
                            <span className="font-extrabold text-xs">
                              ₹{selectedRule.bagPricing?.large?.basePrice ?? 0}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">
                              • ₹{selectedRule.bagPricing?.large?.hourlyRate ?? 0}/h
                            </span>
                          </div>
                          <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-900/30">
                            <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px] block">
                              📦 Other
                            </span>
                            <span className="font-extrabold text-xs">
                              ₹{selectedRule.bagPricing?.other?.basePrice ?? 0}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">
                              • ₹{selectedRule.bagPricing?.other?.hourlyRate ?? 0}/h
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                      Please select an existing Price Rule from the list above to link to this zone.
                    </div>
                  )}
                </div>
              )}

              {/* OPTION 2: CREATE NEW CUSTOM RATE CARD */}
              {pricingMode === "custom" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                        Pricing Rule Name
                      </label>
                      <input
                        type="text"
                        placeholder={`${formData.name || formData.city || "Zone"} Custom Rate Card`}
                        value={priceRuleData.name}
                        onChange={(e) => setPriceRuleData({ ...priceRuleData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                        Per KM Distance Rate (₹) *
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceRuleData.perKmRate}
                        onChange={(e) => setPriceRuleData({ ...priceRuleData, perKmRate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                        Base Platform Fee (₹) *
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceRuleData.platformFee}
                        onChange={(e) => setPriceRuleData({ ...priceRuleData, platformFee: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                        Default Storage Rate (₹/hr) *
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceRuleData.hourlyStorageRate}
                        onChange={(e) => setPriceRuleData({ ...priceRuleData, hourlyStorageRate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                        Min Chargeable Hours *
                      </label>
                      <input
                        required
                        type="number"
                        step="1"
                        min="0"
                        value={priceRuleData.minChargeableHours}
                        onChange={(e) => setPriceRuleData({ ...priceRuleData, minChargeableHours: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                        Max Daily Cap (₹)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Optional cap"
                        value={priceRuleData.maxDailyRate}
                        onChange={(e) => setPriceRuleData({ ...priceRuleData, maxDailyRate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary font-bold"
                      />
                    </div>
                  </div>

                  {/* Bag Specific Rates Grid */}
                  <div className="p-4 bg-blue-50/40 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 space-y-4">
                    <p className="font-black uppercase tracking-widest text-[11px] text-primary flex items-center gap-2">
                      <FaSuitcaseRolling /> Bag Item Rates (Base & Hourly)
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Small */}
                      <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="font-bold flex items-center gap-1">🎒 Small Bag</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400">Base (₹)</label>
                            <input
                              type="number"
                              required
                              value={priceRuleData.smallBase}
                              onChange={(e) => setPriceRuleData({ ...priceRuleData, smallBase: e.target.value })}
                              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400">Hourly (₹/h)</label>
                            <input
                              type="number"
                              required
                              value={priceRuleData.smallHourly}
                              onChange={(e) => setPriceRuleData({ ...priceRuleData, smallHourly: e.target.value })}
                              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Medium */}
                      <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="font-bold flex items-center gap-1">💼 Medium Bag</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400">Base (₹)</label>
                            <input
                              type="number"
                              required
                              value={priceRuleData.mediumBase}
                              onChange={(e) => setPriceRuleData({ ...priceRuleData, mediumBase: e.target.value })}
                              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400">Hourly (₹/h)</label>
                            <input
                              type="number"
                              required
                              value={priceRuleData.mediumHourly}
                              onChange={(e) => setPriceRuleData({ ...priceRuleData, mediumHourly: e.target.value })}
                              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Large */}
                      <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="font-bold flex items-center gap-1">🧳 Large Bag</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400">Base (₹)</label>
                            <input
                              type="number"
                              required
                              value={priceRuleData.largeBase}
                              onChange={(e) => setPriceRuleData({ ...priceRuleData, largeBase: e.target.value })}
                              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400">Hourly (₹/h)</label>
                            <input
                              type="number"
                              required
                              value={priceRuleData.largeHourly}
                              onChange={(e) => setPriceRuleData({ ...priceRuleData, largeHourly: e.target.value })}
                              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Other */}
                      <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="font-bold flex items-center gap-1">📦 Other / Odd Item</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400">Base (₹)</label>
                            <input
                              type="number"
                              required
                              value={priceRuleData.otherBase}
                              onChange={(e) => setPriceRuleData({ ...priceRuleData, otherBase: e.target.value })}
                              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400">Hourly (₹/h)</label>
                            <input
                              type="number"
                              required
                              value={priceRuleData.otherHourly}
                              onChange={(e) => setPriceRuleData({ ...priceRuleData, otherHourly: e.target.value })}
                              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Configuration Sidebar Section */}
          <div className="space-y-8">
            <section className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50 dark:border-slate-800">
                <FaRulerCombined className="text-amber-500 text-lg" />
                <h2 className="text-lg font-bold">Service Params</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Radius (Kilometers)</label>
                  <input
                    required
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.service_radius_km}
                    onChange={(e) => setFormData({ ...formData, service_radius_km: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-black text-primary text-center text-xl"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaMoneyBillWave className="text-emerald-500 text-sm" />
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Delivery Fee (₹)</label>
                  </div>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.delivery_charge}
                    onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10 outline-none focus:border-emerald-500 transition-all font-black text-emerald-600 text-center text-xl"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0f172a] rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-black uppercase tracking-widest text-slate-500">Enable Zone</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </section>

            <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
              <button
                type="submit"
                disabled={isCreating || isUpdating || isCreatingRule}
                className="w-full py-5 rounded-[2rem] bg-primary text-white font-black text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
              >
                <FaSave />
                {isCreating || isUpdating || isCreatingRule ? "Processing..." : (isNew ? "Create Zone & Rate Card" : "Save Changes")}
              </button>
            </RoleGuard>

            {!isNew && (
              <Link
                href={`/price-rules?serviceAreaId=${areaId}`}
                className="w-full py-4 rounded-[1.5rem] bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all cursor-pointer"
              >
                <FaMoneyBillWave /> Manage Price Rules in Rates Dashboard
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
