import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../services/api";
import { useStore } from "../context/StoreContext";
import { useNotification } from "../context/NotificationContext";
import PaymentModal from "../components/PaymentModal";
import { formatCurrency } from "../utils/catalog";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 50;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartSummary, clearCart } = useStore();
  const { showToast } = useNotification();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: ""
  });

  const subtotal = useMemo(() => cartSummary.subtotal, [cartSummary]);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalAmount = subtotal + shippingFee;
  const hasMissingAddressFields = !address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode;

  const placeOrder = async () => {
    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }
    if (hasMissingAddressFields) {
      setError("Please complete all required delivery details before placing the order.");
      return;
    }

    setProcessing(true);
    setError("");
    try {
      const method = paymentMethod === "COD" ? "COD" : "MOCK";
      const res = await api.post("/orders", {
        paymentMethod: method,
        items: cart.map((item) => ({
          product: item._id,
          qty: item.qty,
          selectedColor: item.selectedColor || item.color
        })),
        shippingAddress: address
      });
      if (res.data?.order?.paymentStatus !== "FAILED") {
        await clearCart();
        showToast({
          title: "Order placed successfully",
          message: "You can now track the order timeline from your profile.",
          tone: "success"
        });
      }
      navigate("/order-result", { state: res.data });
    } catch (errorResponse) {
      const message = getApiErrorMessage(errorResponse, "Order failed");
      setError(message);
      navigate("/order-result", {
        state: {
          order: null,
          payment: {
            paymentMethod,
            paymentStatus: "FAILED",
            transactionId: null
          },
          message
        }
      });
    } finally {
      setProcessing(false);
    }
  };

  const submitOrder = (event) => {
    event.preventDefault();
    placeOrder();
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-16">
      <PaymentModal open={processing} message="Securing your luxury order..." />
      <header className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Checkout</p>
        <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-5xl">Finalize Order</h1>
      </header>

      <form className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-20" onSubmit={submitOrder}>
        <div className="space-y-12">
          {/* Delivery Section */}
          <section>
            <div className="mb-6 flex items-center gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-black text-white">1</span>
              <h2 className="text-xl font-black text-stone-900">Delivery Details</h2>
            </div>
            <div className="grid gap-4 rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-xl shadow-stone-100">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Full Name</label>
                  <input required className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="John Doe" value={address.name} onChange={(event) => setAddress((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Contact Number</label>
                  <input required className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="+91 98765 43210" value={address.phone} onChange={(event) => setAddress((current) => ({ ...current, phone: event.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Street Address</label>
                <input required className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Apartment, suite, unit, etc." value={address.line1} onChange={(event) => setAddress((current) => ({ ...current, line1: event.target.value }))} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">City</label>
                  <input required className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Mumbai" value={address.city} onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))} />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">State</label>
                  <input required className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Maharashtra" value={address.state} onChange={(event) => setAddress((current) => ({ ...current, state: event.target.value }))} />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Pincode</label>
                  <input required className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="400001" value={address.pincode} onChange={(event) => setAddress((current) => ({ ...current, pincode: event.target.value }))} />
                </div>
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section>
            <div className="mb-6 flex items-center gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-black text-white">2</span>
              <h2 className="text-xl font-black text-stone-900">Payment Selection</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={`relative flex cursor-pointer flex-col gap-3 rounded-3xl border-2 p-6 transition-all ${paymentMethod === "COD" ? "border-brand-600 bg-brand-50/30" : "border-stone-100 bg-white hover:border-stone-200"}`}>
                <input type="radio" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="absolute right-6 top-6 h-5 w-5 text-brand-600 focus:ring-brand-500" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-sm font-black text-stone-900 uppercase tracking-wider">Cash on Delivery</p>
                <p className="text-xs font-medium text-stone-500">Pay securely when your package arrives at your doorstep.</p>
              </label>
              <label className={`relative flex cursor-pointer flex-col gap-3 rounded-3xl border-2 p-6 transition-all ${paymentMethod === "ONLINE" ? "border-brand-600 bg-brand-50/30" : "border-stone-100 bg-white hover:border-stone-200"}`}>
                <input type="radio" checked={paymentMethod === "ONLINE"} onChange={() => setPaymentMethod("ONLINE")} className="absolute right-6 top-6 h-5 w-5 text-brand-600 focus:ring-brand-500" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-sm font-black text-stone-900 uppercase tracking-wider">Secure Online Payment</p>
                <p className="text-xs font-medium text-stone-500">Fast and encrypted payment via UPI, Cards, or NetBanking.</p>
              </label>
            </div>
          </section>
        </div>

        <aside className="sticky top-28 h-fit space-y-6">
          <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50">
            <h2 className="text-xl font-black text-stone-900">Order Summary</h2>
            <div className="mt-8 max-h-60 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
              {cart.map((item) => (
                <div key={`${item._id}-${item.selectedColor || "default"}`} className="flex justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-stone-800">{item.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Qty: {item.qty} {item.selectedColor ? `• ${item.selectedColor}` : ""}</p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-stone-900">{formatCurrency((item.discountPrice || item.price) * item.qty)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 space-y-4 border-t border-stone-100 pt-6">
              <div className="flex justify-between text-sm font-medium text-stone-500">
                <span>Subtotal</span>
                <span className="text-stone-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-stone-500">
                <span>Shipping Fee</span>
                <span className={shippingFee === 0 ? "font-black text-emerald-600" : "text-stone-900"}>
                  {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-lg font-black text-stone-900">Grand Total</span>
                <span className="text-2xl font-black text-brand-700">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!cart.length || processing}
              className="btn-primary mt-8 w-full py-5 text-lg shadow-2xl disabled:opacity-50"
            >
              Confirm Luxury Order
            </button>
            
            <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Free delivery on orders above ₹999
            </p>
          </div>

          <div className="rounded-[2rem] bg-zinc-900 p-8 text-center text-white">
            <svg className="mx-auto h-8 w-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="mt-4 text-sm font-bold tracking-tight">SSL Secure Checkout</p>
            <p className="mt-2 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Encrypted and Privacy Protected</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
