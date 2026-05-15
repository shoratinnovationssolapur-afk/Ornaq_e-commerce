import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { categoryOptions, mergeCategories } from "../utils/catalog";

export default function AddProductPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [metadata, setMetadata] = useState({ categories: categoryOptions, fabrics: [] });
  const [error, setError] = useState("");
  const [form, setForm] = useState({
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
    isNewArrival: true
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const categories = useMemo(() => mergeCategories(metadata.categories), [metadata.categories]);

  useEffect(() => {
    api.get("/products/filters/meta").then((response) => setMetadata(response.data)).catch(() => {});
  }, []);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
    setPreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      let images = [];
      if (files.length) {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));
        const uploadResponse = await api.post("/uploads/products", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        images = uploadResponse.data;
      }

      const colors = form.colorsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await api.post("/products", {
        ...form,
        color: form.color || colors[0] || "",
        colors,
        price: Number(form.price),
        discountPercent: Number(form.discountPercent || 0),
        stock: Number(form.stock),
        images
      });

      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-6 border-b border-stone-100 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Publishing</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-5xl">New Creation</h1>
            <p className="mt-4 max-w-xl text-sm font-medium text-stone-500 sm:text-base">
              Introduce a new artifact to your luxury catalog. Define its essence, set its valuation, and curate its digital presence.
            </p>
          </div>
          <button type="button" onClick={() => navigate(-1)} className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">
            Discard and exit
          </button>
        </div>

        {error && (
          <div className="mt-8 rounded-[2rem] bg-red-50 p-6 text-sm font-bold text-red-700 border border-red-100 animate-fade-in">
            <span className="mr-2 italic">Signal Interrupt:</span> {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-12 grid gap-12 lg:grid-cols-2">
          <div className="space-y-10">
            <section className="space-y-8 rounded-[3rem] border border-stone-50 bg-white p-8 shadow-2xl shadow-stone-100 sm:p-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700 mb-6">Core Essence</p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Artifact Name</label>
                    <input required className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Enter product name..." value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Narrative Description</label>
                    <textarea required rows={6} className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-medium leading-relaxed border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Describe the drape, weave history, and occasion..." value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-8 rounded-[3rem] border border-stone-50 bg-white p-8 shadow-2xl shadow-stone-100 sm:p-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700 mb-6">Material Attributes</p>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Classification</label>
                    <select className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-black uppercase tracking-widest text-stone-600 border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all appearance-none" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Fabric</label>
                    <input required className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Silk, Cotton, etc." value={form.fabric} onChange={(event) => setForm((current) => ({ ...current, fabric: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Primary Color</label>
                    <input required className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Ruby Red" value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Variant Palette</label>
                    <input className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Red, Gold, Ivory" value={form.colorsInput} onChange={(event) => setForm((current) => ({ ...current, colorsInput: event.target.value }))} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-10">
            <section className="space-y-8 rounded-[3rem] border border-stone-50 bg-white p-8 shadow-2xl shadow-stone-100 sm:p-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700 mb-6">Valuation & Visibility</p>
                <div className="grid gap-6 grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Price</label>
                    <input required type="number" className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-black border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="0.00" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Discount %</label>
                    <input type="number" className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-black border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="0" value={form.discountPercent} onChange={(event) => setForm((current) => ({ ...current, discountPercent: event.target.value }))} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Live Inventory Stock</label>
                    <input required type="number" className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-black border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="0" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} />
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl bg-stone-50 px-6 py-4 cursor-pointer hover:bg-stone-100 transition-colors">
                    <input type="checkbox" className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500" checked={form.isNewArrival} onChange={(event) => setForm((current) => ({ ...current, isNewArrival: event.target.checked }))} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl bg-stone-50 px-6 py-4 cursor-pointer hover:bg-stone-100 transition-colors">
                    <input type="checkbox" className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Featured</span>
                  </label>
                </div>
              </div>
            </section>

            <section className="space-y-8 rounded-[3rem] border border-stone-50 bg-white p-8 shadow-2xl shadow-stone-100 sm:p-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700 mb-6">Visual Artifacts</p>
                <div className="space-y-6">
                  <div className="relative group">
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-stone-100 bg-stone-50 py-10 transition-all group-hover:bg-stone-100 group-hover:border-stone-200">
                      <div className="mb-3 text-2xl">📸</div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Capture visual assets</p>
                      <p className="mt-1 text-[8px] font-bold text-stone-300">Multiple files supported</p>
                    </div>
                  </div>
                  {previews.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {previews.map((src, index) => (
                        <div key={index} className="aspect-[3/4] overflow-hidden rounded-xl bg-stone-50">
                          <img src={src} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <button disabled={submitting} className="btn-primary w-full py-6 text-xs lg:text-sm">
              {submitting ? (
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Committing Artifact...</span>
                </div>
              ) : "Publish to Catalog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
