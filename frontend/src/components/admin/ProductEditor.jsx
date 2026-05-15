import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { getProductColors, getProductImage, mergeCategories } from "../../utils/catalog";

const emptyForm = {
  name: "",
  description: "",
  category: "Silk",
  fabric: "",
  color: "",
  colorsInput: "",
  price: "",
  discountPercent: "",
  stock: "",
  deliveryEstimateMinDays: 3,
  deliveryEstimateMaxDays: 5,
  featured: false,
  isNewArrival: false
};

export default function ProductEditor({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const categoryList = useMemo(() => mergeCategories(categories), [categories]);

  useEffect(() => {
    if (!product) {
      setForm(emptyForm);
      setFiles([]);
      return;
    }

    const productColors = getProductColors(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "Silk",
      fabric: product.fabric || "",
      color: product.color || productColors[0] || "",
      colorsInput: productColors.join(", "),
      price: product.price || "",
      discountPercent: product.discountPercent || 0,
      stock: product.stock || 0,
      deliveryEstimateMinDays: product.deliveryEstimate?.minDays || 3,
      deliveryEstimateMaxDays: product.deliveryEstimate?.maxDays || 5,
      featured: Boolean(product.featured),
      isNewArrival: Boolean(product.isNewArrival)
    });
    setFiles([]);
  }, [product]);

  if (!product) return null;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      let images = product.images || [];

      if (files.length) {
        const data = new FormData();
        files.forEach((file) => data.append("images", file));
        const uploadResponse = await api.post("/uploads/products", data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        images = uploadResponse.data;
      }

      const colors = form.colorsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await api.patch(`/products/${product._id}`, {
        ...form,
        color: form.color || colors[0] || "",
        colors,
        price: Number(form.price),
        discountPercent: Number(form.discountPercent || 0),
        stock: Number(form.stock),
        images
      });

      onSaved();
      onClose();
    } catch (error) {
      window.alert(error.response?.data?.message || "Unable to update the product right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/50 px-4 py-10 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-stone-950/20">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-400">Edit saree</p>
            <h2 className="mt-1 text-2xl font-semibold text-stone-900">{product.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-600 hover:border-stone-300 hover:text-stone-900">
            Close
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Name</label>
              <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Description</label>
              <textarea required rows={5} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Category</label>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100">
                  {categoryList.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Fabric</label>
                <input required value={form.fabric} onChange={(event) => setForm((current) => ({ ...current, fabric: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Primary color</label>
                <input required value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">All color variants</label>
                <input value={form.colorsInput} onChange={(event) => setForm((current) => ({ ...current, colorsInput: event.target.value }))} placeholder="Wine, Rose Gold, Pearl Beige" className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
              <img src={files.length ? URL.createObjectURL(files[0]) : getProductImage(product)} alt={product.name} className="h-64 w-full rounded-[1.25rem] object-cover" />
              <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} className="mt-4 block w-full text-sm text-stone-500" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Price</label>
                <input required min="0" type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Discount %</label>
                <input min="0" max="90" type="number" value={form.discountPercent} onChange={(event) => setForm((current) => ({ ...current, discountPercent: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Stock</label>
                <input required min="0" type="number" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">New arrival</label>
                <label className="mt-2 flex h-[52px] items-center gap-3 rounded-2xl border border-stone-200 px-4">
                  <input type="checkbox" checked={form.isNewArrival} onChange={(event) => setForm((current) => ({ ...current, isNewArrival: event.target.checked }))} className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-300" />
                  <span className="text-sm text-stone-700">Highlight on homepage</span>
                </label>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Featured</label>
                <label className="mt-2 flex h-[52px] items-center gap-3 rounded-2xl border border-stone-200 px-4">
                  <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-300" />
                  <span className="text-sm text-stone-700">Use in curated sections</span>
                </label>
              </div>
            </div>

            <button disabled={submitting} className="w-full rounded-2xl bg-brand-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-800 disabled:opacity-50">
              {submitting ? "Saving changes..." : "Save product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
