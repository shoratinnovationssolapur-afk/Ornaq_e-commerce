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
  const location = useLocation();
  const { isAdmin, logout } = useAuth();
  const { cart } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    setCartCount(cart.reduce((sum, item) => sum + Number(item.qty || item.quantity || 0), 0));
  }, [cart]);

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  const closeMobileMenu = () => setIsMobileOpen(false);
  const handleSareeSearch = () => {
    const code = sareeCode.trim();
    if (!code) return;

    navigate(`/saree/${encodeURIComponent(code)}`);
  };
  const isJewelleryView =
    location.pathname === "/shop" &&
    new URLSearchParams(location.search).get("category") === JEWELLERY_CATEGORY;
  const isShopView = location.pathname === "/shop" && !isJewelleryView;

  return (
    <>
      <nav className="navbar-base">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/home" className="flex items-center" onClick={closeMobileMenu} aria-label="ORNAQ home">
            <BrandLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/home"
              className={({ isActive }) => `px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-brand-700 border-b-2 border-brand-700' : 'text-zinc-500 hover:text-zinc-900'}`}
              onClick={closeMobileMenu}
            >
              Home
            </NavLink>
            <Link
              to="/shop"
              className={`px-3 py-2 text-sm font-medium transition-colors ${isShopView ? "text-brand-700 border-b-2 border-brand-700" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              Shop
            </Link>
            <Link
              to={`/shop?category=${encodeURIComponent(JEWELLERY_CATEGORY)}`}
              className={`px-3 py-2 text-sm font-medium transition-colors ${isJewelleryView ? "text-brand-700 border-b-2 border-brand-700" : "text-zinc-500 hover:text-zinc-900"
                }`}
            >
              Jewellery
            </Link>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder=" Item Code"
                value={sareeCode}
                onChange={(e) =>
                  setSareeCode(e.target.value)
                }
                className="px-3 py-1 outline-none text-sm"
              />

              <button
                onClick={handleSareeSearch}
                className="bg-black text-white px-3 py-1 text-sm"
              >
                Search
              </button>
            </div>

            <NavLink
              to="/cart"
              className={({ isActive }) => `relative px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-brand-700 border-b-2 border-brand-700' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] rounded-full bg-brand-600 px-1.5 py-0.5 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/wishlist"
              className={({ isActive }) => `px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-brand-700 border-b-2 border-brand-700' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Wishlist
            </NavLink>
            {isAdmin ? (
  <div className="flex items-center space-x-6">
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
      onClick={logout}
      className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:border-red-500 hover:text-red-600"
    >
      Sign Out
    </button>
  </div>
) : (
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
)}
          </div>

          {/* Hamburger */}
          <button
            className="hamburger md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${isMobileOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
            <span className={`hamburger-line ${isMobileOpen ? 'opacity-0' : 'w-4 opacity-100'}`} />
            <span className={`hamburger-line ${isMobileOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">
            <motion.div
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
            />
            <motion.div
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                <Link to="/home" onClick={closeMobileMenu} aria-label="ORNAQ home">
                  <BrandLogo compact />
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <nav className="py-4">
                  <div className="px-6 mb-4">
                    <div className="flex border rounded-lg overflow-hidden">
                      <input
                        type="text"
                        placeholder="Enter Item Code"
                        value={sareeCode}
                        onChange={(e) =>
                          setSareeCode(e.target.value)
                        }
                        className="flex-1 px-3 py-2 outline-none"
                      />

                      <button
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
                  <p className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Navigation</p>
                  <NavLink to="/home" className="nav-link" onClick={closeMobileMenu}>
                    <span className="flex-1">Home</span>
                    <svg className="h-5 w-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </NavLink>
                  <Link to="/shop" className={`nav-link ${isShopView ? "bg-brand-50/50 text-brand-700" : ""}`} onClick={closeMobileMenu}>
                    <span className="flex-1">Shop Collection</span>
                    <svg className="h-5 w-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link to={`/shop?category=${encodeURIComponent(JEWELLERY_CATEGORY)}`} className="nav-link" onClick={closeMobileMenu}>
                    <span className="flex-1">Imitation Jewellery</span>
                    <svg className="h-5 w-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <NavLink to="/cart" className="nav-link" onClick={closeMobileMenu}>
                    <span className="flex-1">My Cart</span>
                    <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded text-xs font-bold mr-3">{cartCount}</span>
                    <svg className="h-5 w-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </NavLink>

                  <div className="mt-6">
                    <p className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Saved</p>
                    <NavLink to="/wishlist" className="nav-link" onClick={closeMobileMenu}>
                      <span className="flex-1">Wishlist</span>
                    </NavLink>
             {isAdmin ? (
  <>
    <NavLink
      to="/admin/dashboard"
      className="nav-link text-brand-600 bg-brand-50/50"
      onClick={closeMobileMenu}
    >
      <span className="flex-1">Admin Dashboard</span>
    </NavLink>

    <button
      onClick={() => {
        logout();
        closeMobileMenu();
      }}
      className="nav-link w-full text-left font-bold text-red-500 hover:text-red-600"
    >
      Sign Out
    </button>
  </>
) : (
  <NavLink
    to="/admin/login"
    className="nav-link"
    onClick={closeMobileMenu}
  >
    <span className="flex-1">Admin Login</span>
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
)}
                  </div>
                </nav>
              </div>

              <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                <p className="text-xs text-zinc-500 text-center">© 2026 ORNAQ Saree House. Premium Collection.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
