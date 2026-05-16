import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const getSocket = (token?: string): Socket => {
  return io(SOCKET_URL, {
    auth: {
      token: token ? `Bearer ${token}` : undefined,
    },
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: false,
  });
};

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false,
});
