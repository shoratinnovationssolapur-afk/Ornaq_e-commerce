import Razorpay from "razorpay";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

export const createRazorpayGatewayOrder = async ({ amount, receipt, notes = {} }) => {
  const razorpay = getRazorpayClient();
  return razorpay.orders.create({
    amount: Math.round(Number(amount) * 100),
    currency: "INR",
    receipt,
    notes
  });
};

const mockPayment = async () => {
  await wait(700);
  const success = Math.random() >= 0.2;

  return {
    success,
    status: success ? "PAID" : "FAILED",
    transactionId: `MOCK-${Date.now()}`
  };
};

export const processPayment = async ({ paymentMethod, orderData }) => {
  switch (paymentMethod) {
    case "MOCK":
      return mockPayment();
    case "RAZORPAY": {
      const razorpayOrder = await createRazorpayGatewayOrder({
        amount: orderData.totalAmount,
        receipt: String(orderData.orderId),
        notes: {
          orderId: String(orderData.orderId),
          userId: String(orderData.userId)
        }
      });

      return {
        success: false,
        status: "PENDING",
        transactionId: null,
        gatewayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID
        }
      };
    }
    case "STRIPE":
      return {
        success: false,
        status: "FAILED",
        transactionId: null
      };
    default:
      return {
        success: false,
        status: "FAILED",
        transactionId: null
      };
  }
};
