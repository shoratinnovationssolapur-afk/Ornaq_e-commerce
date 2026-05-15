import { useState } from "react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/catalog";

const STATUS_COLORS = {
  PLACED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  PAYMENT_FAILED: "bg-red-50 text-red-600"
};

const FILTERS = [
  { label: "All", value: "" },
  { label: "Placed", value: "PLACED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" }
];

export default function OrderManagement({ orders, refreshOrders, filterValue, onFilterChange }) {
  const [updatingId, setUpdatingId] = useState(null);

  const updateOrder = async (id, orderStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/orders/${id}/status`, { orderStatus });
      refreshOrders();
    } catch {
      window.alert("Error updating order");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-stone-900">Order Flows</h2>
          <p className="mt-1 text-xs font-medium text-stone-400">Review and orchestrate customer fulfillments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => onFilterChange(filter.value)}
              className={`rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                filterValue === filter.value 
                  ? "bg-stone-900 text-white shadow-xl shadow-stone-200" 
                  : "bg-stone-50 text-stone-500 hover:bg-stone-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-stone-50 bg-white shadow-2xl shadow-stone-100">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead className="bg-stone-50/50 border-b border-stone-50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Trace ID</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Customer Entity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Valuation</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Current Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Orchestration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {orders.map((order) => (
                <tr key={order._id} className="group transition-colors hover:bg-stone-50/30">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-stone-900">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="mt-1 text-[10px] font-bold text-stone-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-stone-900">{order.userId?.name || "Guest Patron"}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-stone-400">{order.userId?.email || "No digital footprint"}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-brand-700">{formatCurrency(order.totalAmount)}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-stone-300">{order.paymentMethod}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[order.orderStatus] || "bg-stone-100"}`}>
                      {order.orderStatus.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <select
                        disabled={updatingId === order._id}
                        className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-stone-600 outline-none focus:border-brand-300 focus:ring-0 disabled:opacity-50 transition-all"
                        value={order.orderStatus}
                        onChange={(event) => updateOrder(order._id, event.target.value)}
                      >
                        {["PLACED", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((status) => (
                          <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
                        ))}
                      </select>
                      <a
                        href={`/profile/orders/${order._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-100 text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all"
                        title="View Detailed Intel"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <p className="text-sm font-medium text-stone-400 italic">The filter yields no results in this timeline.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
