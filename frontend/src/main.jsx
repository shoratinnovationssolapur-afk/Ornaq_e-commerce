import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { StoreProvider } from "./context/StoreContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "no-id-configured"}>
      <AuthProvider>
        <NotificationProvider>
          <StoreProvider>
            <App />
          </StoreProvider>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
