export default function PaymentModal({ open, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl">
        <p className="text-sm text-zinc-500">Demo Payment</p>
        <h3 className="mt-2 text-lg font-semibold">{message}</h3>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded bg-zinc-200">
          <div className="h-full w-1/2 animate-pulse bg-brand-700" />
        </div>
      </div>
    </div>
  );
}
