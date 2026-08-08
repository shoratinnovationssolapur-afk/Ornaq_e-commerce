import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import logoGold from "../assets/logo-gold.jpeg";
import { JEWELLERY_CATEGORY } from "../utils/catalog";

function BrandLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${
          compact ? "h-9 w-9" : "h-12 w-12"
        } overflow-hidden rounded-full shadow-md flex-shrink-0`}
      >
        <img
          src={logoGold}
          alt="ORNAQ"
          className="h-full w-full object-cover"
        />
      </div>

      <span className="leading-none">
        <span
          className={`${
            compact ? "text-xl" : "text-2xl"
          } block font-black tracking-tight text-stone-900 sm:text-3xl`}
        >
          ORNAQ
        </span>

        <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">
          Wear Your Story
        </span>
      </span>
    </div>
  );
}

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [sareeCode, setSareeCode] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAdmin, logout } = useAuth();
  const { cart } = useStore();

  useEffect(() => {
    setCartCount(
      cart.reduce(
        (sum, item) =>
          sum + Number(item.qty || item.quantity || 0),
        0
      )
    );
  }, [cart]);

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const handleSareeSearch = () => {
    const code = sareeCode.trim();

    if (!code) return;

    navigate(`/saree/${encodeURIComponent(code)}`);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    closeMobileMenu();
    logout(navigate, "/login");
  };

  const isJewelleryView =
    location.pathname === "/shop" &&
    new URLSearchParams(location.search).get("category") ===
      JEWELLERY_CATEGORY;

  const isShopView =
    location.pathname === "/shop" && !isJewelleryView;

  const getUserInitial = () => {
    if (!user?.name) return "U";

    return user.name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* =========================================================
          DESKTOP / MAIN NAVBAR
      ========================================================== */}
      <nav className="navbar-base">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* ================= LOGO ================= */}
          <Link
            to="/home"
            className="flex items-center"
            onClick={closeMobileMenu}
            aria-label="ORNAQ home"
          >
            <BrandLogo />
          </Link>

          {/* ================= DESKTOP NAVIGATION ================= */}
          <div className="hidden md:flex items-center space-x-6">

            {/* HOME */}
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-700 border-b-2 border-brand-700"
                    : "text-zinc-500 hover:text-zinc-900"
                }`
              }
              onClick={closeMobileMenu}
            >
              Home
            </NavLink>

            {/* SHOP */}
            <Link
              to="/shop"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isShopView
                  ? "text-brand-700 border-b-2 border-brand-700"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Shop
            </Link>

            {/* JEWELLERY */}
            <Link
              to={`/shop?category=${encodeURIComponent(
                JEWELLERY_CATEGORY
              )}`}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isJewelleryView
                  ? "text-brand-700 border-b-2 border-brand-700"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Jewellery
            </Link>

            {/* =================================================
                ITEM CODE SEARCH
            ================================================== */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder=" Item Code"
                value={sareeCode}
                onChange={(e) => setSareeCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSareeSearch();
                  }
                }}
                className="px-3 py-1 outline-none text-sm w-28"
              />

              <button
                type="button"
                onClick={handleSareeSearch}
                className="bg-black text-white px-3 py-1 text-sm"
              >
                Search
              </button>
            </div>

            {/* ================= CART ================= */}
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `relative px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-700 border-b-2 border-brand-700"
                    : "text-zinc-500 hover:text-zinc-900"
                }`
              }
            >
              Cart

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] rounded-full bg-brand-600 px-1.5 py-0.5 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </NavLink>

            {/* ================= WISHLIST ================= */}
            <NavLink
              to="/wishlist"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-700 border-b-2 border-brand-700"
                    : "text-zinc-500 hover:text-zinc-900"
                }`
              }
            >
              Wishlist
            </NavLink>

            {/* =================================================
                USER PROFILE
            ================================================== */}
            {user && !isAdmin ? (
              <div
                className="relative"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                {/* PROFILE BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen((prev) => !prev)
                  }
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-zinc-50"
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-black text-brand-700">
                    {getUserInitial()}
                  </div>

                  {/* User Name */}
                  <div className="hidden lg:block text-left">
                    <p className="max-w-[100px] truncate text-xs font-bold text-zinc-900">
                      {user.name || "User"}
                    </p>

                    <p className="max-w-[100px] truncate text-[9px] text-zinc-400">
                      {user.email || ""}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg
                    className={`h-4 w-4 text-zinc-400 transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </button>

                {/* ================= PROFILE DROPDOWN ================= */}
                {profileOpen && (
                  <div className="absolute right-0 top-full z-[300] w-64 pt-2">
                    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white p-2 shadow-2xl shadow-zinc-200/60">

                      {/* USER INFORMATION */}
                      <div className="border-b border-zinc-100 px-4 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-base font-black text-brand-700">
                            {getUserInitial()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-zinc-900">
                              {user.name || "User"}
                            </p>

                            <p className="truncate text-[10px] text-zinc-400">
                              {user.email || ""}
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* MY PROFILE */}
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                          location.pathname === "/profile"
                            ? "bg-brand-50 text-brand-700"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-brand-700"
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.5 20.25a8.25 8.25 0 0115 0"
                          />
                        </svg>

                        <span>My Profile</span>
                      </Link>

                      {/* ORDER HISTORY */}
                      <Link
                        to="/profile/orders"
                        onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                          location.pathname.startsWith(
                            "/profile/orders"
                          )
                            ? "bg-brand-50 text-brand-700"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-brand-700"
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75z"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 8h8M8 12h8M8 16h5"
                          />
                        </svg>

                        <span>Order History</span>
                      </Link>

                      {/* DIVIDER */}
                      <div className="my-1 border-t border-zinc-100" />

                      {/* SIGN OUT */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 12H9m0 0 3-3m-3 3 3 3"
                          />
                        </svg>

                        <span>Sign Out</span>
                      </button>

                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* =================================================
                ADMIN
            ================================================== */}
            {isAdmin ? (
              <div className="flex items-center space-x-4">

                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-brand-700 border-b-2 border-brand-700"
                        : "text-brand-600 hover:text-brand-700"
                    }`
                  }
                >
                  Dashboard
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:border-red-500 hover:text-red-600"
                >
                  Sign Out
                </button>

              </div>
            ) : !user ? (
              <NavLink
                to="/admin/login"
                className={({ isActive }) =>
                  `rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "border-black text-black hover:bg-black hover:text-white"
                  }`
                }
              >
                Admin Login
              </NavLink>
            ) : null}
          </div>

          {/* ================= MOBILE HAMBURGER ================= */}
          <button
            className="hamburger md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span
              className={`hamburger-line ${
                isMobileOpen
                  ? "w-6 rotate-45 translate-y-2"
                  : "w-6"
              }`}
            />

            <span
              className={`hamburger-line ${
                isMobileOpen
                  ? "opacity-0"
                  : "w-4 opacity-100"
              }`}
            />

            <span
              className={`hamburger-line ${
                isMobileOpen
                  ? "w-6 -rotate-45 -translate-y-2"
                  : "w-5"
              }`}
            />
          </button>

        </div>
      </nav>

      {/* =========================================================
          MOBILE MENU
      ========================================================== */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">

            {/* Overlay */}
            <motion.div
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
            />

            {/* Drawer */}
            <motion.div
              className="mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
              }}
            >

              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-100">

                <Link
                  to="/home"
                  onClick={closeMobileMenu}
                  aria-label="ORNAQ home"
                >
                  <BrandLogo compact />
                </Link>

                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    className="h-6 w-6 text-zinc-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

              </div>

              <div className="flex-1 overflow-y-auto">

                <nav className="py-4">

                  {/* ITEM CODE SEARCH */}
                  <div className="px-6 mb-4">
                    <div className="flex border rounded-lg overflow-hidden">

                      <input
                        type="text"
                        placeholder="Enter Item Code"
                        value={sareeCode}
                        onChange={(e) =>
                          setSareeCode(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSareeSearch();
                            closeMobileMenu();
                          }
                        }}
                        className="flex-1 px-3 py-2 outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          handleSareeSearch();
                          closeMobileMenu();
                        }}
                        className="bg-black text-white px-4"
                      >
                        Go
                      </button>

                    </div>
                  </div>

                  <p className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    Navigation
                  </p>

                  {/* HOME */}
                  <NavLink
                    to="/home"
                    className="nav-link"
                    onClick={closeMobileMenu}
                  >
                    <span className="flex-1">Home</span>

                    <svg
                      className="h-5 w-5 text-zinc-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </NavLink>

                  {/* SHOP */}
                  <Link
                    to="/shop"
                    className={`nav-link ${
                      isShopView
                        ? "bg-brand-50/50 text-brand-700"
                        : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span className="flex-1">
                      Shop Collection
                    </span>

                    <svg
                      className="h-5 w-5 text-zinc-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>

                  {/* JEWELLERY */}
                  <Link
                    to={`/shop?category=${encodeURIComponent(
                      JEWELLERY_CATEGORY
                    )}`}
                    className="nav-link"
                    onClick={closeMobileMenu}
                  >
                    <span className="flex-1">
                      Imitation Jewellery
                    </span>

                    <svg
                      className="h-5 w-5 text-zinc-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>

                  {/* CART */}
                  <NavLink
                    to="/cart"
                    className="nav-link"
                    onClick={closeMobileMenu}
                  >
                    <span className="flex-1">
                      My Cart
                    </span>

                    <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded text-xs font-bold mr-3">
                      {cartCount}
                    </span>

                    <svg
                      className="h-5 w-5 text-zinc-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </NavLink>

                  {/* SAVED */}
                  <div className="mt-6">

                    <p className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                      Saved
                    </p>

                    {/* WISHLIST */}
                    <NavLink
                      to="/wishlist"
                      className="nav-link"
                      onClick={closeMobileMenu}
                    >
                      <span className="flex-1">
                        Wishlist
                      </span>
                    </NavLink>

                    {/* =================================================
                        MOBILE USER PROFILE
                    ================================================== */}
                    {user && !isAdmin && (
                      <>
                        <div className="mx-6 my-4 border-t border-zinc-100" />

                        {/* USER */}
                        <div className="px-6 py-3">
                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-base font-black text-brand-700">
                              {getUserInitial()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-zinc-900">
                                {user.name || "User"}
                              </p>

                              <p className="truncate text-[10px] text-zinc-400">
                                {user.email || ""}
                              </p>
                            </div>

                          </div>
                        </div>

                        {/* PROFILE */}
                        <NavLink
                          to="/profile"
                          className="nav-link"
                          onClick={closeMobileMenu}
                        >
                          <span className="flex-1">
                            My Profile
                          </span>

                          <svg
                            className="h-5 w-5 text-zinc-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </NavLink>

                        {/* ORDER HISTORY */}
                        <NavLink
                          to="/profile/orders"
                          className="nav-link"
                          onClick={closeMobileMenu}
                        >
                          <span className="flex-1">
                            Order History
                          </span>

                          <svg
                            className="h-5 w-5 text-zinc-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </NavLink>

                        {/* SIGN OUT */}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="nav-link w-full text-left font-bold text-red-500 hover:text-red-600"
                        >
                          <span className="flex-1">
                            Sign Out
                          </span>
                        </button>
                      </>
                    )}

                    {/* =================================================
                        ADMIN MOBILE
                    ================================================== */}
                    {isAdmin ? (
                      <>
                        <NavLink
                          to="/admin/dashboard"
                          className="nav-link text-brand-600 bg-brand-50/50"
                          onClick={closeMobileMenu}
                        >
                          <span className="flex-1">
                            Admin Dashboard
                          </span>
                        </NavLink>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="nav-link w-full text-left font-bold text-red-500 hover:text-red-600"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : !user ? (
                      <NavLink
                        to="/admin/login"
                        className="nav-link"
                        onClick={closeMobileMenu}
                      >
                        <span className="flex-1">
                          Admin Login
                        </span>

                        <svg
                          className="h-5 w-5 text-zinc-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </NavLink>
                    ) : null}

                  </div>
                </nav>
              </div>

              {/* FOOTER */}
              <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                <p className="text-xs text-zinc-500 text-center">
                  © 2026 ORNAQ Saree House. Premium Collection.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}