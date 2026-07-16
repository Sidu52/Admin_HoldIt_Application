"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/app/lib/socket";

export interface DriverLocationData {
  driverId: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  updatedAt: number;
  bookingId?: string;
}

interface LocationStatus {
  status: "tracking" | "offline" | "unknown";
  lastUpdate?: number;
}

/**
 * Hook to listen for real-time driver location updates via Socket.IO
 * Used in admin dashboard to display live driver locations
 *
 * @param driverId - Driver ID to track
 * @param enabled - Whether to enable listening (default true)
 *
 * @example
 * const { location, status } = useDriverLocation(driverId);
 *
 * // Display location if tracking
 * if (status.status === 'tracking' && location) {
 *   showMapMarker(location.lat, location.lng);
 * }
 */
export const useDriverLocation = (
  driverId: string,
  enabled: boolean = true,
) => {
  const [location, setLocation] = useState<DriverLocationData | null>(null);
  const [status, setStatus] = useState<LocationStatus>({
    status: "unknown",
    lastUpdate: undefined,
  });
  const historyRef = useRef<Array<{ lat: number; lng: number; time: number }>>(
    [],
  );
  const MAX_HISTORY = 100;

  useEffect(() => {
    if (!enabled || !driverId) return;

    // Handler for location updates
    const handleLocationUpdate = (payload: any) => {
      if (payload?.driverId === driverId) {
        const locationData: DriverLocationData = {
          driverId,
          lat: payload.lat,
          lng: payload.lng,
          speed: payload.speed,
          heading: payload.heading,
          updatedAt: payload.updatedAt || Date.now(),
          bookingId: payload.bookingId,
        };

        setLocation(locationData);
        setStatus({
          status: "tracking",
          lastUpdate: Date.now(),
        });

        // Maintain location history (keep last 100 points)
        historyRef.current.push({
          lat: payload.lat,
          lng: payload.lng,
          time: Date.now(),
        });
        if (historyRef.current.length > MAX_HISTORY) {
          historyRef.current.shift();
        }

        console.log("[DriverLocation] Updated:", {
          driverId,
          lat: payload.lat,
          lng: payload.lng,
          bookingId: payload.bookingId,
        });
      }
    };

    // Handler for stale location detection
    const handleStaleLocation = (payload: any) => {
      if (payload?.driverId === driverId) {
        setStatus({
          status: "offline",
          lastUpdate: Date.now(),
        });
        console.warn("[DriverLocation] Stale/offline:", driverId);
      }
    };

    // Handler for driver status changes
    const handleDriverStatusChanged = (payload: any) => {
      if (payload?.driverId === driverId) {
        if (!payload.is_online) {
          setStatus({
            status: "offline",
            lastUpdate: Date.now(),
          });
          console.log("[DriverLocation] Driver went offline:", driverId);
        }
      }
    };

    // Subscribe to events
    socket.on("driver:location:updated", handleLocationUpdate);
    socket.on("driver:location:stale", handleStaleLocation);
    socket.on("admin:driver:status_changed", handleDriverStatusChanged);

    return () => {
      socket.off("driver:location:updated", handleLocationUpdate);
      socket.off("driver:location:stale", handleStaleLocation);
      socket.off("admin:driver:status_changed", handleDriverStatusChanged);
    };
  }, [driverId, enabled]);

  const history = historyRef.current;
  const timeSinceUpdate = status.lastUpdate
    ? Date.now() - status.lastUpdate
    : undefined;

  return {
    location,
    status: status.status,
    history,
    isTracking: status.status === "tracking",
    isOffline: status.status === "offline",
    timeSinceUpdate,
    lastUpdate: status.lastUpdate,
  };
};
