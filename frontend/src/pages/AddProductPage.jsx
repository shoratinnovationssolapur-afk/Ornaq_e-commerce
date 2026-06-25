import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { categoryOptions, isJewelleryCategory, mergeCategories } from "../utils/catalog";

export default function AddProductPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [metadata, setMetadata] = useState({ categories: categoryOptions, fabrics: [] });
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    sareeCode: "",
    description: "",
    classifications: "",
    youtubeLink: "",
    category: "", 
    fabric: "",
    color: "",
    colorsInput: "",
    marketPrice: "",
    offerPrice: "",
    stock: "",
    deliveryEstimateMinDays: 3,
    deliveryEstimateMaxDays: 5,
    featured: false,
    isNewArrival: true,
    categoryCoverImage: null // Holds the file object for the category cover image
  });
  const [categoryImagePreview, setCategoryImagePreview] = useState(""); // URL for layout preview
  const [files, setFiles] = useState([]);
  const [modelFiles, setModelFiles] = useState([]);
  const [variantFiles, setVariantFiles] = useState({});
  const [previews, setPreviews] = useState([]);
  const [modelPreviews, setModelPreviews] = useState([]);
  
  const categories = useMemo(() => mergeCategories(metadata.categories), [metadata.categories]);
  const formIsJewellery = isJewelleryCategory(form.category);
  const variantColors = useMemo(
    () =>
      Array.from(
        new Set(
          [form.color, ...form.colorsInput.split(",")]
            .map((item) => item.trim())
            .filter(Boolean)
        )
      ),
    [form.color, form.colorsInput]
  );

  useEffect(() => {
    api.get("/products/filters/meta").then((response) => setMetadata(response.data)).catch(() => { });
  }, []);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
    setPreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleCategoryCoverChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm((current) => ({ ...current, categoryCoverImage: file }));
      setCategoryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVariantFileChange = (color, event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setVariantFiles((current) => ({ ...current, [color]: selectedFiles }));
  };

  const handleModelFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setModelFiles(selectedFiles);
    setModelPreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const uploadProductImages = async (imageFiles) => {
    if (!imageFiles.length) return [];

    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("images", file));
    const uploadResponse = await api.post("/uploads/products", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return uploadResponse.data;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const images = await uploadProductImages(files);
      const modelImages = await uploadProductImages(modelFiles);
      
      // Upload Category cover image if it exists
      let uploadedCategoryCover = "";
      if (form.categoryCoverImage) {
        const coverResult = await uploadProductImages([form.categoryCoverImage]);
        uploadedCategoryCover = coverResult[0] || "";
      }

      const colors = form.colorsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const allColors = Array.from(new Set([form.color || colors[0] || "", ...colors].filter(Boolean)));
      const variants = await Promise.all(
        allColors.map(async (color, index) => {
          const variantImages = await uploadProductImages(variantFiles[color] || []);
          return {
            color,
            stock: Math.max(0, Math.ceil(Number(form.stock || 0) / Math.max(1, allColors.length))),
            sku: `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "product"}-${index + 1}`,
            images: variantImages.length ? variantImages : images
          };
        })
      );

      await api.post("/products", {
        ...form,
        color: form.color || colors[0] || "",
        colors,
        price: Number(form.marketPrice),
        marketPrice: Number(form.marketPrice),
        offerPrice: Number(form.offerPrice || form.marketPrice),
        stock: Number(form.stock),
        images,
        modelImages,
        variants,
        categoryCover: uploadedCategoryCover // Pass along the parsed image source string
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
              Add a new saree or imitation jewellery piece to the catalog, define its details, and curate its storefront presence.
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Saree Code</label>
                    <input required className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Enter saree code..." value={form.sareeCode} onChange={(event) => setForm((current) => ({ ...current, sareeCode: event.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Youtube Link</label>
                    <input required className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Enter Youtube link..." value={form.youtubeLink} onChange={(event) => setForm((current) => ({ ...current, youtubeLink: event.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Narrative Description</label>
                    <textarea required rows={6} className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-medium leading-relaxed border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder={formIsJewellery ? "Describe the finish, styling notes, and occasions to wear it..." : "Describe the drape, weave history, and occasion..."} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-8 rounded-[3rem] border border-stone-50 bg-white p-8 shadow-2xl shadow-stone-100 sm:p-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700 mb-6">Material Attributes</p>
                <div className="space-y-6">
                  
                  {/* Row Containing Classification standalone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Classification</label>
                    <input required type="text" placeholder="Premium Saree" value={form.classification} onChange={(event) => setForm((current) => ({ ...current, classification: event.target.value }))} className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" />
                  </div>
                  
                  {/* Splitting Category and its corresponding Cover Image into a side-by-side flexbox wrapper */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Category</label>
                      <input required type="text" placeholder="e.g. Silk, Linen, Jewellery" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" />
                    </div>
                    
                    {/* Category Cover Image Box Slot */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Category Cover</label>
                      <div className="relative h-14 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden hover:border-brand-400 transition-colors cursor-pointer group">
                        <input type="file" accept="image/*" onChange={handleCategoryCoverChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {categoryImagePreview ? (
                          <img src={categoryImagePreview} alt="Category preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <span className="text-sm text-stone-400 font-bold">+</span>
                            <span className="block text-[8px] font-black text-stone-400 uppercase tracking-tighter">Cover</span>
                          </div>
                        )}
                        {categoryImagePreview && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Change</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">{formIsJewellery ? "Material" : "Fabric"}</label>
                      <input required className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder={formIsJewellery ? "Alloy" : "Silk"} value={form.fabric} onChange={(event) => setForm((current) => ({ ...current, fabric: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Primary Color</label>
                      <input required className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Ruby Red" value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Variant Palette</label>
                      <input className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="Red, Gold" value={form.colorsInput} onChange={(event) => setForm((current) => ({ ...current, colorsInput: event.target.value }))} />
                    </div>
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Market Price</label>
                    <input required type="number" className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-black border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="0.00" value={form.marketPrice} onChange={(event) => setForm((current) => ({ ...current, marketPrice: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Offer Price</label>
                    <input required type="number" className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-black border-transparent focus:bg-white focus:border-brand-300 focus:ring-0 transition-all" placeholder="0.00" value={form.offerPrice} onChange={(event) => setForm((current) => ({ ...current, offerPrice: event.target.value }))} />
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
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Master Product Images</label>
                    <div className="grid grid-cols-4 gap-3">
                      {previews.map((src, index) => (
                        <div key={index} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-50 border border-stone-100 shadow-sm group">
                          <img src={src} alt="Preview" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Slot {index + 1}</span>
                          </div>
                        </div>
                      ))}
                      
                      <div className="relative aspect-[3/4] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-brand-400 transition-all cursor-pointer">
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <span className="text-xl text-stone-400 font-light">+</span>
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider mt-1">Upload</span>
                      </div>
                    </div>
                  </div>

                  {variantColors.length > 0 && (
                    <div className="space-y-4 border-t border-stone-100 pt-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Color Variant Slots</p>
                      {variantColors.map((color) => (
                        <div key={color} className="rounded-2xl border border-stone-100 bg-stone-50/40 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: color.toLowerCase() }} />
                            <span className="text-xs font-black uppercase tracking-wider text-stone-700">{color} Palette</span>
                          </div>
                          
                          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-stone-100 shadow-sm relative hover:border-brand-300 transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-stone-50 flex items-center justify-center border border-stone-100 text-lg">🎨</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-stone-800 uppercase tracking-wide truncate">
                                {variantFiles[color]?.length > 0 ? `${variantFiles[color].length} Assets Attached` : "No Media Hooked"}
                              </p>
                              <p className="text-[9px] font-medium text-stone-400 mt-0.5">Click container to drop variant visuals</p>
                            </div>
                            <input type="file" multiple accept="image/*" onChange={(event) => handleVariantFileChange(color, event)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4 border-t border-stone-100 pt-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">360 Frame Model View Array</label>
                    <div className="rounded-3xl border border-stone-100 bg-stone-50/30 p-5">
                      <p className="text-[10px] font-medium leading-relaxed text-stone-400 mb-4">
                        Curate sequenced frame snapshots (Front → Right Profile → Back → Left Profile).
                      </p>
                      
                      <div className="grid grid-cols-4 gap-3">
                        {modelPreviews.map((src, index) => (
                          <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-white border border-stone-100 shadow-inner">
                            <img src={src} alt={`360 frame view ${index + 1}`} className="h-full w-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase">{index + 1}F</span>
                          </div>
                        ))}
                        
                        <div className="relative aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-200 bg-white hover:border-brand-400 transition-colors cursor-pointer">
                          <input type="file" multiple accept="image/*" onChange={handleModelFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <span className="text-lg text-stone-400 font-light">+</span>
                          <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-0.5">Frames</span>
                        </div>
                      </div>
                    </div>
                  </div>

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