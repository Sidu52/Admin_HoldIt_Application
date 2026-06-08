import { useState, useCallback, useEffect, useRef } from "react";
import { Driver } from "@/app/types/driver";
import { getCurrentLocation, getGeolocationPermission, formatCoord } from "@/app/utils/location";
import {
    MdMyLocation,
    MdLocationOn,
    MdCheckCircleOutline,
    MdErrorOutline,
} from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface UpdateDriverLocationProps {
    driver: Driver;
    updateLocationMutation: (args: {
        driverId: string;
        lat: number;
        lng: number;
        address?: string;
    }) => Promise<any>;
    onSuccess?: (lat: number, lng: number, address?: string) => void;
    onError?: (error: unknown) => void;
    allowManualEntry?: boolean;
    allowGeolocation?: boolean;
    className?: string;
}

function formatTimestamp(date: Date | null): string {
    if (!date) return "—";
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}

export default function UpdateDriverLocation({
    driver,
    updateLocationMutation,
    onSuccess,
    onError,
    allowManualEntry = true,
    allowGeolocation = true,
    className = "",
}: UpdateDriverLocationProps) {
    const existing = driver.currentLocation;

    const [location, setLocation] = useState({
        lat: existing?.coordinates?.[1] ?? null as number | null,
        lng: existing?.coordinates?.[0] ?? null as number | null,
        address: existing?.address ?? "",
        updatedAt: existing?.updatedAt ?? null as Date | null,
    });

    const [latInput, setLatInput] = useState(
        existing?.coordinates?.[1]?.toString() ?? ""
    );
    const [lngInput, setLngInput] = useState(
        existing?.coordinates?.[0]?.toString() ?? ""
    );
    const [addressInput, setAddressInput] = useState(
        existing?.address ?? ""
    );

    const [status, setStatus] = useState<
        "idle" | "locating" | "loading" | "success" | "error"
    >("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [validationErrors, setValidationErrors] = useState<{
        lat?: string;
        lng?: string;
    }>({});

    const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(
        () => () => { if (successTimer.current) clearTimeout(successTimer.current); },
        []
    );

    function validate(lat: string, lng: string): boolean {
        const errors: { lat?: string; lng?: string } = {};
        const latN = parseFloat(lat);
        const lngN = parseFloat(lng);
        if (!lat.trim() || isNaN(latN)) errors.lat = "Required";
        else if (latN < -90 || latN > 90) errors.lat = "Must be −90 to 90";
        if (!lng.trim() || isNaN(lngN)) errors.lng = "Required";
        else if (lngN < -180 || lngN > 180) errors.lng = "Must be −180 to 180";
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleDetectLocation = useCallback(async () => {
        setStatus("locating");
        setErrorMsg("");
        const perm = await getGeolocationPermission();
        if (perm === "denied") {
            setErrorMsg("Location permission is blocked. Enable it in your browser settings.");
            setStatus("error");
            return;
        }

        try {
            const { coordinates } = await getCurrentLocation();
            setLatInput(coordinates.lat.toString());
            setLngInput(coordinates.lng.toString());
            setLocation((prev) => ({ ...prev, ...coordinates }));
            setValidationErrors({});
            setStatus("idle");
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Unable to retrieve location.");
            setStatus("error");
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!validate(latInput, lngInput)) return;
        const lat = parseFloat(latInput);
        const lng = parseFloat(lngInput);
        const address = addressInput.trim();
        setStatus("loading");
        setErrorMsg("");
        try {
            const mutationArgs: any = {
                driverId: driver._id,
                lat,
                lng
            };

            if (address) {
                mutationArgs.address = address;
            }
            await updateLocationMutation(mutationArgs);
            const now = new Date();
            setLocation((prev) => ({ ...prev, lat, lng, updatedAt: now }));
            setStatus("success");
            onSuccess?.(lat, lng);
            successTimer.current = setTimeout(() => setStatus("idle"), 3000);
        } catch (err: unknown) {
            const message =
                err && typeof err === "object" && "data" in err
                    ? (err as any).data?.message ?? "Update failed. Please try again."
                    : "Update failed. Please try again.";
            setErrorMsg(message);
            setStatus("error");
            onError?.(err);
        }
    }, [latInput, lngInput, addressInput, driver._id, updateLocationMutation, onSuccess, onError]);

    const isBusy = status === "loading" || status === "locating";
    const hasCoords = location.lat !== null && location.lng !== null;

    return (
        <div
            className={`w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col gap-4 shadow-sm ${className}`}
        >
            <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
                <MdLocationOn className="text-primary" />
                Location Details
            </h3>

            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 flex flex-col gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Current Location
                </span>

                {hasCoords ? (
                    <div className="flex gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1">
                            <span className="text-[10px] font-bold text-blue-500 tracking-wide">LAT</span>
                            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 tabular-nums">
                                {formatCoord(location.lat!, "lat")}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1">
                            <span className="text-[10px] font-bold text-blue-500 tracking-wide">LNG</span>
                            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 tabular-nums">
                                {formatCoord(location.lng!, "lng")}
                            </span>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs italic text-gray-400 dark:text-gray-500">No location set yet</p>
                )}

                {location.address && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                        <MdLocationOn className="w-3.5 h-3.5 flex-shrink-0" />
                        {location.address}
                    </p>
                )}

                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Last updated: {formatTimestamp(location.updatedAt)}
                </p>
            </div>
            {allowManualEntry && (
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="udl-address"
                        className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500"
                    >
                        Address (Optional)
                    </label>
                    <input
                        id="udl-address"
                        type="text"
                        placeholder="Street address, landmark, etc."
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        disabled={isBusy}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
            )}

            {/* ── Inputs ── */}
            <div className="flex flex-col gap-3">
                {allowGeolocation && (
                    <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isBusy}
                        className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === "locating" ? (
                            <>
                                <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin flex-shrink-0" />
                                Detecting…
                            </>
                        ) : (
                            <>
                                <MdMyLocation className="w-4 h-4 flex-shrink-0" />
                                Use My Location
                            </>
                        )}
                    </button>
                )}

                {allowManualEntry && (
                    <div className="grid grid-cols-2 gap-3">
                        {/* Latitude */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="udl-lat"
                                className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500"
                            >
                                Latitude
                            </label>
                            <input
                                id="udl-lat"
                                type="number"
                                step="any"
                                min={-90}
                                max={90}
                                placeholder="e.g. 19.0760"
                                value={latInput}
                                onChange={(e) => {
                                    setLatInput(e.target.value);
                                    if (validationErrors.lat)
                                        setValidationErrors((v) => ({ ...v, lat: undefined }));
                                }}
                                disabled={isBusy}
                                className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${validationErrors.lat
                                    ? "border-red-400 dark:border-red-600"
                                    : "border-gray-200 dark:border-gray-700"
                                    }`}
                            />
                            {validationErrors.lat && (
                                <span className="text-[11px] text-red-500 font-medium">
                                    {validationErrors.lat}
                                </span>
                            )}
                        </div>

                        {/* Longitude */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="udl-lng"
                                className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500"
                            >
                                Longitude
                            </label>
                            <input
                                id="udl-lng"
                                type="number"
                                step="any"
                                min={-180}
                                max={180}
                                placeholder="e.g. 72.8777"
                                value={lngInput}
                                onChange={(e) => {
                                    setLngInput(e.target.value);
                                    if (validationErrors.lng)
                                        setValidationErrors((v) => ({ ...v, lng: undefined }));
                                }}
                                disabled={isBusy}
                                className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${validationErrors.lng
                                    ? "border-red-400 dark:border-red-600"
                                    : "border-gray-200 dark:border-gray-700"
                                    }`}
                            />
                            {validationErrors.lng && (
                                <span className="text-[11px] text-red-500 font-medium">
                                    {validationErrors.lng}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Alerts ── */}
            {status === "error" && errorMsg && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                    <MdErrorOutline className="w-4 h-4 flex-shrink-0" />
                    {errorMsg}
                </div>
            )}

            {status === "success" && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-600 dark:text-green-400">
                    <MdCheckCircleOutline className="w-4 h-4 flex-shrink-0" />
                    Location updated successfully!
                </div>
            )}

            {/* ── Submit ── */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={isBusy}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[.98] text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status === "loading" ? (
                    <>
                        <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin flex-shrink-0" />
                        Updating…
                    </>
                ) : (
                    <>
                        <MdLocationOn className="w-4 h-4 flex-shrink-0" />
                        Update Location
                    </>
                )}
            </button>
        </div>
    );
}