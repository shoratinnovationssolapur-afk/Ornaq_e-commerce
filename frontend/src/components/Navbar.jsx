import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useStore();

  useEffect(() => {
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, [cart]);

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      <nav className="navbar-base">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">ORNAQ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink 
              to="/" 
              className={({ isActive }) => `px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-brand-700 border-b-2 border-brand-700' : 'text-zinc-500 hover:text-zinc-900'}`}
              onClick={closeMobileMenu}
            >
              Home
            </NavLink>
            <NavLink 
              to="/shop" 
              className={({ isActive }) => `px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-brand-700 border-b-2 border-brand-700' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Shop
            </NavLink>
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
            {user ? (
              <div className="flex items-center space-x-6">
                <NavLink 
                  to="/wishlist" 
                  className={({ isActive }) => `px-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-brand-700' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  Wishlist
                </NavLink>
                <NavLink 
                  to="/profile" 
                  className={({ isActive }) => `px-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-brand-700' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  Profile
                </NavLink>
                {isAdmin && (
                  <NavLink 
                    to="/admin/dashboard" 
                    className="px-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 hover:text-brand-700"
                  >
                    Admin
                  </NavLink>
                )}
                <button 
                  onClick={logout}
                  className="px-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <NavLink 
                to="/login" 
                className="px-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900"
              >
                Sign In
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
                <Link to="/" className="text-2xl font-black tracking-tight text-zinc-900" onClick={closeMobileMenu}>
                  ORNAQ
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
                  <p className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Navigation</p>
                  <NavLink to="/" className="nav-link" onClick={closeMobileMenu}>
                    <span className="flex-1">Home</span>
                    <svg className="h-5 w-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </NavLink>
                  <NavLink to="/shop" className="nav-link" onClick={closeMobileMenu}>
                    <span className="flex-1">Shop Collection</span>
                    <svg className="h-5 w-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </NavLink>
                  <NavLink to="/cart" className="nav-link" onClick={closeMobileMenu}>
                    <span className="flex-1">My Cart</span>
                    <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded text-xs font-bold mr-3">{cartCount}</span>
                    <svg className="h-5 w-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </NavLink>

                  <div className="mt-6">
                    <p className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Account</p>
                    {user ? (
                      <>
                        <NavLink to="/wishlist" className="nav-link" onClick={closeMobileMenu}>
                          <span className="flex-1">Wishlist</span>
                        </NavLink>
                        <NavLink to="/profile" className="nav-link" onClick={closeMobileMenu}>
                          <span className="flex-1">Profile</span>
                        </NavLink>
                        <NavLink to="/profile/orders" className="nav-link" onClick={closeMobileMenu}>
                          <span className="flex-1">My Orders</span>
                        </NavLink>
                        {isAdmin && (
                          <NavLink to="/admin/dashboard" className="nav-link text-brand-600 bg-brand-50/50" onClick={closeMobileMenu}>
                            <span className="flex-1">Admin Dashboard</span>
                          </NavLink>
                        )}
                        <button 
                          onClick={() => { logout(); closeMobileMenu(); }} 
                          className="nav-link w-full text-left font-bold text-red-500 hover:text-red-600"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <NavLink to="/login" className="nav-link text-brand-700" onClick={closeMobileMenu}>
                        <span className="flex-1 font-bold">Sign In to Account</span>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
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
