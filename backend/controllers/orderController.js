import { StatusCodes } from "http-status-codes";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendCustomerNotification } from "../services/notificationService.js";
import { generateInvoiceBuffer } from "../services/invoiceService.js";
import { syncOrderToSalesRegister } from "../services/salesRegisterService.js";
import { processPayment } from "../services/payment/paymentService.js";
import {
  buildInvoiceNumber,
  canCancelOrder,
  canRequestReturn,
  getShippingFee,
  pushStatus
} from "../utils/orderUtils.js";
import { calculatePopularityScore } from "../utils/productUtils.js";
import { isServiceablePincode } from "../utils/serviceability.js";

const STOCK_SENSITIVE_STATUSES = new Set(["CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]);

const updateVariantStock = (product, selectedColor, delta) => {
  if (!selectedColor || !Array.isArray(product.variants) || !product.variants.length) return;
  const variant = product.variants.find((entry) => entry.color === selectedColor);
  if (variant) {
    variant.stock = Math.max(0, Number(variant.stock || 0) + delta);
  }
};

const restoreStockForOrder = async (order, io) => {
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    product.stock += item.qty;
    product.soldCount = Math.max(0, product.soldCount - item.qty);
    product.analytics.purchases = Math.max(0, Number(product.analytics?.purchases || 0) - item.qty);
    updateVariantStock(product, item.selectedColor, item.qty);
    product.popularityScore = calculatePopularityScore(product);
    await product.save();
    io.emit("stock:updated", { productId: product._id, stock: product.stock });
  }
};

export const reduceStockForOrder = async (order, io) => {
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.qty) {
      throw new Error(`Insufficient stock for ${item.name || item.product}`);
    }

    if (item.selectedColor && Array.isArray(product.variants) && product.variants.length) {
      const variant = product.variants.find((entry) => entry.color === item.selectedColor);
      if (variant && Number(variant.stock || 0) < item.qty) {
        throw new Error(`Insufficient stock for ${item.name || item.selectedColor}`);
      }
    }

    product.stock -= item.qty;
    product.soldCount += item.qty;
    product.analytics.purchases = Number(product.analytics?.purchases || 0) + item.qty;
    updateVariantStock(product, item.selectedColor, -item.qty);
    product.popularityScore = calculatePopularityScore(product);
    await product.save();
    io.emit("stock:updated", { productId: product._id, stock: product.stock });
  }
};

const notifyOrderUpdate = async ({ user, subject, message, template, meta }) => {
  await sendCustomerNotification({
    user,
    emailSubject: subject,
    emailText: message,
    whatsappTemplate: template,
    whatsappText: message,
    meta
  });
};

export const serializeOrder = (order) => ({
  ...order.toObject(),
  canCancel: canCancelOrder(order.orderStatus),
  canReturn: canRequestReturn(order.orderStatus, order.returnRequest?.status)
});

const resolveOrderId = (req) => req.params.id || req.body.orderId;

const applyRefund = (order, reason) => {
  if (order.paymentStatus !== "PAID") {
    return;
  }

  order.paymentStatus = "REFUNDED";
  order.refund = {
    status: "PENDING",
    amount: order.totalAmount,
    reason,
    requestedAt: new Date(),
    note: "Refund queued for processing."
  };
};

const buildEstimatedDeliveryDate = (products = []) => {
  const maxDays = Math.max(...products.map((product) => Number(product.deliveryEstimate?.maxDays || 5)), 5);
  const estimated = new Date();
  estimated.setDate(estimated.getDate() + maxDays);
  return estimated;
};

const buildOrderContact = (order, fallbackUser = null) => {
  if (fallbackUser) return fallbackUser;
  if (order.userId) return order.userId;

  const shipping = order.shippingAddress || {};
  return {
    name: shipping.name || "Customer",
    email: shipping.email || "",
    phone: shipping.phone || ""
  };
};

const emitToOrderUser = (io, order, event, payload) => {
  const userId = order.userId?._id || order.userId;
  if (userId) {
    io.to(`user:${userId}`).emit(event, payload);
  }
};

const canAccessOrder = (order, user) => {
  if (String(user?.role || "").toLowerCase() === "admin") return true;
  const userId = order.userId?._id || order.userId;
  return userId && String(userId) === String(user?._id);
};

export const removeOrderedItemsFromCart = async (userId, orderedItems = []) => {
  if (!userId) return;
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return;

  for (const orderedItem of orderedItems) {
    const itemIndex = cart.items.findIndex(
      (cartItem) =>
        String(cartItem.product) === String(orderedItem.product) &&
        String(cartItem.selectedColor || "") === String(orderedItem.selectedColor || "")
    );

    if (itemIndex === -1) continue;

    cart.items[itemIndex].qty -= Number(orderedItem.qty || 0);
    if (cart.items[itemIndex].qty <= 0) {
      cart.items.splice(itemIndex, 1);
    }
  }

  await cart.save();
};

export const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  const normalizedPaymentMethod = paymentMethod || "RAZORPAY";
  
  // Only allow online payment methods
  if (normalizedPaymentMethod === "COD") {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Cash on Delivery is not accepted. Please use online payment." });
  }

  let subtotal = 0;
  const normalizedItems = [];
  const orderedProducts = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.qty) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: `Insufficient stock for ${item.product}` });
    }

    const selectedColor = item.selectedColor || product.color || product.colors?.[0] || "";
    const serviceability = isServiceablePincode(shippingAddress?.pincode, product);
    if (!serviceability.available) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: serviceability.message });
    }

    if (selectedColor && Array.isArray(product.variants) && product.variants.length) {
      const variant = product.variants.find((entry) => entry.color === selectedColor);
      if (variant && Number(variant.stock || 0) < item.qty) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: `Selected color is low in stock for ${product.name}` });
      }
    }

    const effectivePrice = product.offerPrice || product.discountPrice || product.price;
    subtotal += effectivePrice * item.qty;
    orderedProducts.push(product);
    normalizedItems.push({
      product: product._id,
      qty: item.qty,
      name: product.name,
      price: effectivePrice,
      category: product.category,
      image: product.images?.[0]?.url || item.image || "",
      selectedColor,
      sku:
        product.variants?.find((variant) => variant.color === selectedColor)?.sku ||
        `${String(product.slug || product._id)}-${selectedColor || "default"}`
    });
  }

  const shippingFee = getShippingFee(subtotal);
  const totalAmount = subtotal + shippingFee;

  const order = new Order({
    userId: req.user?._id,
    items: normalizedItems,
    shippingAddress,
    paymentMethod: normalizedPaymentMethod,
    subtotal,
    shippingFee,
    discountAmount: 0,
    totalAmount,
    paymentStatus: "PENDING",
    orderStatus: "PLACED",
    estimatedDeliveryAt: buildEstimatedDeliveryDate(orderedProducts),
    statusTimeline: [{ status: "PLACED", note: "Order placed successfully.", changedAt: new Date() }]
  });
  order.invoiceNumber = buildInvoiceNumber(order._id);
  let paymentResult = null;

  // All orders require online payment
  paymentResult = await processPayment({
    paymentMethod: normalizedPaymentMethod,
    orderData: {
      orderId: order._id,
      userId: req.user?._id || "guest",
      items: normalizedItems,
        totalAmount
      }
    });

    order.paymentStatus = paymentResult.status;
    order.transactionId = paymentResult.transactionId;
    order.razorpayOrderId = paymentResult.gatewayOrder?.id || order.razorpayOrderId;

    if (paymentResult.status === "PENDING") {
      order.orderStatus = "PLACED";
      order.statusTimeline = pushStatus(order.statusTimeline, "PLACED", "Awaiting online payment.");
    } else {
      order.orderStatus = paymentResult.success ? "CONFIRMED" : "PAYMENT_FAILED";
      order.statusTimeline = pushStatus(
        order.statusTimeline,
        paymentResult.success ? "CONFIRMED" : "PAYMENT_FAILED",
        paymentResult.success ? "Online payment successful." : "Payment failed."
      );
    }

    if (paymentResult.success) {
      await reduceStockForOrder(order, req.io);
    }

  await order.save();
  if (req.user?._id && order.paymentStatus === "PAID") {
    await removeOrderedItemsFromCart(req.user._id, normalizedItems);
  }

  emitToOrderUser(req.io, order, "orderCreated", serializeOrder(order));
  emitToOrderUser(req.io, order, "paymentStatusUpdated", {
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    transactionId: order.transactionId || null
  });
  req.io.emit("order:created", serializeOrder(order));

  await notifyOrderUpdate({
    user: buildOrderContact(order, req.user),
    subject: "Your Ornac order has been placed",
    message: `Your order ${order.invoiceNumber} has been placed successfully. Total amount: Rs. ${order.totalAmount}.`,
    template: "order_placed",
    meta: { orderId: String(order._id), status: order.orderStatus }
  });

  try {
    await syncOrderToSalesRegister(order);
  } catch (error) {
    console.error("Sales register update failed:", error.message);
  }

  return res.status(StatusCodes.CREATED).json({
    order: serializeOrder(order),
    payment: {
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId || null,
      razorpay: paymentResult?.gatewayOrder || null
    }
  });
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort("-createdAt").lean();
  res.json(
    orders.map((order) => ({
      ...order,
      canCancel: canCancelOrder(order.orderStatus),
      canReturn: canRequestReturn(order.orderStatus, order.returnRequest?.status)
    }))
  );
};

export const getOrders = async (req, res) => {
  const filter = {
    ...(req.query.status ? { orderStatus: req.query.status } : {}),
    ...(req.query.paymentStatus ? { paymentStatus: req.query.paymentStatus } : {})
  };
  const orders = await Order.find(filter).populate("userId", "name email phone").sort("-createdAt");
  res.json(orders.map(serializeOrder));
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(resolveOrderId(req))
    .populate("items.product", "name images")
    .populate("userId", "name email phone");

  if (!order) return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
  if (!canAccessOrder(order, req.user)) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
  }
  res.json(serializeOrder(order));
};

export const cancelOrder = async (req, res) => {
  const order = await Order.findById(resolveOrderId(req)).populate("userId", "name email phone");
  if (!order) return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
  if (!canAccessOrder(order, req.user)) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
  }
  if (!canCancelOrder(order.orderStatus)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "This order can no longer be cancelled." });
  }

  const previousStatus = order.orderStatus;
  order.orderStatus = "CANCELLED";
  order.cancellation = {
    reason: req.body.reason || "Cancelled by customer",
    cancelledAt: new Date()
  };
  order.statusTimeline = pushStatus(order.statusTimeline, "CANCELLED", order.cancellation.reason);
  applyRefund(order, order.cancellation.reason);
  if (STOCK_SENSITIVE_STATUSES.has(previousStatus)) {
    await restoreStockForOrder(order, req.io);
  }
  await order.save();

  emitToOrderUser(req.io, order, "order:status-updated", serializeOrder(order));
  req.io.emit("admin:order-updated", serializeOrder(order));

  await notifyOrderUpdate({
    user: buildOrderContact(order),
    subject: "Your Ornac order has been cancelled",
    message: `Your order ${order.invoiceNumber} has been cancelled.`,
    template: "order_cancelled",
    meta: { orderId: String(order._id), status: order.orderStatus }
  });

  res.json(serializeOrder(order));
};

export const requestReturn = async (req, res) => {
  const order = await Order.findById(resolveOrderId(req)).populate("userId", "name email phone");
  if (!order) return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
  if (!canAccessOrder(order, req.user) || String(req.user?.role || "").toLowerCase() === "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
  }
  if (!canRequestReturn(order.orderStatus, order.returnRequest?.status)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Return request is not available for this order." });
  }

  order.returnRequest = {
    status: "REQUESTED",
    reason: req.body.reason || "Return requested by customer",
    requestedAt: new Date(),
    updatedAt: new Date()
  };
  order.refund = order.paymentStatus === "PAID"
    ? {
        status: "PENDING",
        amount: order.totalAmount,
        reason: order.returnRequest.reason,
        requestedAt: new Date(),
        note: "Refund will be processed after return approval."
      }
    : order.refund;
  order.statusTimeline = pushStatus(order.statusTimeline, "RETURN_REQUESTED", order.returnRequest.reason);
  await order.save();

  emitToOrderUser(req.io, order, "order:status-updated", serializeOrder(order));
  req.io.emit("admin:order-updated", serializeOrder(order));

  res.json(serializeOrder(order));
};

export const reorderOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
  if (!order.userId || String(order.userId) !== String(req.user._id)) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  for (const item of order.items) {
    const existing = cart.items.find(
      (entry) => entry.product.toString() === item.product.toString() && String(entry.selectedColor || "") === String(item.selectedColor || "")
    );
    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.items.push({
        product: item.product,
        qty: item.qty,
        selectedColor: item.selectedColor || ""
      });
    }
  }

  await cart.save();
  res.json({ message: "Items added back to cart." });
};

export const getInvoice = async (req, res) => {
  const order = await Order.findById(resolveOrderId(req))
    .populate("userId", "name email phone")
    .populate("items.product", "category");
  if (!order) return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
  if (!canAccessOrder(order, req.user)) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
  }

  const document = await generateInvoiceBuffer(order);
  res.setHeader("Content-Type", document.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${document.fileName}"`);
  res.send(document.buffer);
};

const legacyUpdateOrderStatusUnused = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("userId", "name email phone");
  if (!order) return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });

  const previousStatus = order.orderStatus;
  order.orderStatus = req.body.orderStatus;
  order.statusTimeline = pushStatus(order.statusTimeline, req.body.orderStatus, req.body.note || "Status updated by admin.");

  if (req.body.orderStatus === "CANCELLED") {
    applyRefund(order, req.body.note || "Cancelled by admin");
    if (STOCK_SENSITIVE_STATUSES.has(previousStatus)) {
      await restoreStockForOrder(order, req.io);
    }
  }

  if (req.body.orderStatus === "SHIPPED") {
    await notifyOrderUpdate({
      user: buildOrderContact(order),
      subject: "Your Ornac order has shipped",
      message: `Your order ${order.invoiceNumber} has shipped and is on the way.`,
      template: "order_shipped",
      meta: { orderId: String(order._id), status: order.orderStatus }
    });
  }

  if (req.body.orderStatus === "OUT_FOR_DELIVERY") {
    await notifyOrderUpdate({
      user: buildOrderContact(order),
      subject: "Your Ornac order is out for delivery today",
      message: `Your order ${order.invoiceNumber} is out for delivery today and will reach your home shortly. Please keep your phone available for the delivery partner.`,
      template: "order_out_for_delivery",
      meta: { orderId: String(order._id), status: order.orderStatus }
    });
  }

  if (req.body.orderStatus === "DELIVERED") {
    await notifyOrderUpdate({
      user: buildOrderContact(order),
      subject: "Your Ornac order has been delivered",
      message: `Your order ${order.invoiceNumber} has been delivered to your home today. Thank you for shopping with us.`,
      template: "order_delivered",
      meta: { orderId: String(order._id), status: order.orderStatus }
    });
  }

// ... Keep all your existing stock validations, item calculations, and payment routines exactly as they are ...

  try {
    // Attempt the compilation and database commit
    await order.save();

    if (order.paymentStatus === "PAID") {
      await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });
    }

    /* Socket notifications */
    req.io.to(`user:${req.user._id}`).emit("orderCreated", serializeOrder(order));
    req.io.to(`user:${req.user._id}`).emit("paymentStatusUpdated", {
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId || null
    });
    req.io.emit("order:created", serializeOrder(order));

    /* Dispatches notification updates via worker queue */
    await notifyOrderUpdate({
      user: req.user,
      subject: "Your Ornac order has been placed",
      message: `Your order ${order.invoiceNumber} has been placed successfully. Total amount: Rs. ${order.totalAmount}.`,
      template: "order_placed",
      meta: { orderId: String(order._id), status: order.orderStatus }
    });

    return res.status(StatusCodes.CREATED).json({
      order: serializeOrder(order),
      payment: {
        paymentMethod: normalizedPaymentMethod,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId || null,
        razorpay: paymentResult?.gatewayOrder || null
      }
    });

  } catch (dbError) {
    // 🚨 EXPLICITLY CAPTURE AND PRINT SUB-VAL ERRORS IN NODEMON
    console.error("\n❌ [CRITICAL ORDER EXCEPTION CRASH]:\n", dbError);

    if (dbError.name === "ValidationError") {
      const fieldErrors = Object.keys(dbError.errors).map(key => `${key}: ${dbError.errors[key].message}`).join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Mongoose Constraint Failure -> [ ${fieldErrors} ]`
      });
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      message: dbError.message || "An unhandled transaction anomaly occurred during execution."
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("userId", "name email phone");
  if (!order) return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });

  const previousStatus = order.orderStatus;
  const nextStatus = req.body.orderStatus;
  order.orderStatus = nextStatus;
  order.statusTimeline = pushStatus(order.statusTimeline, nextStatus, req.body.note || "Status updated by admin.");

  if (nextStatus === "CANCELLED") {
    applyRefund(order, req.body.note || "Cancelled by admin");
    if (STOCK_SENSITIVE_STATUSES.has(previousStatus)) {
      await restoreStockForOrder(order, req.io);
    }
  }

  if (nextStatus === "SHIPPED") {
    await notifyOrderUpdate({
      user: buildOrderContact(order),
      subject: "Your Ornac order has shipped",
      message: `Your order ${order.invoiceNumber} has shipped and is on the way.`,
      template: "order_shipped",
      meta: { orderId: String(order._id), status: order.orderStatus }
    });
  }

  if (nextStatus === "OUT_FOR_DELIVERY") {
    await notifyOrderUpdate({
      user: buildOrderContact(order),
      subject: "Your Ornac order is out for delivery today",
      message: `Your order ${order.invoiceNumber} is out for delivery today and will reach your home shortly. Please keep your phone available for the delivery partner.`,
      template: "order_out_for_delivery",
      meta: { orderId: String(order._id), status: order.orderStatus }
    });
  }

  if (nextStatus === "DELIVERED") {
    await notifyOrderUpdate({
      user: buildOrderContact(order),
      subject: "Your Ornac order has been delivered",
      message: `Your order ${order.invoiceNumber} has been delivered to your home today. Thank you for shopping with us.`,
      template: "order_delivered",
      meta: { orderId: String(order._id), status: order.orderStatus }
    });
  }

  await order.save();
  emitToOrderUser(req.io, order, "order:status-updated", serializeOrder(order));
  req.io.emit("admin:order-updated", serializeOrder(order));
  return res.json(serializeOrder(order));
};
