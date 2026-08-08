import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { syncSocketAuth } from "../services/socket";
import { clearStoredToken, getStoredToken, hasValidStoredToken, onAuthSessionChange, setStoredToken } from "../utils/authSession";



const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = useMemo(() => String(user?.role || "").toLowerCase() === "admin", [user]);

  useEffect(() => {
    const token = getStoredToken();
    syncSocketAuth();
    if (!token || !hasValidStoredToken()) {
      if (token) clearStoredToken();
      setLoading(false);
      return;
    }
    api
      .get("/auth/profile")
      .then((res) => setUser(res.data))
      .catch(() => {
        clearStoredToken();
        setUser(null);
        syncSocketAuth();
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => onAuthSessionChange(() => {
    if (!getStoredToken()) {
      setUser(null);
      syncSocketAuth();
    }
  }), []);

  const persistSession = (payload) => {
    setStoredToken(payload.token);
    setUser(payload.user);
    syncSocketAuth();
    return payload;
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return persistSession(res.data).user;
  };

  const adminLogin = async (email, password) => {
    const res = await api.post("/admin/login", { email, password });
    return persistSession(res.data);
  };

  const register = async ({ name, email, password, phone }) => {
    const res = await api.post("/auth/register", { name, email, password, phone });
    return persistSession(res.data).user;
  };

  const requestOtp = async ({ phone, name, email }) => {
    const res = await api.post("/auth/request-otp", { phone, name, email });
    return res.data;
  };

  const verifyOtp = async ({ phone, email, otp }) => {
    const res = await api.post("/auth/verify-otp", { phone, email, otp });
    return persistSession(res.data).user;
  };

  const googleLogin = async (profile) => {
    const res = await api.post("/auth/google", profile);
    return persistSession(res.data).user;
  };

  const logout = (navigate, path = "/login") => {
  localStorage.removeItem("token");
  setUser(null);
  syncSocketAuth();

  navigate(path, { replace: true });
};

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      login,
      adminLogin,
      register,
      requestOtp,
      verifyOtp,
      googleLogin,
      logout
    }),
    [user, isAdmin, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
