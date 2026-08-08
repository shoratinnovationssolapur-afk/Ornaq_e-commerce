import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import Order from "../models/Order.js";
import { createRazorpayGatewayOrder } from "../services/payment/paymentService.js";
import { syncOrderToSalesRegister } from "../services/salesRegisterService.js";
import { pushStatus } from "../utils/orderUtils.js";
import { reduceStockForOrder, removeOrderedItemsFromCart, serializeOrder } from "./orderController.js";

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
    ...(req.user?._id ? { userId: req.user._id } : {})
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
  await removeOrderedItemsFromCart(req.user?._id, order.items);

  if (req.user?._id) {
    req.io.to(`user:${req.user._id}`).emit("paymentStatusUpdated", {
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId
    });
    req.io.to(`user:${req.user._id}`).emit("order:status-updated", serializeOrder(order));
  }
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
export const handleRazorpayPaymentFailure = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
    } = req.body;

    if (!razorpay_order_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Razorpay order ID is required.",
      });
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      ...(req.user?._id ? { userId: req.user._id } : {}),
    });

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Matching order was not found.",
      });
    }

    // Never change an already-paid order to failed
    if (order.paymentStatus === "PAID") {
      return res.json({
        order: serializeOrder(order),
      });
    }

    order.paymentStatus = "FAILED";
    order.orderStatus = "PAYMENT_DECLINED";

    if (razorpay_payment_id) {
      order.transactionId = razorpay_payment_id;
    }

    order.statusTimeline = pushStatus(
      order.statusTimeline,
      "PAYMENT_DECLINED",
      "Razorpay payment was declined."
    );

    await order.save();

    // Notify the user
    if (req.user?._id) {
      req.io.to(`user:${req.user._id}`).emit(
        "paymentStatusUpdated",
        {
          orderId: order._id,
          paymentStatus: order.paymentStatus,
          transactionId: order.transactionId,
        }
      );

      req.io.to(`user:${req.user._id}`).emit(
        "order:status-updated",
        serializeOrder(order)
      );
    }

    // Notify admin dashboard
    req.io.emit(
      "admin:order-updated",
      serializeOrder(order)
    );

    return res.json({
      order: serializeOrder(order),
      payment: {
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId,
      },
    });
  } catch (error) {
    console.error(
      "Razorpay payment failure handling error:",
      error
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update payment status.",
    });
  }
};

