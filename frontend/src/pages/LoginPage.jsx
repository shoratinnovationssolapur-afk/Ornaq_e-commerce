import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function LoginPage({ initialAccountType }) {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultAccountType =
    initialAccountType ||
    (location.pathname.startsWith("/admin") ? "admin" : "user");

  const {
    user,
    isAdmin,
    loading: authLoading,
    login,
    adminLogin,
    requestOtp,
    verifyOtp,
    googleLogin,
  } = useAuth();

  const [accountType, setAccountType] = useState(defaultAccountType);
  const [activeTab, setActiveTab] = useState("password");

  const [form, setForm] = useState({
    email: "",
    password: "",
    phone: "",
    otp: "",
  });

  const [otpRequested, setOtpRequested] = useState(false);
  const [previewCode, setPreviewCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [adminRedirectTo, setAdminRedirectTo] =
    useState("/admin/dashboard");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showOtp, setShowOtp] = useState(false);

  const isAdminLogin = accountType === "admin";

  useEffect(() => {
    if (authLoading) return;

    if (isAdmin) {
      navigate(adminRedirectTo, { replace: true });
      return;
    }

    if (
      user &&
      !isAdminLogin &&
      location.pathname === "/login"
    ) {
      navigate("/", { replace: true });
    }
  }, [
    adminRedirectTo,
    authLoading,
    isAdmin,
    isAdminLogin,
    location.pathname,
    navigate,
    user,
  ]);

  const selectAccountType = (type) => {
    setAccountType(type);
    setActiveTab("password");
    setOtpRequested(false);
    setPreviewCode("");
    setError("");
  };

  const submitPasswordLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isAdminLogin) {
        const response = await adminLogin(
          form.email,
          form.password
        );

        setAdminRedirectTo(
          response.redirectTo ||
            "/admin/dashboard"
        );
      } else {
        await login(
          form.email,
          form.password
        );

        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isAdminLogin
            ? "Admin login failed"
            : "Invalid credentials. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const submitOtpRequest = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await requestOtp({
        phone: form.phone,
      });

      setOtpRequested(true);
      setPreviewCode(
        response.previewCode || ""
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const submitOtpVerify = async () => {
    setError("");
    setLoading(true);

    try {
      await verifyOtp({
        phone: form.phone,
        otp: form.otp,
      });

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        isAdminLogin
          ? "Admin Control"
          : "Elegance Redefined"
      }
      subtitle={
        isAdminLogin
          ? "Manage catalog, stock, and orders from one secure workspace."
          : "Sign in to explore our latest collections and manage your luxury orders with ease."
      }
      image="/src/assets/hero-banner.png"
    >
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">
          Account Access
        </p>

        <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-4xl">
          {isAdminLogin
            ? "Admin Sign In"
            : "Welcome Back"}
        </h1>
      </div>

      {/* Account Type */}
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-stone-50 p-1.5">
        <button
          type="button"
          onClick={() =>
            selectAccountType("user")
          }
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
            !isAdminLogin
              ? "bg-white text-stone-900 shadow-xl shadow-stone-200/50"
              : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <UserRound size={16} />
          User
        </button>

        <button
          type="button"
          onClick={() =>
            selectAccountType("admin")
          }
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
            isAdminLogin
              ? "bg-white text-stone-900 shadow-xl shadow-stone-200/50"
              : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <ShieldCheck size={16} />
          Admin
        </button>
      </div>

      {/* Login Tabs */}
      {!isAdminLogin && (
        <div className="mb-8 flex gap-2 rounded-2xl bg-stone-50 p-1.5">
          <button
            onClick={() =>
              setActiveTab("password")
            }
            className={`flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "password"
                ? "bg-white text-stone-900 shadow-xl shadow-stone-200/50"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            Password
          </button>

          <button
            onClick={() =>
              setActiveTab("otp")
            }
            className={`flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "otp"
                ? "bg-white text-stone-900 shadow-xl shadow-stone-200/50"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            Mobile OTP
          </button>
        </div>
      )}

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
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300"
                  size={18}
                />

                <input
                  required
                  type="email"
                  placeholder="name@gmail.com"
                  className="w-full rounded-2xl bg-stone-50 px-5 py-4 pl-12 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Password
                </label>

                {!isAdminLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-black uppercase tracking-widest text-brand-700 hover:text-brand-800"
                  >
                    Forgot?
                  </Link>
                )}
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300"
                  size={18}
                />

                <input
                  required
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Password"
                  className="w-full rounded-2xl bg-stone-50 px-5 py-4 pl-12 pr-12 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password:
                        e.target.value,
                    })
                  }
                />

                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-500 ml-2">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="btn-primary w-full py-4 shadow-xl shadow-stone-200/50 mt-4"
            >
              {loading
                ? "Verifying..."
                : "Sign In"}
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">
                    Mobile Number
                  </label>

                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300"
                      size={18}
                    />

                    <input
                      required
                      type="tel"
                      placeholder="+91 9876543210"
                      className="w-full rounded-2xl bg-stone-50 px-5 py-4 pl-12 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone:
                            e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-500 ml-2">
                    {error}
                  </p>
                )}

                <button
                  onClick={submitOtpRequest}
                  disabled={
                    loading ||
                    !form.phone
                  }
                  className="btn-primary w-full py-4 shadow-xl shadow-stone-200/50 mt-4"
                >
                  {loading
                    ? "Sending..."
                    : "Request OTP"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-xs font-medium text-stone-500">
                    Enter OTP sent to
                  </p>

                  <p className="text-sm font-black text-stone-900 mt-1">
                    {form.phone}
                  </p>
                </div>

                {/* OTP Input */}
                <div className="relative">
                  <input
                    required
                    type={
                      showOtp
                        ? "text"
                        : "password"
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="w-full rounded-3xl bg-stone-50 px-5 py-6 pr-14 text-center text-3xl font-black tracking-[0.5em] border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
                    value={form.otp}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        otp:
                          e.target.value,
                      })
                    }
                  />

                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() =>
                      setShowOtp(!showOtp)
                    }
                  >
                    {showOtp ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </div>
                </div>

                {previewCode && (
                  <div className="rounded-2xl bg-brand-50 p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">
                      Development OTP
                    </p>

                    <p className="mt-1 text-lg font-black text-brand-900">
                      {previewCode}
                    </p>
                  </div>
                )}

                {error && (
                  <p className="text-xs font-bold text-red-500 text-center">
                    {error}
                  </p>
                )}

                <div className="space-y-3">
                  <button
                    onClick={submitOtpVerify}
                    disabled={
                      loading ||
                      form.otp.length < 4
                    }
                    className="btn-primary w-full py-4 shadow-xl shadow-stone-200/50"
                  >
                    {loading
                      ? "Verifying..."
                      : "Verify OTP"}
                  </button>

                  <button
                    onClick={() =>
                      setOtpRequested(false)
                    }
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
    </AuthLayout>
  );
}
