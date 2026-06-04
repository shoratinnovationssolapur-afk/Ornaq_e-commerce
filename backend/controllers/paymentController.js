import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import { createRazorpayGatewayOrder } from "../services/payment/paymentService.js";
import { syncOrderToSalesRegister } from "../services/salesRegisterService.js";
import { pushStatus } from "../utils/orderUtils.js";
import { reduceStockForOrder, serializeOrder } from "./orderController.js";

export const createStripeIntent = async (req, res) => {
  res.status(501).json({ message: "Stripe provider placeholder. Use MOCK for now." });
};

export const createRazorpayOrder = async (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Valid amount is required." });
  }

  const razorpayOrder = await createRazorpayGatewayOrder({
    amount,
    receipt: req.body.receipt || `ORNAC-${Date.now()}`,
    notes: {
      userId: String(req.user._id),
      purpose: "checkout"
    }
  });

  res.status(StatusCodes.CREATED).json({
    key: process.env.RAZORPAY_KEY_ID,
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency
  });
};

export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Payment verification details are required." });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Payment verification failed." });
  }

  const order = await Order.findOne({
    razorpayOrderId: razorpay_order_id,
    userId: req.user._id
  });

  if (!order) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Matching order was not found." });
  }

  if (order.paymentStatus !== "PAID") {
    await reduceStockForOrder(order, req.io);
  }

  order.paymentStatus = "PAID";
  order.transactionId = razorpay_payment_id;
  order.orderStatus = "CONFIRMED";
  order.statusTimeline = pushStatus(order.statusTimeline, "CONFIRMED", "Razorpay payment verified.");
  await order.save();
  try {
    await syncOrderToSalesRegister(order);
  } catch (error) {
    console.error("Sales register update failed:", error.message);
  }
  await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

  req.io.to(`user:${req.user._id}`).emit("paymentStatusUpdated", {
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    transactionId: order.transactionId
  });
  req.io.to(`user:${req.user._id}`).emit("order:status-updated", serializeOrder(order));
  req.io.emit("admin:order-updated", serializeOrder(order));

  res.json({
    order: serializeOrder(order),
    payment: {
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId
    }
  });
};

export const stripeWebhook = async (req, res) => {
  res.status(501).json({ message: "Stripe webhook placeholder. Use MOCK for now." });
};
