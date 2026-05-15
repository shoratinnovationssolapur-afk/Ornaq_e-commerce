import { useDeferredValue, useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import ShopFilters from "../components/ShopFilters";
import api from "../services/api";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { cleanFilters, defaultShopFilters, mergeCategories } from "../utils/catalog";

const readFilters = (searchParams) => ({
  searchQuery: searchParams.get("searchQuery") || "",
  category: searchParams.get("category") || "",
  fabric: searchParams.get("fabric") || "",
  color: searchParams.get("color") || "",
  minPrice: searchParams.get("minPrice") || "",
  maxPrice: searchParams.get("maxPrice") || "",
  sort: searchParams.get("sort") || "newest",
  isNewArrival: searchParams.get("isNewArrival") || ""
});

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [metadata, setMetadata] = useState({ categories: [], fabrics: [], colors: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Local filter state for immediate UI feedback (e.g. search input)
  const [localFilters, setLocalFilters] = useState(() => readFilters(searchParams));

  const debouncedSearch = useDebouncedValue(localFilters.searchQuery, 400);
  const categories = useMemo(() => mergeCategories(metadata.categories), [metadata.categories]);

  const toggleFilters = () => setIsFilterOpen(!isFilterOpen);
  const closeFilters = () => setIsFilterOpen(false);

  // Synchronize local search with debounced URL update
  useEffect(() => {
    const currentParams = readFilters(searchParams);
    if (debouncedSearch !== currentParams.searchQuery) {
      const next = cleanFilters({ ...currentParams, searchQuery: debouncedSearch });
      setSearchParams(next, { replace: true });
    }
  }, [debouncedSearch, setSearchParams, searchParams]);

  // Handle filter changes (non-search) by updating URL immediately
  const handleFilterChange = useCallback((key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    
    // For non-search inputs, update URL immediately
    if (key !== "searchQuery") {
      const currentParams = readFilters(searchParams);
      const next = cleanFilters({ ...currentParams, [key]: value });
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Sync local filters when URL changes externally (e.g. browser back button)
  useEffect(() => {
    setLocalFilters(readFilters(searchParams));
  }, [searchParams]);

  // Fetch metadata once
  useEffect(() => {
    api.get("/products/filters/meta")
      .then((response) => setMetadata(response.data))
      .catch(() => {});
  }, []);

  // Primary data fetching effect - triggered ONLY by URL changes
  useEffect(() => {
    const activeFilters = readFilters(searchParams);
    
    setLoading(true);
    setError(null);
    
    api.get("/products", { params: cleanFilters(activeFilters) })
      .then((response) => {
        setProducts(response.data);
      })
      .catch((err) => {
        console.error("Shop API Error:", err);
        setError("The collection is temporarily unavailable. Our artisans are working to restore access.");
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const resetFilters = () => {
    setLocalFilters(defaultShopFilters);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      {/* Header Section */}
      <div className="relative border-b border-stone-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-brand-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Catalog</p>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-stone-900 sm:text-5xl">Curated Treasures</h1>
              <p className="mt-4 text-sm font-medium text-stone-500 sm:text-base">
                Discover the finest handloom sarees, from timeless Silk to exquisite Paithani.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleFilters}
                className="flex items-center gap-2 rounded-2xl bg-stone-900 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-stone-800 active:scale-95 xl:hidden"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filter Inventory
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="grid gap-12 xl:grid-cols-[300px_1fr]">
          
          {/* Desktop Sidebar */}
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <ShopFilters
                filters={localFilters}
                metadata={{ ...metadata, categories }}
                onChange={handleFilterChange}
                onReset={resetFilters}
              />
            </div>
          </aside>

          {/* Product Grid */}
          <section className="min-h-[60vh]">
            <div className="mb-10 flex flex-col justify-between gap-4 border-b border-stone-100 pb-8 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Showing Results</p>
                <p className="mt-1 text-sm font-bold text-stone-900">
                  {loading ? "Orchestrating collection..." : `${products.length} Masterpieces Found`}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {Object.entries(cleanFilters(readFilters(searchParams))).map(([key, value]) => {
                  if (key === "sort") return null;
                  return (
                    <button 
                      key={key}
                      onClick={() => handleFilterChange(key, "")}
                      className="flex items-center gap-2 rounded-full bg-stone-50 border border-stone-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-600 transition-colors hover:bg-stone-100"
                    >
                      {key === "searchQuery" ? `"${value}"` : value === "true" ? "New Arrival" : value}
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            {error ? (
              <div className="flex flex-col items-center justify-center rounded-[3rem] border border-stone-100 bg-white p-16 text-center shadow-xl">
                <div className="mb-6 rounded-full bg-red-50 p-6">
                  <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">Access Interrupted</h3>
                <p className="mt-4 max-w-md text-sm font-medium text-stone-500">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary mt-8 px-10">
                  Re-attempt Connection
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-[2.5rem] bg-stone-50 border border-stone-100" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-stone-200 bg-white p-20 text-center">
                <p className="text-3xl">🔍</p>
                <h3 className="mt-6 text-xl font-black text-stone-900 uppercase tracking-tight">No Match Found</h3>
                <p className="mt-4 max-w-xs text-sm font-medium text-stone-500">The specific combination of attributes did not yield any results in our current inventory.</p>
                <button onClick={resetFilters} className="btn-secondary mt-8">
                  Reset Global Filters
                </button>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {products.map((product) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[200] xl:hidden">
            <motion.div 
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFilters}
            />
            <motion.div 
              className="mobile-drawer left-0 right-auto"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between border-b border-stone-100 p-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">Artisan</p>
                  <h2 className="text-xl font-black text-stone-900">Filters</h2>
                </div>
                <button onClick={closeFilters} className="rounded-full bg-stone-50 p-2 text-stone-400 transition-colors hover:bg-stone-100">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <ShopFilters
                  filters={localFilters}
                  metadata={{ ...metadata, categories }}
                  onChange={handleFilterChange}
                  onReset={resetFilters}
                />
              </div>
              <div className="border-t border-stone-100 bg-stone-50/50 p-6">
                <button onClick={closeFilters} className="btn-primary w-full py-5">
                  View {products.length} Masterpieces
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
