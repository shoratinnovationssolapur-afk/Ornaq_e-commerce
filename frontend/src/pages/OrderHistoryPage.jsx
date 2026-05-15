import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import SkeletonBlock from "../components/SkeletonBlock";
import { formatCurrency } from "../utils/catalog";

const statusClasses = {
  PLACED: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-indigo-50 text-indigo-700",
  SHIPPED: "bg-violet-50 text-violet-700",
  OUT_FOR_DELIVERY: "bg-amber-50 text-amber-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
  PAYMENT_FAILED: "bg-red-50 text-red-700"
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/user")
      .then((response) => setOrders(response.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-16">
        <header className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Orders</p>
          <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-5xl">Your Timeline</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium text-stone-500 sm:text-base">
            Track your luxury acquisitions and revisit the details of your previous ORNAQ orders.
          </p>
        </header>

        <div className="space-y-6">
          {loading &&
            Array.from({ length: 3 }).map((_, index) => <SkeletonBlock key={index} className="h-40 w-full rounded-[2.5rem]" />)}

          {!loading && orders.length === 0 && (
            <div className="rounded-[3rem] border border-dashed border-stone-200 bg-white px-8 py-20 text-center shadow-xl shadow-stone-100">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-50 text-2xl">📦</div>
              <h2 className="text-2xl font-black text-stone-900">No orders discovered</h2>
              <p className="mt-3 text-stone-500">You haven't placed any orders yet. Explore our curated collections.</p>
              <Link to="/shop" className="btn-primary mt-8 inline-flex px-10">
                Explore Shop
              </Link>
            </div>
          )}

          {!loading &&
            orders.map((order) => (
              <Link
                key={order._id}
                to={`/profile/orders/${order._id}`}
                className="group block rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-xl shadow-stone-100 transition-all hover:-translate-y-1 hover:shadow-stone-200/50"
              >
                <div className="flex flex-col gap-8 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">Order ID</span>
                      <span className="h-px w-4 bg-stone-100" />
                      <span className="text-xs font-bold text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 text-lg font-black text-stone-900">#{order._id.slice(-8).toUpperCase()}</p>
                    <div className="mt-4 flex items-center gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Items</p>
                        <p className="text-sm font-bold text-stone-700">{order.items?.length || 0} Units</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Total Value</p>
                        <p className="text-sm font-bold text-brand-700">{formatCurrency(order.totalAmount)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 md:flex-col md:items-end">
                    <span className={`inline-flex rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${statusClasses[order.orderStatus] || "bg-stone-100 text-stone-600"}`}>
                      {order.orderStatus.replaceAll("_", " ")}
                    </span>
                    <span className="flex items-center gap-2 text-xs font-black text-brand-700 group-hover:gap-3 transition-all">
                      View Insights
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
