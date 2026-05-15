import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      eyebrow="Security" 
      title="Access Recovery" 
      subtitle="Enter your digital identifier to initiate the secure credential restoration sequence."
    >
      <form onSubmit={submit} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 ml-4">Digital Identifier</label>
          <input
            required
            className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        
        {message && (
          <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100 animate-fade-in">
            <p className="text-xs font-bold text-stone-600 uppercase tracking-widest">{message}</p>
          </div>
        )}

        <button disabled={loading} className="btn-primary w-full py-5">
          {loading ? "Transmitting..." : "Initiate Recovery"}
        </button>

        <p className="text-center text-[10px] font-black uppercase tracking-widest text-stone-400">
          Recalled credentials? <Link to="/login" className="text-brand-700 hover:text-brand-800 underline underline-offset-4">Sign In</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
