import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../services/api";
import { useStore } from "../context/StoreContext";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import PaymentModal from "../components/PaymentModal";
import { formatCurrency, getOfferPrice } from "../utils/catalog";

const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout."));
    document.body.appendChild(script);
  });

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, clearCart, removeOrderedItemsFromCart } = useStore();
  const { showToast } = useNotification();
  const { user } = useAuth();

  const directCheckoutItem = location.state?.directItem || location.state?.buyNowItem;
  const checkoutItems = useMemo(() => {
    if (directCheckoutItem?.product) {
      return [
        {
          ...directCheckoutItem.product,
          qty: Number(directCheckoutItem.qty || directCheckoutItem.quantity) || 1,
          selectedColor:
            directCheckoutItem.selectedColor ||
            directCheckoutItem.product.color ||
            directCheckoutItem.product.colors?.[0] ||
            ""
        }
      ];
    }
    return cart;
  }, [directCheckoutItem, cart]);

  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [processing, setProcessing] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false); // New state for location loader
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

  const checkoutSummary = useMemo(
    () => ({
      subtotal: checkoutItems.reduce((sum, item) => sum + getOfferPrice(item) * item.qty, 0),
      quantity: checkoutItems.reduce((sum, item) => sum + item.qty, 0)
    }),
    [checkoutItems]
  );
  const subtotal = useMemo(() => checkoutSummary.subtotal, [checkoutSummary]);
  const shippingFee = 0;
  const totalAmount = subtotal + shippingFee;
  const hasMissingAddressFields = !address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode;

  // --- NEW FEATURE: FETCH CURRENT LOCATION ---
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setFetchingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using OpenStreetMap's free reverse geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            
            // Build a readable street address line
            const streetLine = [
              addr.road,
              addr.suburb,
              addr.neighbourhood
            ].filter(Boolean).join(", ");

            setAddress((prev) => ({
              ...prev,
              line1: streetLine || data.display_name.split(",")[0] || prev.line1,
              city: addr.city || addr.town || addr.village || prev.city,
              state: addr.state || prev.state,
              pincode: addr.postcode || prev.pincode
            }));

            showToast({
              title: "Location detected",
              message: "Address fields filled successfully.",
              tone: "success"
            });
          } else {
            setError("Could not extract a readable address from your location coordinates.");
          }
        } catch (err) {
          setError("Failed to fetch address details. Please fill manually.");
        } finally {
          setFetchingLocation(false);
        }
      },
      (geoError) => {
        setFetchingLocation(false);
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError("Location permission denied. Please enable location access in your browser.");
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case geoError.TIMEOUT:
            setError("Location request timed out.");
            break;
          default:
            setError("An unknown error occurred while fetching location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  // -------------------------------------------

  const placeOrder = async () => {
    if (!checkoutItems.length) {
      setError("Your cart is empty.");
      return;
    }
    if (hasMissingAddressFields) {
      setError("Please complete all required delivery details before placing the order.");
      return;
    }

    const normalizedAddress = {
      name: address.name.trim(),
      phone: address.phone.trim(),
      line1: address.line1.trim(),
      line2: address.line2.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim()
    };

    if (!/^[0-9]{6}$/.test(normalizedAddress.pincode)) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }

    const orderItems = checkoutItems.map((item) => ({
      product: item._id || item.product?._id || item.product,
      qty: Number(item.qty) || 0,
      selectedColor: item.selectedColor || item.color || ""
    }));

    if (orderItems.some((item) => !item.product || item.qty <= 0)) {
      setError("Your order contains invalid items. Please refresh the page and try again.");
      return;
    }

    setProcessing(true);
    setError("");
    try {
      const res = await api.post("/orders", {
        paymentMethod: "RAZORPAY",
        items: orderItems,
        shippingAddress: normalizedAddress
      });

      if (paymentMethod === "ONLINE") { 
        const razorpay = res.data?.payment?.razorpay;
        if (!razorpay?.key || !razorpay?.id) {
          throw new Error("Razorpay integration handshake skipped. Check backend payment method matching parameters.");
        }

        await loadRazorpayScript();
        setProcessing(false);

        const checkout = new window.Razorpay({
          key: razorpay.key,
          amount: razorpay.amount,
          currency: razorpay.currency || "INR",
          name: "Ornac",
          description: "Order payment",
          order_id: razorpay.id,
          prefill: {
            name: address.name || user?.name || "",
            email: user?.email || "",
            contact: address.phone || user?.phone || ""
          },
          theme: {
            color: "#7c3aed"
          },
          handler: async (paymentResponse) => {
            setProcessing(true);
            try {
              const verifyRes = await api.post("/payments/razorpay/verify", paymentResponse);
              removeOrderedItemsFromCart(orderItems);
              showToast({
                title: "Payment successful",
                message: "Your Razorpay payment was verified and the order is confirmed.",
                tone: "success"
              });
              navigate("/order-result", { state: verifyRes.data });
            } catch (verifyError) {
              const message = getApiErrorMessage(verifyError, "Payment verification failed");
              setError(message);
              navigate("/order-result", {
                state: {
                  order: res.data?.order || null,
                  payment: {
                    paymentMethod: "RAZORPAY",
                    paymentStatus: "FAILED",
                    transactionId: null
                  },
                  message
                }
              });
            } finally {
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setError("Payment was cancelled. Your order is still pending until payment is completed.");
            }
          }
        });

        checkout.open();
        return;
      }

      if (res.data?.order?.paymentStatus !== "FAILED") {
        if (directCheckoutItem?.product) {
          removeOrderedItemsFromCart(orderItems);
        } else {
          await clearCart();
        }
        showToast({
          title: "Order placed successfully",
          message: "Your order has been received by ORNAQ.",
          tone: "success"
        });
      }
      navigate("/order-result", { state: res.data });
    } catch (errorResponse) {
      const responseData = errorResponse?.response?.data;
      const message = responseData?.message || getApiErrorMessage(errorResponse, "Order failed");
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
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-black text-white">1</span>
                <h2 className="text-xl font-black text-stone-900">Delivery Details</h2>
              </div>
              
              {/* FETCH LOCATION BUTTON */}
              <button
                type="button"
                disabled={fetchingLocation}
                onClick={handleFetchLocation}
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-50 transition-all"
              >
                <svg className={`h-4 w-4 text-brand-600 ${fetchingLocation ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {fetchingLocation ? "Detecting..." : "Use Current Location"}
              </button>
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
            <div className="grid gap-4 sm:grid-cols-1">
              <div className="rounded-3xl border-2 border-brand-600 bg-brand-50/30 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-sm font-black text-stone-900 uppercase tracking-wider">Secure Online Payment</p>
                <p className="text-xs font-medium text-stone-500">Fast and encrypted payment via UPI, Cards, or NetBanking.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Summary Area */}
        <aside className="sticky top-28 h-fit space-y-6">
          <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50">
            <h2 className="text-xl font-black text-stone-900">Order Summary</h2>
            <div className="mt-8 max-h-60 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
              {checkoutItems.map((item) => (
                <div key={`${item._id}-${item.selectedColor || "default"}`} className="flex justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-stone-800">{item.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      Qty: {item.qty} {item.selectedColor ? `• ${item.selectedColor}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-stone-900">
                    {formatCurrency(getOfferPrice(item) * item.qty)}
                  </span>
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
              disabled={!checkoutItems.length || processing}
              className="btn-primary mt-8 w-full py-5 text-lg shadow-2xl disabled:opacity-50"
            >
              Confirm Luxury Order
            </button>
            
            <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-stone-400">
              FREE SHIPPING ALL OVER INDIA
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
