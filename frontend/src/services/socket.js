import { io } from "socket.io-client";

const resolveAuth = () => ({
  token: localStorage.getItem("token") || undefined
});

const resolveSocketUrl = () => {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL;
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_VITE_API_URL;
  if (apiUrl) {
    // Strip trailing "/api" or "/api/" then any trailing slashes
    return apiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }

  return "https://ornaq-backend-j3eg.onrender.com";
};

export const socket = io(resolveSocketUrl(), {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  auth: resolveAuth()
});

export const connectSocket = () => {
  socket.auth = resolveAuth();
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected || socket.active) {
    socket.disconnect();
  }
};

export const syncSocketAuth = () => {
  socket.auth = resolveAuth();
  if (socket.connected) {
    socket.disconnect().connect();
  }
};
