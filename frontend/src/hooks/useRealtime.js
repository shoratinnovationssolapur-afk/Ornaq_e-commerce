import { useEffect } from "react";
import { connectSocket, disconnectSocket, socket } from "../services/socket";

export const useRealtime = ({ onStockUpdate, onOrderUpdate, onPaymentUpdate, userId }) => {
  useEffect(() => {
    connectSocket();

    const joinUserRoom = () => {
      if (userId) {
        socket.emit("join:user", userId);
      }
    };

    joinUserRoom();
    socket.on("connect", joinUserRoom);

    if (onStockUpdate) socket.on("stock:updated", onStockUpdate);
    if (onOrderUpdate) {
      socket.on("order:status-updated", onOrderUpdate);
      socket.on("orderCreated", onOrderUpdate);
      socket.on("admin:order-updated", onOrderUpdate);
      socket.on("order:created", onOrderUpdate);
    }
    if (onPaymentUpdate) socket.on("paymentStatusUpdated", onPaymentUpdate);

    return () => {
      socket.off("connect", joinUserRoom);
      if (onStockUpdate) socket.off("stock:updated", onStockUpdate);
      if (onOrderUpdate) {
        socket.off("order:status-updated", onOrderUpdate);
        socket.off("orderCreated", onOrderUpdate);
        socket.off("admin:order-updated", onOrderUpdate);
        socket.off("order:created", onOrderUpdate);
      }
      if (onPaymentUpdate) socket.off("paymentStatusUpdated", onPaymentUpdate);
      disconnectSocket();
    };
  }, [onStockUpdate, onOrderUpdate, onPaymentUpdate, userId]);
};
