import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AdminDashboard from "./pages/AdminDashboard";
import WishlistPage from "./pages/WishlistPage";
import LoginPage from "./pages/LoginPage";
import UserLoginPage from "./pages/UserLoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import CheckoutPage from "./pages/CheckoutPage";
import OrderResultPage from "./pages/OrderResultPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import AddProductPage from "./pages/AddProductPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminStoriesPage from "./pages/AdminStoriesPage";
import BusinessFooter from "./components/BusinessFooter";
import InfoPage from "./pages/InfoPage";
import ToastViewport from "./components/ToastViewport";
import ProductDetails from "./pages/ProductDetails";
import PolicyManagementPage from "./pages/PolicyManagementPage";
import OrderHistoryPage from "./pages/OrderHistoryPage"

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAdminLoginRoute = location.pathname === "/admin" || location.pathname === "/admin/login";
  const isUserLoginRoute = location.pathname === "/login";
  const isAuthRoute = isUserLoginRoute || isAdminLoginRoute;
  const showAdminChrome = isAdminRoute && !isAdminLoginRoute;
  const showCustomerChrome = !isAdminRoute && !isAuthRoute;
  const showFooter = showCustomerChrome;

  return (
    <>
      <ScrollToTop />
      {showAdminChrome && <AdminNavbar />}
      {showCustomerChrome && <Navbar />}
      <ToastViewport />
      <main className={`${isAuthRoute ? "" : "pt-16"} overflow-x-hidden min-h-screen bg-[#fffdf9]`}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-result" element={<OrderResultPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/orders/:id" element={<ProtectedRoute ><OrderTrackingPage /></ProtectedRoute>} />
          <Route
  path="/profile/orders"
  element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>}
/>
          <Route path="/track-order/:id" element={<ProtectedRoute adminOnly><OrderTrackingPage /></ProtectedRoute>} />
          <Route path="/admin" element={<LoginPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute adminOnly><ProductManagementPage /></ProtectedRoute>} />
          <Route path="/admin/products/add" element={<ProtectedRoute adminOnly><AddProductPage /></ProtectedRoute>} />
          <Route path="/admin/stories" element={<ProtectedRoute adminOnly><AdminStoriesPage /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>} />
          <Route path="/admin/policies" element={<ProtectedRoute adminOnly><PolicyManagementPage /></ProtectedRoute>} />
          <Route path="/privacy-policy" element={<InfoPage slug="privacy-policy" />} />
          <Route path="/terms-and-conditions" element={<InfoPage slug="terms-and-conditions" />} />
          <Route path="/refund-return-replacement-policy" element={<InfoPage slug="refund-return-replacement-policy" />} />
          <Route path="/refund-policy" element={<InfoPage slug="refund-return-replacement-policy" />} />
          <Route path="/shipping-policy" element={<InfoPage slug="shipping-policy" />} />
          <Route path="/cancellation-policy" element={<InfoPage slug="cancellation-policy" />} />
          <Route path="/disclaimer" element={<InfoPage slug="disclaimer" />} />
          <Route path="/contact" element={<InfoPage slug="contact" />} />
          <Route path="/faq" element={<InfoPage slug="faq" />} />
          <Route path="/policies/:slug" element={<InfoPage />} />
          <Route
            path="/saree/:code"
            element={<ProductDetails />}
          />
        </Routes>
        {showFooter && <BusinessFooter />}
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
