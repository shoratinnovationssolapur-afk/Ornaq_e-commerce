import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useRealtime } from "../hooks/useRealtime";
import { useNotification } from "../context/NotificationContext";
import SkeletonBlock from "../components/SkeletonBlock";
import { formatCurrency } from "../utils/catalog";

const STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { showToast } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useRealtime({
    onOrderUpdate: (updatedOrder) => {
      if (updatedOrder._id === id) setOrder(updatedOrder);
    }
  });

  const currentStepIndex = useMemo(() => STEPS.indexOf(order?.orderStatus), [order?.orderStatus]);

  const runAction = async (type) => {
    setActionLoading(true);
    try {
      const response = await api.post(`/orders/${id}/${type}`);
      setOrder(response.data);
    } finally {
      setActionLoading(false);
    }
  };

  const reorder = async () => {
    setActionLoading(true);
    try {
      await api.post(`/orders/${id}/reorder`);
      showToast({
        title: "Items added back to cart",
        message: "You can review them before placing a fresh order.",
        tone: "success"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const downloadInvoice = async () => {
    const response = await api.get(`/orders/${id}/invoice`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${id}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <SkeletonBlock className="h-96 w-full" />
      </div>
    );
  }
  if (!order) return <div className="p-20 text-center font-medium text-red-500">Order not found. Please check your ID.</div>;

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-16">
        <div className="rounded-[3.5rem] border border-stone-50 bg-white p-8 shadow-2xl shadow-stone-100 sm:p-12">
          <div className="flex flex-col justify-between gap-8 border-b border-stone-100 pb-10 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Order Intel</p>
              <h1 className="mt-3 text-2xl font-black text-stone-900 sm:text-4xl">Order #{order._id.slice(-8).toUpperCase()}</h1>
              <p className="mt-2 text-xs font-bold text-stone-400 uppercase tracking-widest">Commissioned {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={downloadInvoice} className="btn-secondary px-6 py-3 text-[10px]">
                Artifact Invoice
              </button>
              <button type="button" disabled={actionLoading} onClick={reorder} className="btn-primary px-6 py-3 text-[10px]">
                Reacquire Items
              </button>
              {order.canCancel && (
                <button type="button" disabled={actionLoading} onClick={() => runAction("cancel")} className="rounded-2xl bg-red-50 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-red-700 transition-all hover:bg-red-100 disabled:opacity-50">
                  Abort Order
                </button>
              )}
              {order.canReturn && (
                <button type="button" disabled={actionLoading} onClick={() => runAction("return")} className="btn-secondary px-6 py-3 text-[10px]">
                  Request Return
                </button>
              )}
            </div>
          </div>

          <div className="mt-16">
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-stone-50 md:left-0 md:top-5 md:h-0.5 md:w-full" />
              <div className="flex flex-col space-y-12 md:flex-row md:justify-between md:space-y-0">
                {STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div key={step} className="relative z-10 flex items-center gap-6 md:flex-col md:gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${isCompleted ? "border-stone-900 bg-stone-900 text-white shadow-xl shadow-stone-200" : "border-stone-100 bg-white text-stone-200"}`}>
                        {isCompleted ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-xs font-black">{idx + 1}</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isCurrent ? "text-brand-700" : isCompleted ? "text-stone-900" : "text-stone-300"}`}>
                        {step.replaceAll("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-20 grid gap-12 border-t border-stone-50 pt-12 lg:grid-cols-2">
            <div className="rounded-[2.5rem] bg-stone-50/50 p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700 mb-6">Delivery Nexus</p>
              <div className="space-y-1">
                <p className="text-sm font-black text-stone-900">{order.shippingAddress.name || "Patron"}</p>
                <p className="text-sm font-medium leading-relaxed text-stone-500">
                  {order.shippingAddress.line1}<br />
                  {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
                  {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                  {order.shippingAddress.pincode}
                </p>
              </div>
            </div>
            <div className="rounded-[2.5rem] border border-stone-50 p-8 shadow-xl shadow-stone-100/50">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700 mb-6">Financial Artifacts</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Method</span>
                  <span className="text-xs font-black text-stone-900">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Subtotal</span>
                  <span className="text-xs font-bold text-stone-600">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-stone-50 pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Valuation</span>
                  <span className="text-xl font-black text-brand-700">{formatCurrency(order.totalAmount)}</span>
                </div>
                {(order.refund?.status && order.refund.status !== "NONE") && (
                  <div className="mt-4 rounded-xl bg-amber-50 p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Refund: {order.refund.status}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-16">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700 mb-8">Secured Artifacts</p>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center justify-between rounded-3xl border border-stone-50 p-4 transition-all hover:bg-stone-50/50">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-14 shrink-0 overflow-hidden rounded-2xl bg-stone-50">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-stone-900 uppercase tracking-wide">{item.name}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">Qty: {item.qty}{item.selectedColor ? ` • ${item.selectedColor}` : ""}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-stone-900">{formatCurrency(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 rounded-[2.5rem] border border-stone-50 p-8 bg-stone-50/30">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700 mb-8">Event Log</p>
            <div className="space-y-4">
              {(order.statusTimeline || []).map((entry, index) => (
                <div key={`${entry.status}-${index}`} className="flex items-start justify-between border-b border-stone-100 last:border-0 pb-4 last:pb-0">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">{entry.status.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xs font-medium text-stone-500">{entry.note}</p>
                  </div>
                  <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">{new Date(entry.changedAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to="/profile/orders" className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 hover:text-brand-700 transition-colors">
            Return to Ledger
          </Link>
        </div>
      </div>
    </div>
  );
}
