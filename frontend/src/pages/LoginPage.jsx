import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading: authLoading, adminLogin } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const redirectTo = location.state?.from?.pathname?.startsWith("/admin") ? "/admin/dashboard" : "/admin/dashboard";

  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, isAdmin, navigate, redirectTo]);

  const submitPasswordLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Control"
      subtitle="Manage catalog, stock, and orders from one secure workspace."
      image="/src/assets/hero-banner.png"
    >
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Account Access</p>
        <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-4xl">Admin Sign In</h1>
      </div>

      <div className="mb-6 rounded-2xl bg-stone-50 p-1.5">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-black uppercase tracking-widest text-stone-900 shadow-xl shadow-stone-200/50 transition-all"
        >
          <ShieldCheck size={16} />
          Admin Workspace
        </button>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onSubmit={submitPasswordLogin}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
            <input
              required
              className="w-full rounded-2xl bg-stone-50 px-5 py-4 pl-12 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
              type="email"
              placeholder="admin@ornac.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
            <input
              required
              className="w-full rounded-2xl bg-stone-50 px-5 py-4 pl-12 pr-12 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-xs font-bold text-red-500 ml-2">{error}</p>}
        <button
          disabled={loading}
          className="btn-primary w-full py-4 shadow-xl shadow-stone-200/50"
        >
          {loading ? "Signing in..." : "Sign In to Dashboard"}
        </button>
      </motion.form>
    </AuthLayout>
  );
}
