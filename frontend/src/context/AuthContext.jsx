import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { syncSocketAuth } from "../services/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    syncSocketAuth();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/profile")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        syncSocketAuth();
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (payload) => {
    localStorage.setItem("token", payload.token);
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
    console.log("Requesting OTP for:", phone);
    const res = await api.post("/auth/request-otp", { phone, name, email });
    console.log("OTP Request Response:", res.data);
    return res.data;
  };

  const verifyOtp = async ({ phone, otp }) => {
    console.log("Verifying OTP for:", phone, "with code:", otp);
    const res = await api.post("/auth/verify-otp", { phone, otp });
    return persistSession(res.data).user;
  };

  const googleLogin = async (profile) => {
    const res = await api.post("/auth/google", profile);
    return persistSession(res.data).user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    syncSocketAuth();
  };

  const value = useMemo(
    () => ({ user, loading, login, adminLogin, register, requestOtp, verifyOtp, googleLogin, logout }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
