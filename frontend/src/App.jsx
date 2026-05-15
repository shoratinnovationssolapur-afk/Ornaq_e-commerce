import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AdminDashboard from "./pages/AdminDashboard";
import WishlistPage from "./pages/WishlistPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CheckoutPage from "./pages/CheckoutPage";
import OrderResultPage from "./pages/OrderResultPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import AddProductPage from "./pages/AddProductPage";
import BusinessFooter from "./components/BusinessFooter";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import InfoPage from "./pages/InfoPage";
import ToastViewport from "./components/ToastViewport";

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      <ToastViewport />
      <main className="pt-16 overflow-x-hidden min-h-screen bg-[#fffdf9]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-result" element={<ProtectedRoute><OrderResultPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/profile/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/profile/orders/:id" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
          <Route path="/track-order/:id" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute adminOnly><ProductManagementPage /></ProtectedRoute>} />
          <Route path="/admin/products/add" element={<ProtectedRoute adminOnly><AddProductPage /></ProtectedRoute>} />
          <Route path="/privacy-policy" element={<InfoPage slug="privacy-policy" />} />
          <Route path="/terms-and-conditions" element={<InfoPage slug="terms-and-conditions" />} />
          <Route path="/refund-policy" element={<InfoPage slug="refund-policy" />} />
          <Route path="/shipping-policy" element={<InfoPage slug="shipping-policy" />} />
          <Route path="/cancellation-policy" element={<InfoPage slug="cancellation-policy" />} />
          <Route path="/disclaimer" element={<InfoPage slug="disclaimer" />} />
          <Route path="/contact" element={<InfoPage slug="contact" />} />
          <Route path="/faq" element={<InfoPage slug="faq" />} />
        </Routes>
        {!isAdminRoute && <BusinessFooter />}
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
