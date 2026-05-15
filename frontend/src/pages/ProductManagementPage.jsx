import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useRealtime } from "../hooks/useRealtime";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import ProductEditor from "../components/admin/ProductEditor";
import { cleanFilters, formatCurrency, getProductImage, mergeCategories } from "../utils/catalog";

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [metadata, setMetadata] = useState({ categories: [], fabrics: [] });
  const [filters, setFilters] = useState({
    searchQuery: "",
    category: "",
    fabric: "",
    minPrice: "",
    maxPrice: ""
  });
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  const deferredSearch = useDeferredValue(filters.searchQuery);
  const debouncedSearch = useDebouncedValue(deferredSearch, 250);
  const categories = useMemo(() => mergeCategories(metadata.categories), [metadata.categories]);

  const fetchData = async () => {
    try {
      const response = await api.get("/products", {
        params: cleanFilters({
          ...filters,
          searchQuery: debouncedSearch
        })
      });
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/products/filters/meta").then((response) => setMetadata(response.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, filters.category, filters.fabric, filters.minPrice, filters.maxPrice]);

  useRealtime({
    onStockUpdate: () => fetchData(),
    onOrderUpdate: () => fetchData()
  });

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch {
      window.alert("Error deleting product");
    }
  };

  const updateStock = async (id, delta) => {
    try {
      await api.patch(`/products/${id}/stock/adjust`, { delta });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-16">
        <div className="flex flex-col justify-between gap-8 border-b border-stone-100 pb-12 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Inventory</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-5xl">Catalog Sovereignty</h1>
            <p className="mt-4 max-w-2xl text-sm font-medium text-stone-500 sm:text-base">
              Orchestrate your luxury collection. Search inventory, refine metadata, and maintain real-time stock integrity across your premium handloom catalog.
            </p>
          </div>
          <Link to="/admin/products/add" className="btn-primary px-8 lg:mb-2">
            <span className="text-xl leading-none">+</span> New Product
          </Link>
        </div>

        <div className="mt-12 grid gap-4 rounded-[2.5rem] border border-stone-50 bg-white p-6 shadow-2xl shadow-stone-100 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <input
              type="search"
              placeholder="Search by name, fabric, or keyword..."
              className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all"
              value={filters.searchQuery}
              onChange={(event) => setFilters((current) => ({ ...current, searchQuery: event.target.value }))}
            />
          </div>
          <select
            className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-black uppercase tracking-widest text-stone-600 border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all appearance-none"
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-black uppercase tracking-widest text-stone-600 border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all appearance-none"
            value={filters.fabric}
            onChange={(event) => setFilters((current) => ({ ...current, fabric: event.target.value }))}
          >
            <option value="">All Fabrics</option>
            {metadata.fabrics.map((fabric) => (
              <option key={fabric} value={fabric}>{fabric}</option>
            ))}
          </select>
        </div>

        <div className="mt-12 hidden overflow-hidden rounded-[3rem] border border-stone-50 bg-white shadow-2xl shadow-stone-100 lg:block">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left">
              <thead className="bg-stone-50/50 border-b border-stone-50">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Artifact Details</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Classification</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Valuation</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">Live Pulse</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {products.map((product) => (
                  <tr key={product._id} className="group transition-colors hover:bg-stone-50/30">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-16 w-14 shrink-0 overflow-hidden rounded-2xl bg-stone-50">
                          <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-stone-900 uppercase tracking-wide">{product.name}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-300">{product.fabric} • {product.color}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-800">{product.category}</span>
                    </td>
                    <td className="px-8 py-6 font-black text-stone-900">{formatCurrency(product.price)}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-xl shadow-stone-100/50">
                          <button type="button" onClick={() => updateStock(product._id, -1)} className="px-4 py-2 font-black text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-900">
                            −
                          </button>
                          <span className={`min-w-[48px] text-center text-sm font-black ${product.stock < 5 ? "text-red-500 bg-red-50/50" : "text-stone-900"}`}>
                            {product.stock}
                          </span>
                          <button type="button" onClick={() => updateStock(product._id, 1)} className="px-4 py-2 font-black text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-900">
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(product)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-100 text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all"
                          title="Edit Blueprint"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(product._id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-50 text-red-200 hover:bg-red-50 hover:text-red-600 transition-all"
                          title="Erase Artifact"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && !loading && (
              <div className="py-24 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-xl">🔍</div>
                <p className="text-sm font-black text-stone-400 uppercase tracking-widest">No matching artifacts discovered</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:hidden">
          {products.map((product) => (
            <article key={product._id} className="rounded-[2.5rem] border border-stone-50 bg-white p-6 shadow-2xl shadow-stone-100 transition-all active:scale-[0.98]">
              <div className="flex gap-6">
                <div className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-stone-50">
                  <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-700">{product.category}</p>
                  <p className="mt-1 font-black text-stone-900 leading-tight">{product.name}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-300">{product.fabric} • {product.color}</p>
                  <p className="mt-3 text-lg font-black text-stone-900">{formatCurrency(product.price)}</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="flex items-center overflow-hidden rounded-2xl border border-stone-100 bg-stone-50/50">
                  <button type="button" onClick={() => updateStock(product._id, -1)} className="px-4 py-2 font-black text-stone-400">−</button>
                  <span className={`min-w-[40px] text-center text-sm font-black ${product.stock < 5 ? "text-red-500" : "text-stone-900"}`}>{product.stock}</span>
                  <button type="button" onClick={() => updateStock(product._id, 1)} className="px-4 py-2 font-black text-stone-400">+</button>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setEditingProduct(product)} className="btn-secondary py-2.5 px-6">
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteProduct(product._id)} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {editingProduct && (
          <ProductEditor
            product={editingProduct}
            categories={categories}
            onClose={() => setEditingProduct(null)}
            onSaved={fetchData}
          />
        )}
      </div>
    </div>
  );
}
