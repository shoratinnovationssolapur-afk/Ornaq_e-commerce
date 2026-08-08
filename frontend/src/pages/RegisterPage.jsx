import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { User, Mail, Lock, Phone, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="The ORNAQ Membership"
      subtitle="Join an exclusive circle of saree enthusiasts and get early access to our most precious handloom drops."
      image="/src/assets/hero-banner.png"
    >
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">New Account</p>
        <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-4xl">Join the Club</h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
            <input
              required
              className="w-full rounded-2xl bg-stone-50 px-5 py-4 pl-12 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>
        
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

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Secure Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
            <input
              required
              className="w-full rounded-2xl bg-stone-50 px-5 py-4 pl-12 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
              type="password"
              placeholder="Min. 6 characters"
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
          {loading ? "Creating..." : "Become a Member"}
        </button>
      </form>

      <p className="mt-8 text-center text-xs font-medium text-stone-500">
        Already a member?{" "}
        <Link to="/login" className="font-black text-brand-700 hover:text-brand-800 underline underline-offset-4 uppercase tracking-widest ml-1">
          Sign In
        </Link>
      </p>

      <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-stone-300 leading-relaxed">
        By joining, you agree to our <br />
        <Link to="/terms" className="hover:text-stone-400 underline">Terms</Link> & <Link to="/privacy" className="hover:text-stone-400 underline">Privacy Policy</Link>
      </p>
    </AuthLayout>
  );
}
