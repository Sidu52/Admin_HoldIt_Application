"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  useGetServiceableAreaQuery, 
  useCreateServiceableAreaMutation, 
  useUpdateServiceableAreaMutation 
} from "../../../../services/serviceableAreaApi";
import { useToast } from "../../../../hooks/useToast";
import { RoleGuard } from "../../../../components/common/RoleGuard";
import { 
  FaArrowLeft, 
  FaSave, 
  FaMapMarkerAlt, 
  FaGlobeAmericas, 
  FaMoneyBillWave,
  FaRulerCombined
} from "react-icons/fa";

export default function AreaFormClient({ areaId }: { areaId: string }) {
  const isNew = areaId === "new";
  const router = useRouter();
  const toast = useToast();
  
  const { data, isLoading } = useGetServiceableAreaQuery(areaId, { skip: isNew });
  const [createArea, { isLoading: isCreating }] = useCreateServiceableAreaMutation();
  const [updateArea, { isLoading: isUpdating }] = useUpdateServiceableAreaMutation();

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    pincode: "",
    lat: "",
    lng: "",
    service_radius_km: "5",
    delivery_charge: "0",
    is_active: true
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
        is_active: area.is_active ?? true
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const latNum = parseFloat(formData.lat);
    const lngNum = parseFloat(formData.lng);
    const radiusNum = parseFloat(formData.service_radius_km);
    const chargeNum = parseFloat(formData.delivery_charge);

    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error("Invalid coordinates. Please enter valid Lat/Lng numbers.");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        location: {
          type: "Point",
          coordinates: [lngNum, latNum] // GeoJSON format: [lng, lat]
        },
        service_radius_km: radiusNum,
        delivery_charge: chargeNum,
        is_active: formData.is_active
      };

      if (isNew) {
        await createArea(payload).unwrap();
        toast.success("Serviceable area created successfully");
      } else {
        await updateArea({ areaId, data: payload }).unwrap();
        toast.success("Serviceable area updated successfully");
      }
      router.push("/serviceable-areas");
    } catch (err: any) {
      toast.error(err?.data?.message || (isNew ? "Failed to create area" : "Failed to update area"));
    }
  };

  if (isLoading && !isNew) return (
    <div className="flex-1 flex items-center justify-center bg-background p-8 font-bold text-slate-400 animate-pulse">
      Fetching area details...
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f172a] text-foreground p-6 sm:p-8 overflow-y-auto">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold mb-2 group"
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
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">City</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">State</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.state} 
                    onChange={e => setFormData({...formData, state: e.target.value})} 
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Pincode</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.pincode} 
                    onChange={e => setFormData({...formData, pincode: e.target.value})} 
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
                    placeholder="e.g. 28.6139"
                    value={formData.lat} 
                    onChange={e => setFormData({...formData, lat: e.target.value})} 
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Longitude</label>
                  <input 
                    required 
                    type="number" 
                    step="any"
                    placeholder="e.g. 77.2090"
                    value={formData.lng} 
                    onChange={e => setFormData({...formData, lng: e.target.value})} 
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] outline-none focus:border-primary transition-all font-bold"
                  />
                </div>
                <p className="md:col-span-2 text-xs text-slate-400 font-bold italic">
                  * Use decimal degrees (e.g. 19.0760, 72.8777 for Mumbai Center)
                </p>
              </div>
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
                    onChange={e => setFormData({...formData, service_radius_km: e.target.value})} 
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
                    onChange={e => setFormData({...formData, delivery_charge: e.target.value})} 
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
                      onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </section>

            <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
              <button 
                type="submit" 
                disabled={isCreating || isUpdating} 
                className="w-full py-5 rounded-[2rem] bg-primary text-white font-black text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <FaSave />
                {isCreating || isUpdating ? "Processing..." : (isNew ? "Create Zone" : "Update Zone")}
              </button>
            </RoleGuard>
          </div>
        </form>
      </div>
    </div>
  );
}
