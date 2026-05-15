import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = useMemo(() => String(user?.role || "").toLowerCase() === "admin", [user]);
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await adminLogin(form.email, form.password);
      navigate(response.redirectTo || "/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-9rem)] bg-[radial-gradient(circle_at_top,_rgba(140,59,32,0.14),_transparent_38%),linear-gradient(180deg,#fffdf9_0%,#f8f1e9_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-brand-100 bg-brand-50/70 p-8 shadow-lg shadow-brand-200/40">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-700">Owner access only</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900">Admin control for catalog, stock, and orders.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
            Sign in with the owner account to manage products, monitor low-stock sarees, and process incoming orders from one secure dashboard.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { title: "Catalog", detail: "Add and edit sarees with images, pricing, and stock." },
              { title: "Inventory", detail: "Adjust live stock and spot low-stock items quickly." },
              { title: "Orders", detail: "Review recent orders and update fulfillment status." }
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4">
                <p className="font-semibold text-stone-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="w-full rounded-[2rem] border border-stone-200 bg-white p-8 shadow-2xl shadow-stone-300/20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-stone-900">Admin login</h2>
            <p className="mt-2 text-sm text-stone-500">Accessible only via direct URL. No public admin links are exposed.</p>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700">Email Address</label>
              <input
                required
                className="mt-2 w-full rounded-2xl border border-stone-300 p-3.5 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                type="email"
                placeholder="admin@ornac.com"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Password</label>
              <input
                required
                className="mt-2 w-full rounded-2xl border border-stone-300 p-3.5 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                type="password"
                placeholder="Enter your secure password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </div>
            {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <button
              disabled={loading}
              className="w-full rounded-2xl bg-stone-900 p-3.5 font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
