import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useRealtime } from "../hooks/useRealtime";
import AdminStats from "../components/admin/AdminStats";
import OrderManagement from "../components/admin/OrderManagement";
import { formatCurrency, getProductImage } from "../utils/catalog";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    lowStockCount: 0,
    lowStockItems: [],
    recentOrders: [],
    dailyRevenue: [],
    topSellingProducts: [],
    productAnalytics: []
  });
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    const response = await api.get("/admin/dashboard");
    setDashboard(response.data);
  };

  const fetchOrders = async (status = orderFilter) => {
    const response = await api.get("/orders", { params: status ? { status } : {} });
    setOrders(response.data);
  };

  const fetchData = async (status = orderFilter) => {
    try {
      await Promise.all([fetchDashboard(), fetchOrders(status)]);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useRealtime({
    onStockUpdate: () => fetchData(),
    onOrderUpdate: () => fetchData(orderFilter)
  });

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <header className="border-b border-stone-100 bg-white/80 backdrop-blur-xl sticky top-16 z-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Command Center</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-5xl">Store Intel</h1>
            <p className="mt-4 max-w-2xl text-sm font-medium text-stone-500 sm:text-base">
              Monitor catalog performance, track revenue, and orchestrate fulfillment from a centralized luxury interface.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/products" className="btn-secondary px-8">
              Catalog
            </Link>
            <Link to="/admin/products/add" className="btn-primary px-8">
              New Product
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-7xl px-6 sm:px-8">
        <AdminStats dashboard={dashboard} />

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700 mb-6">Revenue Artifacts</p>
            <div className="grid gap-6">
              <div className="rounded-[2.5rem] bg-zinc-900 p-8 text-white shadow-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Total Lifetime Revenue</p>
                <p className="mt-4 text-4xl font-black">{formatCurrency(dashboard.totalRevenue)}</p>
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                  <span className="text-xs font-medium text-zinc-400">Avg. Order Value</span>
                  <span className="text-sm font-black text-brand-400">{formatCurrency(dashboard.averageOrderValue)}</span>
                </div>
              </div>
              <div className="rounded-[2.5rem] border border-stone-100 bg-stone-50/50 p-8">
                <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6">Daily Performance</p>
                <div className="space-y-4">
                  {(dashboard.dailyRevenue || []).map((entry) => (
                    <div key={entry._id} className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">{entry._id}</span>
                      <span className="text-sm font-black text-stone-900">{formatCurrency(entry.revenue)}</span>
                    </div>
                  ))}
                  {(!dashboard.dailyRevenue || dashboard.dailyRevenue.length === 0) && (
                    <p className="text-xs font-medium text-stone-400 italic">No revenue activity recorded for this period.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">Inventory Guard</p>
                <h2 className="mt-2 text-2xl font-black text-stone-900">Low Stock Signals</h2>
              </div>
              <span className="rounded-full bg-amber-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700">
                {dashboard.lowStockCount} Alerts
              </span>
            </div>

            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 scrollbar-hide">
              {dashboard.lowStockItems.map((product) => (
                <div key={product._id} className="group flex items-center gap-5 rounded-3xl border border-stone-50 bg-stone-50/30 p-4 transition-all hover:bg-stone-50">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-2xl">
                    <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-stone-900">{product.name}</p>
                    <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-stone-400">{product.category} • {product.fabric}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-600">{product.stock}</span>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-300">Left</p>
                  </div>
                </div>
              ))}
              {dashboard.lowStockItems.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-stone-400">Inventory levels are optimal.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-12 rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-12">
          <header className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">Market Pulse</p>
            <h2 className="mt-2 text-3xl font-black text-stone-900">User interest scoring</h2>
          </header>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(dashboard.productAnalytics || []).map((product) => (
              <article key={product._id} className="group rounded-[2.5rem] border border-stone-50 bg-white p-6 shadow-xl shadow-stone-100 transition-all hover:-translate-y-1 hover:shadow-stone-200/50">
                <div className="flex gap-4">
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-2xl bg-stone-50">
                    <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-stone-900">{product.name}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">{product.category}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-b border-stone-50 pb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Interest Score</p>
                  <p className="text-lg font-black text-stone-900">{product.interestScore}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-y-3">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-stone-300">Views</p>
                    <p className="text-xs font-bold text-stone-600">{product.analytics?.views || product.views || 0}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-stone-300">Cart adds</p>
                    <p className="text-xs font-bold text-stone-600">{product.analytics?.cartAdds || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-stone-300">Saves</p>
                    <p className="text-xs font-bold text-stone-600">{product.analytics?.wishlistAdds || 0}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-stone-300">Sales</p>
                    <p className="text-xs font-bold text-stone-600">{product.analytics?.purchases || product.soldCount || 0}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-12 rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-12">
          {loading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
              <p className="mt-4 text-sm font-bold text-stone-400 uppercase tracking-widest">Accessing order flows...</p>
            </div>
          ) : (
            <OrderManagement
              orders={orders}
              refreshOrders={() => fetchData(orderFilter)}
              filterValue={orderFilter}
              onFilterChange={(value) => {
                setOrderFilter(value);
                fetchData(value);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
