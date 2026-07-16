"use client";

import { socket } from "@/app/lib/socket";
import { Driver } from "@/app/types/driver";

/**
 * Service for managing real-time driver location tracking subscriptions
 * Handles subscribing/unsubscribing to driver location updates
 */
export const driverLocationService = {
  /**
   * Subscribe to a specific driver's location updates
   */
  subscribeToDriver: (driverId: string) => {
    if (!driverId || !socket.connected) return;

    socket.emit(
      "admin:subscribe_driver_location",
      { driverId },
      (response: any) => {
        if (response?.success) {
          console.log(`[LocationService] Subscribed to driver ${driverId}`);
        } else {
          console.warn(
            `[LocationService] Failed to subscribe to driver ${driverId}`,
          );
        }
      },
    );
  },

  /**
   * Unsubscribe from a specific driver's location updates
   */
  unsubscribeFromDriver: (driverId: string) => {
    if (!driverId || !socket.connected) return;

    socket.emit(
      "admin:unsubscribe_driver_location",
      { driverId },
      (response: any) => {
        if (response?.success) {
          console.log(`[LocationService] Unsubscribed from driver ${driverId}`);
        }
      },
    );
  },

  /**
   * Subscribe to multiple drivers (bulk subscription)
   * Useful for driver list view
   */
  subscribeToDriverList: (drivers: Driver[] | string[]) => {
    if (!socket.connected || !Array.isArray(drivers)) return;

    const driverIds = drivers.map((d) => (typeof d === "string" ? d : d._id));

    if (driverIds.length === 0) return;

    socket.emit(
      "admin:subscribe_driver_list",
      { driverIds },
      (response: any) => {
        if (response?.success) {
          console.log(
            `[LocationService] Subscribed to ${response.count} drivers`,
          );
        }
      },
    );
  },

  /**
   * Join admin dashboard room for global updates
   */
  joinAdminDashboard: () => {
    if (!socket.connected) return;

    socket.emit("admin:join", { room: "admin:dashboard" }, (response: any) => {
      console.log("[LocationService] Joined admin dashboard room");
    });
  },

  /**
   * Cleanup subscriptions on component unmount
   */
  cleanup: () => {
    // Subscriptions are cleaned up automatically when socket disconnects
    // or when admin leaves the page
    console.log("[LocationService] Cleaning up subscriptions");
  },

  /**
   * Check if socket is connected
   */
  isConnected: () => socket.connected,

  /**
   * Force reconnect if needed
   */
  reconnect: () => {
    if (!socket.connected) {
      socket.connect();
      console.log("[LocationService] Reconnecting socket");
    }
  },
};
