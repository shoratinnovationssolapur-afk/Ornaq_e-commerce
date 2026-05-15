import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function AdminNavbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  const closeMobileMenu = () => setIsMobileOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      <nav className="navbar-base">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/admin/dashboard" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <span className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">Admin Panel</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink 
              to="/admin/dashboard" 
              className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive ? 'bg-brand-100 text-brand-800 shadow-md' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}`}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/admin/products" 
              className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive ? 'bg-brand-100 text-brand-800 shadow-md' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}`}
            >
              Products
            </NavLink>
            <NavLink 
              to="/admin/products/add" 
              className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive ? 'bg-brand-100 text-brand-800 shadow-md' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}`}
            >
              Add Product
            </NavLink>
            <NavLink 
              to="/profile/orders" 
              className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            >
              Orders
            </NavLink>
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all shadow-sm"
            >
              Logout
            </button>
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
                <Link to="/admin/dashboard" className="text-xl font-bold tracking-tight text-zinc-900" onClick={closeMobileMenu}>
                  Admin Panel
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
                  <p className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Admin Controls</p>
                  <NavLink to="/admin/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/products" className="nav-link" onClick={closeMobileMenu}>
                    Product Management
                  </NavLink>
                  <NavLink to="/admin/products/add" className="nav-link" onClick={closeMobileMenu}>
                    Add New Product
                  </NavLink>
                  
                  <div className="mt-6">
                    <p className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Storefront</p>
                    <NavLink to="/profile/orders" className="nav-link" onClick={closeMobileMenu}>
                      View All Orders
                    </NavLink>
                    <NavLink to="/" className="nav-link text-brand-700 font-bold" onClick={closeMobileMenu}>
                      Back to Website
                    </NavLink>
                    <button 
                      onClick={handleLogout} 
                      className="nav-link w-full text-left font-bold text-red-500 hover:text-red-600"
                    >
                      Logout ({user?.name || 'Admin'})
                    </button>
                  </div>
                </nav>
              </div>

              <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                <p className="text-xs text-zinc-500 text-center">ORNAQ Admin System v2.0</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
