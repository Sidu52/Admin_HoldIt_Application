import { User, Address } from "@/app/types/user";
import { cn } from "@/app/utils/cn";
import React, { useState, useEffect } from "react";
import {
    MdClose,
    MdLocationOn,
    MdEdit,
    MdDelete,
    MdAdd,
    MdCheck,
    MdSearch,
    MdHome,
    MdWork,
    MdPushPin,
    MdWarning,
    MdMyLocation,
} from "react-icons/md";

interface AddressFormProps {
    initial: Partial<Address>;
    onSubmit: (data: Partial<Address>) => void;
    onCancel: () => void;
    isSaving: boolean;
    title: string;
    hasChanges: boolean;
    setHasChanges: (val: boolean) => void;
}

const ADDRESS_TYPES = [
    { value: "Home", icon: <MdHome size={16} /> },
    { value: "Office", icon: <MdWork size={16} /> },
    { value: "Other", icon: <MdPushPin size={16} /> },
] as const;

type AddressType = typeof ADDRESS_TYPES[number]["value"];

export default function AddressForm({
    initial,
    onSubmit,
    onCancel,
    isSaving,
    title,
    hasChanges,
    setHasChanges,
}: AddressFormProps) {
    const [form, setForm] = useState<Partial<Address>>(initial);
    const [errors, setErrors] = useState<Partial<Record<keyof Address | "lat" | "lng", string>>>({});
    const [lat, setLat] = useState<string>(
        initial.coordinates ? String(initial.coordinates[1]) : ""
    );
    const [lng, setLng] = useState<string>(
        initial.coordinates ? String(initial.coordinates[0]) : ""
    );

    useEffect(() => {
        setForm(initial);
        setLat(initial.coordinates ? String(initial.coordinates[1]) : "");
        setLng(initial.coordinates ? String(initial.coordinates[0]) : "");
    }, [initial]);

    const required: (keyof Address)[] = ["street", "city", "state", "postal_code", "country"];

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof Address | "lat" | "lng", string>> = {};

        required.forEach((field) => {
            if (!String(form[field] ?? "").trim()) {
                newErrors[field] = "This field is required.";
            }
        });

        // Validate coordinates — either both filled and valid, or both empty
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const latFilled = lat.trim() !== "";
        const lngFilled = lng.trim() !== "";

        if (latFilled !== lngFilled) {
            const missing = latFilled ? "lng" : "lat";
            newErrors[missing] = "Both latitude and longitude are required together.";
        } else if (latFilled && lngFilled) {
            if (isNaN(latNum) || latNum < -90 || latNum > 90)
                newErrors.lat = "Latitude must be between -90 and 90.";
            if (isNaN(lngNum) || lngNum < -180 || lngNum > 180)
                newErrors.lng = "Longitude must be between -180 and 180.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setHasChanges(true);
        if (errors[name as keyof Address]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCoordChange = (
        setter: React.Dispatch<React.SetStateAction<string>>,
        field: "lat" | "lng"
    ) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        setHasChanges(true);
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const coordinates =
            lat.trim() && lng.trim() && !isNaN(latNum) && !isNaN(lngNum)
                ? ([lngNum, latNum] as [number, number]) // [lng, lat] per GeoJSON / your schema
                : undefined;

        onSubmit({ ...form, ...(coordinates ? { coordinates } : {}) });
    };

    const field = (name: keyof Address, label: string, placeholder = "") => (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {label} {required.includes(name) && <span className="text-red-500">*</span>}
            </label>
            <input
                name={name as string}
                value={(form[name] as string) ?? ""}
                onChange={handleChange}
                placeholder={placeholder}
                className={cn(
                    "h-11 px-4 rounded-xl border text-sm transition-all outline-none focus:ring-2 bg-gray-50/50 dark:bg-[#1a2332]",
                    errors[name]
                        ? "border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30"
                        : "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                )}
            />
            {errors[name] && (
                <span className="text-[10px] text-red-500 font-medium px-1">{errors[name]}</span>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#232f48]">
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Please provide the complete address details.
                    </p>
                </div>

                <div className="space-y-5">

                    {/* 1. Address Type */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Address Type
                        </label>
                        <div className="flex gap-2">
                            {ADDRESS_TYPES.map(({ value, icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setForm((prev) => ({ ...prev, type: value }));
                                        setHasChanges(true);
                                    }}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all",
                                        form.type === value
                                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300"
                                    )}
                                >
                                    {icon}
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>
                    {field("street", "Street Address", "123 Main Street, Apt 4B")}

                    <div className="grid grid-cols-2 gap-4">
                        {field("city", "City", "Mumbai")}
                        {field("state", "State", "Maharashtra")}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {field("postal_code", "Postal Code", "400001")}
                        {field("country", "Country", "India")}
                    </div>

                    {/* 2. Coordinates */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <MdMyLocation size={14} className="text-gray-400" />
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Coordinates <span className="normal-case font-normal">(optional)</span>
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Latitude */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Latitude
                                </label>
                                <input
                                    value={lat}
                                    onChange={handleCoordChange(setLat, "lat")}
                                    placeholder="e.g. 19.0760"
                                    inputMode="decimal"
                                    className={cn(
                                        "h-11 px-4 rounded-xl border text-sm transition-all outline-none focus:ring-2 bg-gray-50/50 dark:bg-[#1a2332]",
                                        errors.lat
                                            ? "border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30"
                                            : "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                                    )}
                                />
                                {errors.lat && (
                                    <span className="text-[10px] text-red-500 font-medium px-1">{errors.lat}</span>
                                )}
                            </div>
                            {/* Longitude */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Longitude
                                </label>
                                <input
                                    value={lng}
                                    onChange={handleCoordChange(setLng, "lng")}
                                    placeholder="e.g. 72.8777"
                                    inputMode="decimal"
                                    className={cn(
                                        "h-11 px-4 rounded-xl border text-sm transition-all outline-none focus:ring-2 bg-gray-50/50 dark:bg-[#1a2332]",
                                        errors.lng
                                            ? "border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30"
                                            : "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                                    )}
                                />
                                {errors.lng && (
                                    <span className="text-[10px] text-red-500 font-medium px-1">{errors.lng}</span>
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
                            Used to determine delivery serviceability. Format: [longitude, latitude]
                        </p>
                    </div>

                    {/* 3. Default Address — Toggle */}
                    <div className="pt-1">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    Set as default address
                                </span>
                                <span className="text-[11px] text-gray-500 mt-0.5">
                                    Used automatically for all future orders.
                                </span>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={!!form.is_default}
                                onClick={() => {
                                    setForm((prev) => ({ ...prev, is_default: !prev.is_default }));
                                    setHasChanges(true);
                                }}
                                className={cn(
                                    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                                    form.is_default ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                                )}
                            >
                                <span
                                    className={cn(
                                        "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out",
                                        form.is_default ? "translate-x-5" : "translate-x-0"
                                    )}
                                />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving || (!hasChanges && title.includes("Edit"))}
                    className="flex-[1.5] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-sm text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
                >
                    {isSaving ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <MdCheck size={20} />
                    )}
                    {isSaving ? "Saving..." : "Save Address"}
                </button>
            </div>
        </div>
    );
}