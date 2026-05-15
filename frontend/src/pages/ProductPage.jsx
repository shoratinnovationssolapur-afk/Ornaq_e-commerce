import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useRealtime } from "../hooks/useRealtime";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import ReviewSection from "../components/ReviewSection";
import SkeletonBlock from "../components/SkeletonBlock";
import { formatCurrency, getProductColors, getProductImage } from "../utils/catalog";

export default function ProductPage() {
  const { slug } = useParams();
  const { addToCart, markViewed, recentlyViewed } = useStore();
  const [product, setProduct] = useState(null);
  const [discovery, setDiscovery] = useState({
    relatedProducts: [],
    recommendedProducts: [],
    frequentlyBoughtTogether: []
  });
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincode, setPincode] = useState("");
  const [serviceability, setServiceability] = useState(null);

  useEffect(() => {
    setProduct(null);
    api.get(`/products/${slug}`).then((response) => {
      setProduct(response.data);
      setSelectedColor(response.data.color || response.data.colors?.[0] || "");
      setActiveImage(response.data.images?.[0]?.url || "");
      markViewed(response.data);
      document.title = `${response.data.name} | Ornac`;
      api.get(`/products/discovery/${response.data._id}`).then((related) => setDiscovery(related.data)).catch(() => {});
    });
  }, [slug, markViewed]);

  useRealtime({
    onStockUpdate: ({ productId, stock }) => setProduct((current) => (current && current._id === productId ? { ...current, stock } : current))
  });

  const effectivePrice = useMemo(() => product?.discountPrice || product?.price || 0, [product]);
  const productColors = useMemo(() => getProductColors(product), [product]);
  const activeVariant = useMemo(
    () => product?.variants?.find((variant) => variant.color === selectedColor) || null,
    [product, selectedColor]
  );
  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (activeVariant?.images?.length) return activeVariant.images;
    return product.images || [];
  }, [product, activeVariant]);
  const recentlyViewedOthers = useMemo(
    () => recentlyViewed.filter((item) => item.slug !== slug).slice(0, 4),
    [recentlyViewed, slug]
  );

  const checkPincode = async () => {
    if (!product || !pincode) return;
    setCheckingPincode(true);
    try {
      const response = await api.get(`/products/${product._id}/serviceability/${pincode}`);
      setServiceability(response.data);
    } finally {
      setCheckingPincode(false);
    }
  };

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <SkeletonBlock className="h-[32rem] w-full" />
          <div className="space-y-4">
            <SkeletonBlock className="h-12 w-2/3" />
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-10 w-40" />
            <SkeletonBlock className="h-12 w-52" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left Column: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-sm sm:aspect-[4/5] lg:aspect-square">
            <img
              src={activeImage || getProductImage(product)}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
            />
            {product.isNewArrival && (
              <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                New Arrival
              </span>
            )}
          </div>
          
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {galleryImages.map((image) => (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => setActiveImage(image.url)}
                  className={`relative h-20 w-20 flex-shrink-0 snap-start overflow-hidden rounded-2xl border-2 transition-all ${
                    activeImage === image.url ? "border-brand-500 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={image.url} alt={product.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col pt-2 lg:pt-0">
          <div className="mb-6 border-b border-stone-100 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-stone-900 sm:text-4xl">{product.name}</h1>
                <p className="text-sm font-bold uppercase tracking-widest text-brand-700">{product.category} • {product.fabric}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-stone-900 px-3 py-1.5 text-white shadow-lg shadow-stone-200">
                <span className="text-sm font-black">{Number(product.averageRating || 0).toFixed(1)}</span>
                <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <p className="text-3xl font-black text-stone-900 sm:text-4xl">{formatCurrency(effectivePrice)}</p>
              {Number(product.discountPercent || 0) > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-stone-400 line-through">{formatCurrency(product.price)}</span>
                  <span className="rounded-lg bg-red-100 px-2 py-1 text-xs font-black text-red-600">
                    SAVE {product.discountPercent}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-base leading-relaxed text-stone-600 sm:text-lg">{product.description}</p>

            {productColors.length > 0 && (
              <div>
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Select Saree Color</p>
                <div className="flex flex-wrap gap-3">
                  {productColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex min-h-[3rem] items-center gap-3 rounded-2xl border-2 px-6 py-2 transition-all active:scale-95 ${
                        selectedColor === color 
                          ? "border-brand-600 bg-brand-50/50 text-brand-900 shadow-md shadow-brand-100" 
                          : "border-stone-100 bg-stone-50 text-stone-600 hover:border-stone-200"
                      }`}
                    >
                      <div className="h-4 w-4 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: color.toLowerCase() }} />
                      <span className="text-sm font-bold">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-stone-100 bg-emerald-50/30 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm font-black text-emerald-800 uppercase tracking-wider">In Stock</p>
                </div>
                <p className="text-2xl font-black text-stone-900">{activeVariant?.stock ?? product.stock} <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Units left</span></p>
              </div>

              <div className="rounded-3xl border border-stone-100 bg-stone-50/50 p-6">
                <p className="text-sm font-black text-stone-400 uppercase tracking-wider mb-2">Shipping Estimate</p>
                <p className="text-lg font-bold text-stone-800">{product.deliveryEstimate?.minDays || 3}-{product.deliveryEstimate?.maxDays || 5} Business Days</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button 
                type="button" 
                onClick={() => addToCart(product, 1, selectedColor)} 
                className="btn-primary w-full shadow-2xl py-5 text-lg"
              >
                Add to Luxury Bag
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </button>

              <div className="rounded-3xl bg-zinc-900 p-6 text-white shadow-2xl">
                <p className="mb-4 text-sm font-bold tracking-tight">Check Delivery & COD Availability</p>
                <div className="flex gap-2">
                  <input
                    value={pincode}
                    onChange={(event) => setPincode(event.target.value)}
                    placeholder="Enter delivery pincode"
                    className="flex-1 rounded-xl bg-white/10 px-4 py-3.5 text-sm font-medium border border-white/20 outline-none focus:bg-white/20 transition-all placeholder:text-zinc-500"
                  />
                  <button 
                    type="button" 
                    onClick={checkPincode} 
                    className="rounded-xl bg-white px-6 py-3.5 text-sm font-black text-zinc-900 transition-all hover:bg-zinc-100 active:scale-95"
                  >
                    {checkingPincode ? "..." : "Check"}
                  </button>
                </div>
                {serviceability && (
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 text-sm font-bold ${serviceability.available ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {serviceability.message}
                  </motion.p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <ReviewSection
          productId={product._id}
          ratingSummary={{ averageRating: product.averageRating, totalReviews: product.totalReviews }}
        />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Related products</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {discovery.relatedProducts.map((item) => <ProductCard key={item._id} product={item} />)}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Frequently bought together</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {discovery.frequentlyBoughtTogether.map((item) => <ProductCard key={item._id} product={item} />)}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Recommended for you</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {discovery.recommendedProducts.map((item) => <ProductCard key={item._id} product={item} />)}
        </div>
      </section>

      {recentlyViewedOthers.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Recently viewed</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewedOthers.map((item) => <ProductCard key={item._id} product={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}
