"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "@/app/lib/socket";
import { useAuth } from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";

interface SocketContextType {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (isAuthenticated) {
      // Read cookies on the client side to set the auth token manually
      const getCookie = (name: string) => {
        if (typeof document === 'undefined') return '';
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
        return '';
      };
      const token = getCookie("admin_accessToken") || getCookie("accessToken");
      if (token) {
        socket.auth = { token };
      }
      socket.connect();
    } else {
      socket.disconnect();
    }

    function onConnect() {
      setIsConnected(true);
      console.log("[Socket] Connected to server");
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("[Socket] Disconnected from server");
    }

    function onConnectError(err: any) {
      console.error("[Socket] Connection error:", err.message);
      if (err.message === "UNAUTHORIZED") {
        // Handle unauthorized (maybe token expired)
      }
    }

    // Global listeners
    function onAdminAlert(payload: any) {
      toast.error(`CRITICAL: ${payload.message || "No driver found for booking!"}`, {
        duration: 6000,
        position: "top-right",
      });
    }

    function onNewBooking(payload: any) {
      toast.success(`🎉 New Booking Received: ${payload?.bookingCode || "Booking Code N/A"}`, {
        duration: 5000,
        position: "top-right",
      });
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("admin:alert:no_driver", onAdminAlert);
    socket.on("booking:created", onNewBooking);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("admin:alert:no_driver", onAdminAlert);
      socket.off("booking:created", onNewBooking);
      socket.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
