import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-center text-stone-500">Loading your account...</div>;
  if (!user) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace state={{ from: location }} />;
  }
  if (adminOnly && !isAdmin) return <Navigate to="/profile" replace />;
  if (!adminOnly && isAdmin) return <Navigate to="/admin/dashboard" replace />;

  return children;
}
