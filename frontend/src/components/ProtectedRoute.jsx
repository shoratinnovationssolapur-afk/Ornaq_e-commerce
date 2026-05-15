import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-stone-500">Loading your account...</div>;
  if (!user) {
    return <Navigate to={adminOnly ? "/admin" : "/login"} replace />;
  }
  if (adminOnly && String(user.role).toLowerCase() !== "admin") return <Navigate to="/" replace />;

  return children;
}
