import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { formatCurrency, getProductImage } from "../utils/catalog";

const RECENT_SEARCH_KEY = "ornac_recent_searches";

const readRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveRecentSearch = (value) => {
  if (!value) return;
  const next = [value, ...readRecentSearches().filter((item) => item !== value)].slice(0, 6);
  localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
};

export default function SearchBar({ mobile = false, onNavigate = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => readRecentSearches());
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const deferredQuery = useDeferredValue(query);
  const debouncedQuery = useDebouncedValue(deferredQuery, 250);

  useEffect(() => {
    const pageQuery = new URLSearchParams(location.search).get("searchQuery") || "";
    if (location.pathname === "/shop") {
      setQuery(pageQuery);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsFocused(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    let isActive = true;
    setLoading(true);

    api
      .get("/products/suggestions", { params: { q: debouncedQuery.trim() } })
      .then((response) => {
        if (isActive) {
          setResults(response.data || []);
        }
      })
      .catch(() => {
        if (isActive) {
          setResults([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [debouncedQuery]);

  const showRecentSearches = isFocused && debouncedQuery.trim().length < 2 && recentSearches.length > 0;
  const showResults = isFocused && debouncedQuery.trim().length >= 2;
  const panelOpen = useMemo(
    () => showRecentSearches || showResults,
    [showRecentSearches, showResults]
  );

  const submitSearch = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      saveRecentSearch(trimmed);
      setRecentSearches(readRecentSearches());
    }
    navigate(trimmed ? `/shop?searchQuery=${encodeURIComponent(trimmed)}` : "/shop");
    setIsFocused(false);
    onNavigate();
  };

  return (
    <div ref={containerRef} className={`relative ${mobile ? "w-full" : "w-full max-w-md"}`}>
      <form onSubmit={submitSearch} className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone-400">Search</span>
        <input
          type="search"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search silk, paithani, cotton..."
          className={`w-full rounded-full border border-stone-200 bg-white/90 py-3 pl-20 pr-12 text-sm text-stone-800 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100 ${
            mobile ? "shadow-sm" : "shadow-sm shadow-stone-200/60"
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-stone-400 hover:text-stone-700"
          >
            Clear
          </button>
        )}
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-brand-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-800">
          Go
        </button>
      </form>

      {panelOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl shadow-stone-300/20">
          <div className="border-b border-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-stone-400">
            {showRecentSearches ? "Recent searches" : loading ? "Searching collection..." : "Matching sarees"}
          </div>

          {showRecentSearches && (
            <div className="p-3">
              {recentSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    navigate(`/shop?searchQuery=${encodeURIComponent(item)}`);
                    setIsFocused(false);
                    onNavigate();
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-stone-700 transition hover:bg-brand-50"
                >
                  <span>{item}</span>
                  <span className="text-xs text-stone-400">Recent</span>
                </button>
              ))}
            </div>
          )}

          {showResults && (
            <>
              {!loading && (
                <div className="max-h-[28rem] overflow-y-auto">
                  {results.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product.slug}`}
                      onClick={() => {
                        saveRecentSearch(query.trim());
                        setRecentSearches(readRecentSearches());
                        setIsFocused(false);
                        onNavigate();
                      }}
                      className="flex items-center gap-4 px-5 py-4 transition hover:bg-brand-50"
                    >
                      <img src={getProductImage(product)} alt={product.name} className="h-16 w-14 rounded-2xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-stone-900">{product.name}</p>
                        <p className="truncate text-xs text-stone-500">{product.category} • {product.fabric}</p>
                      </div>
                      <span className="text-sm font-bold text-brand-800">{formatCurrency(product.discountPrice || product.price)}</span>
                    </Link>
                  ))}
                </div>
              )}
              {!loading && results.length === 0 && <div className="px-5 py-8 text-center text-sm text-stone-500">No products matched that search.</div>}
              <button
                type="button"
                onClick={() => {
                  saveRecentSearch(query.trim());
                  setRecentSearches(readRecentSearches());
                  navigate(`/shop?searchQuery=${encodeURIComponent(query.trim())}`);
                  setIsFocused(false);
                  onNavigate();
                }}
                className="w-full border-t border-stone-100 px-5 py-4 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                View all results
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
