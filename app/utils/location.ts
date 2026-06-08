export interface Coordinates {
    lat: number;
    lng: number;
}

export interface GeolocationResult {
    coordinates: Coordinates;
    accuracy: number;
}

export type GeolocationErrorCode = 1 | 2 | 3;

export interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

const GEO_ERROR_MESSAGES: Record<GeolocationErrorCode, string> = {
    1: "Location permission denied. Please allow access in your browser settings.",
    2: "Position unavailable. Check your device's location settings.",
    3: "Location request timed out. Please try again.",
};

const DEFAULT_OPTIONS: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
};

/**
 * Check if the browser supports the Geolocation API.
 */
export function isGeolocationSupported(): boolean {
    return typeof navigator !== "undefined" && "geolocation" in navigator;
}

/**
 * Query the current browser permission state for geolocation.
 * Returns null if the Permissions API is unavailable (e.g. Safari < 16).
 */
export async function getGeolocationPermission(): Promise<
    PermissionState | null
> {
    if (typeof navigator === "undefined" || !navigator.permissions) return null;
    try {
        const result = await navigator.permissions.query({ name: "geolocation" });
        return result.state;
    } catch {
        return null;
    }
}

/**
 * Get the current device location.
 *
 * @example
 * const { coordinates } = await getCurrentLocation();
 * console.log(coordinates.lat, coordinates.lng);
 */
export function getCurrentLocation(
    options?: GeolocationOptions
): Promise<GeolocationResult> {
    return new Promise((resolve, reject) => {
        if (!isGeolocationSupported()) {
            reject(new Error("Geolocation is not supported by your browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    coordinates: {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    },
                    accuracy: pos.coords.accuracy,
                });
            },
            (err) => {
                const code = err.code as GeolocationErrorCode;
                reject(
                    new Error(
                        GEO_ERROR_MESSAGES[code] ?? "Unable to retrieve location."
                    )
                );
            },
            { ...DEFAULT_OPTIONS, ...options }
        );
    });
}

/**
 * Watch the device's position and call `onUpdate` whenever it changes.
 * Returns a cleanup function — call it to stop watching.
 *
 * @example
 * const stop = watchLocation(({ coordinates }) => {
 *   console.log(coordinates.lat, coordinates.lng);
 * });
 * // later…
 * stop();
 */
export function watchLocation(
    onUpdate: (result: GeolocationResult) => void,
    onError?: (message: string) => void,
    options?: GeolocationOptions
): () => void {
    if (!isGeolocationSupported()) {
        onError?.("Geolocation is not supported by your browser.");
        return () => { };
    }

    const watchId = navigator.geolocation.watchPosition(
        (pos) => {
            onUpdate({
                coordinates: {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                },
                accuracy: pos.coords.accuracy,
            });
        },
        (err) => {
            const code = err.code as GeolocationErrorCode;
            onError?.(
                GEO_ERROR_MESSAGES[code] ?? "Unable to retrieve location."
            );
        },
        { ...DEFAULT_OPTIONS, ...options }
    );

    return () => navigator.geolocation.clearWatch(watchId);
}

/**
 * Format a coordinate value with a cardinal direction suffix.
 *
 * @example
 * formatCoord(19.0760, "lat") // "19.076000° N"
 * formatCoord(-72.8777, "lng") // "72.877700° W"
 */
export function formatCoord(value: number, axis: "lat" | "lng"): string {
    const dir =
        axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
    return `${Math.abs(value).toFixed(6)}° ${dir}`;
}