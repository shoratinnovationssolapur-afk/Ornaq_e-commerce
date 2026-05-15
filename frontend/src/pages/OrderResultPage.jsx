import { Link, useLocation } from "react-router-dom";

export default function OrderResultPage() {
  const { state } = useLocation();
  const paymentStatus = state?.payment?.paymentStatus || "FAILED";
  const success = paymentStatus !== "FAILED";

  return (
    <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center p-6">
      <div className="mx-auto max-w-xl w-full">
        <div className="rounded-[3rem] border border-stone-50 bg-white p-10 text-center shadow-2xl shadow-stone-100 sm:p-16">
          <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-stone-50 text-4xl shadow-inner">
            {success ? "✨" : "⚠️"}
          </div>
          
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${success ? "text-emerald-600" : "text-amber-600"}`}>
            {success ? "Orchestration Complete" : "Payment Interrupted"}
          </p>
          
          <h1 className="mt-4 text-3xl font-black text-stone-900 sm:text-4xl">
            {success ? "Order Confirmed" : "Signal Lost"}
          </h1>
          
          <p className="mt-6 text-sm font-medium leading-relaxed text-stone-500">
            {state?.message || (success 
              ? "Your artifact selection has been secured. Our artisans are now preparing your order for its journey." 
              : "We encountered a discrepancy during the transaction process. Your selection remains reserved in your bag.")}
          </p>

          <div className="mt-10 space-y-3 rounded-3xl bg-stone-50/50 p-6">
            {state?.order?._id && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Trace ID</span>
                <span className="text-xs font-black text-stone-900">#{state.order._id.slice(-8).toUpperCase()}</span>
              </div>
            )}
            {state?.payment?.transactionId && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Reference</span>
                <span className="text-xs font-black text-stone-900 truncate ml-4 max-w-[120px]">{state.payment.transactionId}</span>
              </div>
            )}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <Link className="btn-secondary py-4" to="/shop">
              {success ? "Keep Exploring" : "Return to Shop"}
            </Link>
            {success && state?.order?._id ? (
              <Link className="btn-primary py-4" to={`/profile/orders/${state.order._id}`}>
                View Intel
              </Link>
            ) : !success ? (
              <Link className="btn-primary py-4" to="/checkout">
                Retry Flow
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
