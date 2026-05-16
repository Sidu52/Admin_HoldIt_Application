"use client";

import { useEffect } from "react";
import { socket } from "@/app/lib/socket";

export const useSocket = (event: string, callback: (payload: any) => void) => {
  useEffect(() => {
    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);

  return {
    emit: (event: string, data: any) => socket.emit(event, data),
    socket,
  };
};
