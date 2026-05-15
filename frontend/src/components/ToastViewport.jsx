import { AnimatePresence, motion } from "framer-motion";
import { useNotification } from "../context/NotificationContext";

const toneStyles = {
  default: "border-stone-200 bg-white text-stone-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-brand-200 bg-brand-50 text-brand-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900"
};

export default function ToastViewport() {
  const { toasts, dismiss } = useNotification();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[80] mx-auto flex max-w-7xl flex-col items-end gap-3 px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className={`pointer-events-auto w-full max-w-sm rounded-[1.5rem] border px-4 py-4 shadow-xl shadow-stone-300/20 ${toneStyles[toast.tone] || toneStyles.default}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.message && <p className="mt-1 text-sm opacity-80">{toast.message}</p>}
              </div>
              <button type="button" onClick={() => dismiss(toast.id)} className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">
                Close
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
