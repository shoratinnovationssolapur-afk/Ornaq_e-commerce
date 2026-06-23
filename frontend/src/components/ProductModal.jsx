import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatCurrency, getMarketPrice, getOfferPrice, getProductColors, getProductImage, hasOfferPrice } from "../utils/catalog";
import ProductMediaViewer from "./ProductMediaViewer";

export default function ProductModal({ product, open, onClose }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useStore();
  
  if (!product) return null;

  const showOffer = hasOfferPrice(product);
  const marketPrice = getMarketPrice(product);
  const offerPrice = getOfferPrice(product);
  const wishlisted = wishlist.some((item) => item._id === product._id);
  const productColors = getProductColors(product);

  const handleAddToCart = () => {
    addToCart(product, 1, product.color);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, 1, product.color);
    onClose();
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 z-10 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid grid-cols-1 gap-8 p-8 sm:p-12 md:grid-cols-2 lg:gap-12">
              {/* Product Media */}
              <div className="flex flex-col">
                <ProductMediaViewer product={product} galleryImages={product.images} />
              </div>

              {/* Product Details */}
              <div className="flex flex-col justify-between">
                <div>
                  <h1 className="text-3xl font-black leading-tight text-stone-900 uppercase tracking-tight sm:text-4xl">
                    {product.name}
                  </h1>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-stone-500">
                    {product.fabric} • {product.category}
                  </p>

                  {/* Pricing */}
                  <div className="mt-6 flex items-baseline gap-4">
                    <span className="text-4xl font-black text-stone-900">{formatCurrency(offerPrice)}</span>
                    {showOffer && (
                      <span className="text-lg font-bold text-stone-300 line-through">{formatCurrency(marketPrice)}</span>
                    )}
                  </div>

                  {/* Stock Info */}
                  <div className="mt-4">
                    {product.stock === 0 ? (
                      <p className="text-sm font-black uppercase tracking-wide text-red-600">Out of Stock</p>
                    ) : product.stock < 5 ? (
                      <p className="text-sm font-black uppercase tracking-wide text-amber-600">Only {product.stock} left</p>
                    ) : (
                      <p className="text-sm font-black uppercase tracking-wide text-green-600">In Stock</p>
                    )}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <div className="mt-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">About this piece</h3>
                      <p className="mt-3 text-sm leading-relaxed text-stone-600">{product.description}</p>
                    </div>
                  )}

                  {/* Colors */}
                  {productColors.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">Available Colors</h3>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {productColors.map((color) => (
                          <div
                            key={color}
                            className="h-8 w-8 rounded-full border-2 border-stone-200 ring-1 ring-stone-100 transition-all hover:ring-2 hover:ring-brand-500"
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Care Instructions */}
                  {product.careInstructions && (
                    <div className="mt-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">Care Instructions</h3>
                      <p className="mt-3 text-sm leading-relaxed text-stone-600">{product.careInstructions}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-4">
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className={`btn-primary flex-1 py-4 text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                      product.stock === 0
                        ? "bg-stone-100 text-stone-300 cursor-not-allowed shadow-none"
                        : "hover:shadow-brand-200/50"
                    }`}
                  >
                    {product.stock === 0 ? "Sold Out" : "Buy Now"}
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border border-stone-200 px-6 py-4 text-sm font-black uppercase tracking-widest transition-all hover:bg-stone-50 active:scale-95 ${
                      product.stock === 0
                        ? "border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed"
                        : "bg-white text-stone-900 hover:border-stone-300"
                    }`}
                  >
                    {product.stock === 0 ? "Sold Out" : "Add to Bag"}
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border border-stone-200 px-6 py-4 text-sm font-black uppercase tracking-widest transition-all hover:bg-stone-50 active:scale-95 ${
                      wishlisted
                        ? "border-red-300 bg-red-50 text-red-600"
                        : "bg-white text-stone-900 hover:border-stone-300"
                    }`}
                  >
                    <svg className="h-5 w-5" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {wishlisted ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
