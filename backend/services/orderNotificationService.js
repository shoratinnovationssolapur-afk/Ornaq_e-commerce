import { sendCustomerNotification } from "./notificationService.js";

const formatAmount = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;

const getOrderReference = (order) => order?.invoiceNumber || `#${String(order?._id || "").slice(-8).toUpperCase()}`;

const statusMessages = {
  PLACED: {
    subject: "Your ORNAQ order has been placed",
    template: "order_placed",
    text: (order) =>
      `Your order ${getOrderReference(order)} has been placed successfully. Total amount: ${formatAmount(order.totalAmount)}.`
  },
  CONFIRMED: {
    subject: "Your ORNAQ order is confirmed",
    template: "order_confirmed",
    text: (order) =>
      `Your order ${getOrderReference(order)} is confirmed. We are preparing it for dispatch and will keep you updated.`
  },
  SHIPPED: {
    subject: "Your ORNAQ order has shipped",
    template: "order_shipped",
    text: (order) => `Your order ${getOrderReference(order)} has shipped and is on the way.`
  },
  OUT_FOR_DELIVERY: {
    subject: "Your ORNAQ order is out for delivery today",
    template: "order_out_for_delivery",
    text: (order) =>
      `Your order ${getOrderReference(order)} is out for delivery today. Please keep your phone available for the delivery partner.`
  },
  DELIVERED: {
    subject: "Your ORNAQ order has been delivered",
    template: "order_delivered",
    text: (order) => `Your order ${getOrderReference(order)} has been delivered. Thank you for shopping with ORNAQ.`
  },
  PAYMENT_FAILED: {
    subject: "Payment was cancelled for your ORNAQ order",
    template: "payment_failed",
    text: (order) =>
      `Payment for order ${getOrderReference(order)} was cancelled or could not be completed, so the order is not confirmed yet.`
  },
  CANCELLED: {
    subject: "Your ORNAQ order has been cancelled",
    template: "order_cancelled",
    text: (order) => `Your order ${getOrderReference(order)} has been cancelled.`
  }
};

export const buildOrderContact = (order, fallbackUser = null) => {
  if (fallbackUser?.email || fallbackUser?.phone) return fallbackUser;
  if (order?.userId?.email || order?.userId?.phone) return order.userId;

  const shipping = order?.shippingAddress || {};
  return {
    name: shipping.name || "Customer",
    email: shipping.email || "",
    phone: shipping.phone || ""
  };
};

export const notifyOrderStatus = async ({ order, user, status = order?.orderStatus, note }) => {
  const messageConfig = statusMessages[status];
  if (!messageConfig) return;

  const contact = buildOrderContact(order, user);
  const message = note || messageConfig.text(order);

  await sendCustomerNotification({
    user: contact,
    emailSubject: messageConfig.subject,
    emailText: message,
    emailHtml: `<p>${message}</p>`,
    whatsappTemplate: messageConfig.template,
    whatsappText: message,
    meta: {
      orderId: String(order?._id || ""),
      status
    }
  });
};
