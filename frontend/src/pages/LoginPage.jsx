import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { Mail, Lock, Phone, ArrowRight } from "lucide-react";

// Lightweight JWT payload decoder for Google credential (no external lib needed)
const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, requestOtp, verifyOtp, googleLogin } = useAuth();
  const [activeTab, setActiveTab] = useState("password"); // 'password' or 'otp'
  const [form, setForm] = useState({ email: "", password: "", phone: "", otp: "" });
  const [otpRequested, setOtpRequested] = useState(false);
  const [previewCode, setPreviewCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitPasswordLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitOtpRequest = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await requestOtp({ phone: form.phone });
      setOtpRequested(true);
      setPreviewCode(response.previewCode || "");
      // Optional: Add a toast or message here
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const submitOtpVerify = async () => {
    setError("");
    setLoading(true);
    try {
      await verifyOtp({ phone: form.phone, otp: form.otp });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Elegance Redefined"
      subtitle="Sign in to explore our latest collections and manage your luxury orders with ease."
      image="/src/assets/hero-banner.png"
    >
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Account Access</p>
        <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-4xl">Welcome Back</h1>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-2 rounded-2xl bg-stone-50 p-1.5">
        <button
          onClick={() => setActiveTab("password")}
          className={`flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "password" ? "bg-white text-stone-900 shadow-xl shadow-stone-200/50" : "text-stone-400 hover:text-stone-600"
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setActiveTab("otp")}
          className={`flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "otp" ? "bg-white text-stone-900 shadow-xl shadow-stone-200/50" : "text-stone-400 hover:text-stone-600"
          }`}
        >
          Mobile OTP
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "password" ? (
          <motion.form
            key="password"
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
                  placeholder="name@luxury.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Password</label>
                <Link to="/forgot-password" shaking className="text-[10px] font-black uppercase tracking-widest text-brand-700 hover:text-brand-800">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                <input
                  required
                  className="w-full rounded-2xl bg-stone-50 px-5 py-4 pl-12 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
            {error && <p className="text-xs font-bold text-red-500 ml-2">{error}</p>}
            <button
              disabled={loading}
              className="btn-primary w-full py-4 shadow-xl shadow-stone-200/50 mt-4"
            >
              {loading ? "Verifying..." : "Sign In Securely"}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {!otpRequested ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input
                      required
                      className="w-full rounded-2xl bg-stone-50 px-5 py-4 pl-12 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                {error && <p className="text-xs font-bold text-red-500 ml-2">{error}</p>}
                <button
                  onClick={submitOtpRequest}
                  disabled={loading || !form.phone}
                  className="btn-primary w-full py-4 shadow-xl shadow-stone-200/50 mt-4"
                >
                  {loading ? "Sending..." : "Request Access Code"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-xs font-medium text-stone-500">Enter the 6-digit code sent to</p>
                  <p className="text-sm font-black text-stone-900 mt-1">{form.phone}</p>
                </div>
                <input
                  required
                  className="w-full rounded-3xl bg-stone-50 px-5 py-6 text-center text-3xl font-black tracking-[0.5em] border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
                  placeholder="000000"
                  maxLength={6}
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                />
                {previewCode && (
                  <div className="rounded-2xl bg-brand-50 p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Development OTP</p>
                    <p className="mt-1 text-lg font-black text-brand-900">{previewCode}</p>
                  </div>
                )}
                {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
                <div className="space-y-3">
                  <button
                    onClick={submitOtpVerify}
                    disabled={loading || form.otp.length < 4}
                    className="btn-primary w-full py-4 shadow-xl shadow-stone-200/50"
                  >
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </button>
                  <button
                    onClick={() => setOtpRequested(false)}
                    className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    Change Number
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-100"></div>
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
          <span className="bg-white px-6 text-stone-300">Social Sign In</span>
        </div>
      </div>

      <div className="flex justify-center rounded-2xl overflow-hidden border border-stone-100 p-1">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            setError("");
            setLoading(true);
            try {
              const payload = decodeJwtPayload(credentialResponse.credential);
              if (!payload?.email || !payload?.name) {
                setError("Google profile unavailable.");
                setLoading(false);
                return;
              }
              await googleLogin({
                email: payload.email,
                name: payload.name,
                googleId: payload.sub,
                avatar: payload.picture || ""
              });
              navigate("/");
            } catch (err) {
              setError("Login failed");
            } finally {
              setLoading(false);
            }
          }}
          onError={() => setError("Google Login Failed")}
          useOneTap
          theme="filled_blue"
          shape="pill"
          width="100%"
        />
      </div>

      <p className="mt-12 text-center text-xs font-medium text-stone-500">
        New to ORNAQ?{" "}
        <Link to="/register" className="font-black text-brand-700 hover:text-brand-800 underline underline-offset-4 uppercase tracking-widest ml-1">
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
}
