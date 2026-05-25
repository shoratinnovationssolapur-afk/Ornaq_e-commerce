import { useEffect, useState } from "react";
import api from "../services/api";
import { useRealtime } from "../hooks/useRealtime";
import OrderManagement from "../components/admin/OrderManagement";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (status = orderFilter) => {
    const response = await api.get("/orders", { params: status ? { status } : {} });
    setOrders(response.data);
  };

  const refreshOrders = async (status = orderFilter) => {
    try {
      await fetchOrders(status);
    } catch (error) {
      console.error("Error fetching admin orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  useRealtime({
    onOrderUpdate: () => refreshOrders(orderFilter)
  });

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <header className="border-b border-stone-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Order Control</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-5xl">Admin Orders</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium text-stone-500 sm:text-base">
            Review, filter, and update customer fulfillment flows from the admin workspace.
          </p>
        </div>
      </header>

      <main className="mx-auto mt-12 max-w-7xl px-6 sm:px-8">
        <div className="rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-12">
          {loading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
              <p className="mt-4 text-sm font-bold uppercase tracking-widest text-stone-400">Loading order flows...</p>
            </div>
          ) : (
            <OrderManagement
              orders={orders}
              refreshOrders={() => refreshOrders(orderFilter)}
              filterValue={orderFilter}
              onFilterChange={(value) => {
                setOrderFilter(value);
                refreshOrders(value);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
