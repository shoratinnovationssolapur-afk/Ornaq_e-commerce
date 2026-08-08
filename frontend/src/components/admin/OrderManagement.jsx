import { useEffect } from "react";
import { formatCurrency } from "../../utils/catalog";

const STATUS_COLORS = {
  PENDING: "bg-amber-100 text-amber-700",
  PAYMENT_DECLINED: "bg-red-100 text-red-700",
  PLACED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Payment Declined", value: "PAYMENT_DECLINED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Placed", value: "PLACED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function OrderManagement({
  orders,
  refreshOrders,
  filterValue,
  onFilterChange,
}) {
  /*
   * Fetch latest order status automatically.
   *
   * Every 3 seconds the frontend asks the backend
   * for the latest orders.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      refreshOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, [refreshOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-900">
            Order Flows
          </h2>

          <p className="mt-1 text-sm text-stone-400">
            Review and monitor customer fulfillments
          </p>
        </div>

        {/* Filters */}
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

      {/* Orders Table */}
      <div className="overflow-hidden rounded-[2.5rem] border border-stone-50 bg-white shadow-2xl shadow-stone-100">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead className="border-b border-stone-50 bg-stone-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Trace ID
                </th>

                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Customer Entity
                </th>

                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Valuation
                </th>

                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Current Status
                </th>

                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  View Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-50">
              {orders.map((order) => {
                const status = order.orderStatus || "PENDING";

                return (
                  <tr
                    key={order._id}
                    className="group transition-colors hover:bg-stone-50/30"
                  >
                    {/* Trace ID */}
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-stone-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>

                      <p className="mt-1 text-[10px] font-bold text-stone-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-stone-900">
                        {order.userId?.name || "Guest Patron"}
                      </p>

                      <p className="mt-0.5 text-[10px] font-medium text-stone-400">
                        {order.userId?.email || "No digital footprint"}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-brand-700">
                        {formatCurrency(order.totalAmount)}
                      </p>

                      <p className="mt-0.5 text-[10px] font-medium text-stone-300">
                        {order.paymentMethod}
                      </p>
                    </td>

                    {/* Current Status */}
                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                          STATUS_COLORS[status] || "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {status.replaceAll("_", " ")}
                      </span>
                    </td>

                    {/* Orchestration */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {/* Live status */}
                        {/* <div className="flex items-center gap-2 rounded-xl border border-stone-100 bg-stone-50 px-4 py-2">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>

                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                          </span>

                          <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">
                            Live
                          </span>
                        </div> */}

                        {/* View order */}
                        <a
                          href={`/profile/orders/${order._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-100 text-stone-400 transition-all hover:bg-stone-50 hover:text-stone-900"
                          title="View Detailed Intel"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Empty */}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <p className="text-sm font-medium italic text-stone-400">
                      The filter yields no results in this timeline.
                    </p>
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