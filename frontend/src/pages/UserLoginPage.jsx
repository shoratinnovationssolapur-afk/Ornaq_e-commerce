import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, KeyRound, Mail, Sparkles } from "lucide-react";

export default function UserLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading: authLoading, requestOtp, verifyOtp } = useAuth();
  const [form, setForm] = useState({ email: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fromPath = location.state?.from?.pathname;
  const redirectTo = fromPath && !fromPath.startsWith("/admin") ? fromPath : "/home";

  useEffect(() => {
    if (authLoading || !user) return;
    navigate(isAdmin ? "/admin/dashboard" : redirectTo, { replace: true });
  }, [authLoading, isAdmin, navigate, redirectTo, user]);

  const submitOtpLogin = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!otpSent) {
        const response = await requestOtp({ email: form.email });
        setOtpSent(true);
        setMessage("OTP sent to your email.");
        return;
      }

      await verifyOtp({ email: form.email, otp: form.otp });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to complete email OTP login.");
    } finally {
      setLoading(false);
    }
  };

  const editEmail = () => {
    setOtpSent(false);
    setForm((current) => ({ ...current, otp: "" }));
    setError("");
    setMessage("");
  };

  return (
    <AuthLayout
      title="Customer Login"
      subtitle="Enter your email, receive a one-time code, and continue shopping."
      image="/src/assets/hero-banner.png"
    >
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Customer Access</p>
        <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-4xl">Sign In with OTP</h1>
      </div>

      <div className="mb-6 rounded-2xl bg-stone-50 p-1.5">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-black uppercase tracking-widest text-stone-900 shadow-xl shadow-stone-200/50 transition-all"
        >
          <Sparkles size={16} />
          Email OTP Login
        </button>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onSubmit={submitOtpLogin}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
            <input
              required
              className="w-full rounded-2xl bg-stone-50 px-5 py-4 pl-12 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all disabled:cursor-not-allowed disabled:opacity-70"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              disabled={otpSent || loading}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </div>
          {otpSent && (
            <button
              type="button"
              onClick={editEmail}
              className="ml-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-700 hover:text-brand-800"
            >
              <ArrowLeft size={12} />
              Change email
            </button>
          )}
        </div>

        {otpSent && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Email OTP</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input
                required
                className="w-full rounded-2xl bg-stone-50 px-5 py-4 pl-12 text-center text-lg font-black tracking-[0.4em] border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={form.otp}
                onChange={(event) => setForm({ ...form, otp: event.target.value.replace(/\D/g, "").slice(0, 6) })}
              />
            </div>
          </div>
        )}

        {message && <p className="text-xs font-bold text-emerald-600 ml-2">{message}</p>}
        {error && <p className="text-xs font-bold text-red-500 ml-2">{error}</p>}
        <button disabled={loading} className="btn-primary w-full py-4 shadow-xl shadow-stone-200/50">
          {loading ? (otpSent ? "Verifying..." : "Sending OTP...") : otpSent ? "Verify & Continue" : "Send Login OTP"}
        </button>
      </motion.form>

      <p className="mt-8 text-center text-xs font-medium text-stone-500">
        Store admin?{" "}
        <Link to="/admin/login" className="font-black text-brand-700 hover:text-brand-800 underline underline-offset-4 uppercase tracking-widest ml-1">
          Admin Login
        </Link>
      </p>
    </AuthLayout>
  );
}
