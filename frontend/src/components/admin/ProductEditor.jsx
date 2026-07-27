import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { getProductColors, getProductImage, getProductSizes, isJewelleryCategory, mergeCategories } from "../../utils/catalog";

const sizeOptions = ["S", "M", "L", "XL", "1X", "2X", "3X", "4X"];

const emptyForm = {
  name: "",
  description: "",
  classification: "",
  category: "Silk",
  fabric: "",
  color: "",
  colorsInput: "",
  sizesInput: "",
  marketPrice: "",
  offerPrice: "",
  stock: "",
  sareeCode: "",
  youtubeLink: "",
  deliveryEstimateMinDays: 3,
  deliveryEstimateMaxDays: 5,
  featured: false,
  isNewArrival: false
};

export default function ProductEditor({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [modelFiles, setModelFiles] = useState([]);
  const [variantFiles, setVariantFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const categoryList = useMemo(() => mergeCategories(categories), [categories]);
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
  const selectedSizes = useMemo(
    () =>
      form.sizesInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.sizesInput]
  );

  useEffect(() => {
    if (!product) {
      setForm(emptyForm);
      setFiles([]);
      setModelFiles([]);
      setVariantFiles({});
      return;
    }

    const productColors = getProductColors(product);
    const productSizes = getProductSizes(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      classification: product.classification || "",
      category: product.category || "Silk",
      fabric: product.fabric || "",
      color: product.color || productColors[0] || "",
      colorsInput: productColors.join(", "),
      sizesInput: productSizes.join(", "),
      marketPrice: product.marketPrice || product.price || "",
      offerPrice: product.offerPrice || product.discountPrice || product.price || "",
      stock: product.stock || 0,
      sareeCode: product.sareeCode || "",
      youtubeLink: product.youtubeLink || "",
      deliveryEstimateMinDays: product.deliveryEstimate?.minDays || 3,
      deliveryEstimateMaxDays: product.deliveryEstimate?.maxDays || 5,
      featured: Boolean(product.featured),
      isNewArrival: Boolean(product.isNewArrival)
    });
    setFiles([]);
    setModelFiles([]);
    setVariantFiles({});
  }, [product]);

  if (!product) return null;

  const uploadProductImages = async (imageFiles) => {
    if (!imageFiles.length) return [];

    const data = new FormData();
    imageFiles.forEach((file) => data.append("images", file));
    const uploadResponse = await api.post("/uploads/products", data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return uploadResponse.data;
  };

  const getExistingVariant = (color) =>
    product.variants?.find((variant) => String(variant.color).toLowerCase() === String(color).toLowerCase());

  const toggleSize = (size) => {
    setForm((current) => {
      const currentSizes = current.sizesInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const nextSizes = currentSizes.includes(size)
        ? currentSizes.filter((item) => item !== size)
        : [...currentSizes, size].filter(Boolean);

      return { ...current, sizesInput: nextSizes.join(", ") };
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      let images = product.images || [];
      let modelImages = product.modelImages || [];

      if (files.length) {
        images = await uploadProductImages(files);
      }
      if (modelFiles.length) {
        modelImages = await uploadProductImages(modelFiles);
      }

      const colors = form.colorsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const sizes = form.sizesInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const allColors = Array.from(new Set([form.color || colors[0] || "", ...colors].filter(Boolean)));
      const variants = await Promise.all(
        allColors.map(async (color, index) => {
          const existingVariant = getExistingVariant(color);
          const uploadedVariantImages = await uploadProductImages(variantFiles[color] || []);
          return {
            color,
            hexCode: existingVariant?.hexCode || "",
            stock: Number(existingVariant?.stock ?? Math.max(0, Math.ceil(Number(form.stock || 0) / Math.max(1, allColors.length)))),
            sku: existingVariant?.sku || `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "product"}-${index + 1}`,
            images: uploadedVariantImages.length ? uploadedVariantImages : existingVariant?.images?.length ? existingVariant.images : images
          };
        })
      );

      await api.patch(`/products/${product._id}`, {
        ...form,
        classification: form.classification,
        color: form.color || colors[0] || "",
        colors,
        sizes,
        price: Number(form.marketPrice),
        marketPrice: Number(form.marketPrice),
        offerPrice: Number(form.offerPrice || form.marketPrice),
        stock: Number(form.stock),
        images,
        modelImages,
        variants
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
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl shadow-stone-950/20">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-400">Edit product</p>
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
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                  Classification
                </label>

                <input
                  required
                  value={form.classification}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      classification: event.target.value,
                    }))
                  }
                  placeholder="Premium Saree"
                  className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                />
              </div>
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
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">{formIsJewellery ? "Material" : "Fabric"}</label>
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
              <div>
                <p className="text-sm font-bold text-stone-500">Not sure about your perfect fit?</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {sizeOptions.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        aria-pressed={isSelected}
                        className={`relative flex h-12 w-12 items-center justify-center rounded-lg border text-base font-semibold transition-colors ${
                          isSelected
                            ? "border-[#6f0008] bg-[#6f0008] text-white shadow-sm"
                            : "border-stone-200 bg-stone-50 text-stone-400 hover:border-[#8a6b5d] hover:bg-white hover:text-stone-900"
                        }`}
                      >
                        {!isSelected && <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-14 -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] bg-stone-300" />}
                        <span className="relative z-10">{size}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
              <img src={files.length ? URL.createObjectURL(files[0]) : getProductImage(product)} alt={product.name} className="h-64 w-full rounded-[1.25rem] object-cover" />
              <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} className="mt-4 block w-full text-sm text-stone-500" />
            </div>

            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">360 model images</p>
              <p className="mt-2 text-xs text-stone-500">{product.modelImages?.length || 0} saved frame{product.modelImages?.length === 1 ? "" : "s"}</p>
              <input type="file" accept="image/*" multiple onChange={(event) => setModelFiles(Array.from(event.target.files || []))} className="mt-3 block w-full text-xs text-stone-500" />
              {modelFiles.length > 0 && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-brand-700">{modelFiles.length} new frame{modelFiles.length === 1 ? "" : "s"} selected</p>
              )}
            </div>

            {variantColors.length > 0 && (
              <div className="space-y-3 rounded-[1.5rem] border border-stone-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Color-specific images</p>
                {variantColors.map((color) => {
                  const existingVariant = getExistingVariant(color);
                  return (
                    <div key={color} className="rounded-2xl border border-stone-100 bg-stone-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color.toLowerCase() }} />
                          <span className="text-sm font-bold text-stone-700">{color}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{existingVariant?.images?.length || 0} saved</span>
                      </div>
                      <input type="file" accept="image/*" multiple onChange={(event) => setVariantFiles((current) => ({ ...current, [color]: Array.from(event.target.files || []) }))} className="mt-3 block w-full text-xs text-stone-500" />
                      {variantFiles[color]?.length > 0 && (
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-brand-700">{variantFiles[color].length} new image{variantFiles[color].length === 1 ? "" : "s"} selected</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Saree code</label>
                <input required value={form.sareeCode} onChange={(event) => setForm((current) => ({ ...current, sareeCode: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">YouTube link</label>
                <input type="url" value={form.youtubeLink} onChange={(event) => setForm((current) => ({ ...current, youtubeLink: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Market price</label>
                <input required min="0" type="number" value={form.marketPrice} onChange={(event) => setForm((current) => ({ ...current, marketPrice: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Offer price</label>
                <input required min="0" type="number" value={form.offerPrice} onChange={(event) => setForm((current) => ({ ...current, offerPrice: event.target.value }))} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100" />
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
