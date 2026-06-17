import axios from "axios";

const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");
const isLocalhostUrl = (value = "") => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value);
const productionApiUrl = "https://api.ornaq.in/api";

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (configuredUrl) {
    const url = trimTrailingSlash(configuredUrl);
    if (import.meta.env.PROD && isLocalhostUrl(url)) {
      return productionApiUrl;
    }
    return url.endsWith("/api") ? url : `${url}/api`;
  }

  return productionApiUrl;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.userMessage = "Unable to reach the server. Please try again in a few seconds.";
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
  error.response?.data?.message || error.userMessage || fallback;

export default api;
