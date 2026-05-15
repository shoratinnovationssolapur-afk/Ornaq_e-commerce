import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/reset-password", {
        token: searchParams.get("token"),
        password
      });
      setMessage(response.data.message);
      window.setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      eyebrow="Identity" 
      title="Credential Reset" 
      subtitle="Finalize your account recovery by establishing a new high-security access key."
    >
      <form onSubmit={submit} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 ml-4">New Secret Key</label>
          <input
            required
            minLength={6}
            className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        
        {message && (
          <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100 animate-fade-in">
            <p className="text-xs font-bold text-stone-600 uppercase tracking-widest">{message}</p>
          </div>
        )}

        <button disabled={loading} className="btn-primary w-full py-5">
          {loading ? "Reconfiguring..." : "Establish New Key"}
        </button>

        <p className="text-center text-[10px] font-black uppercase tracking-widest text-stone-400">
          Aborting recovery? <Link to="/login" className="text-brand-700 hover:text-brand-800 underline underline-offset-4">Return to Portal</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
