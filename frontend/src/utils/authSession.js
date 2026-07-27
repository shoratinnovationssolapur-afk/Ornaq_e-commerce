const TOKEN_KEY = "token";
const AUTH_CHANGED_EVENT = "ornac:auth-changed";

const decodeJwtPayload = (token) => {
  try {
    const [, payload] = String(token).split(".");
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "="));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const isTokenExpired = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
};

export const hasValidStoredToken = () => {
  const token = getStoredToken();
  return Boolean(token && !isTokenExpired(token));
};

export const setStoredToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const onAuthSessionChange = (handler) => {
  window.addEventListener(AUTH_CHANGED_EVENT, handler);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, handler);
};
