import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../context/StoreContext";
import { formatCurrency, getMarketPrice, getOfferPrice, getProductColors, getProductImage, hasOfferPrice } from "../utils/catalog";
import ProductMediaViewer from "./ProductMediaViewer";

export default function ProductExpandedPreview({ product, open, onClose }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  
  if (!product) return null;

  const showOffer = hasOfferPrice(product);
  const marketPrice = getMarketPrice(product);
  const offerPrice = getOfferPrice(product);
  const wishlisted = wishlist.some((item) => item._id === product._id);
  const productColors = getProductColors(product);

  const handleAddToCart = () => {
    addToCart(product, 1, product.color);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm"
          />

          {/* Expanded Card */}
          <motion.div
            layoutId={`product-card-${product._id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, type: "spring", damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl">
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                className="absolute right-6 top-6 z-10 rounded-full bg-white p-2 text-stone-400 shadow-lg hover:bg-stone-50 hover:text-stone-900 transition-all"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              <div className="grid grid-cols-1 gap-8 p-6 sm:p-10 md:grid-cols-2 lg:gap-10">
                {/* Product Media */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="flex flex-col"
                >
                  <ProductMediaViewer product={product} />
                </motion.div>

                {/* Product Details */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="flex flex-col justify-between"
                >
                  <div>
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="text-3xl font-black leading-tight text-stone-900 uppercase tracking-tight sm:text-4xl"
                    >
                      {product.name}
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-stone-500"
                    >
                      {product.fabric} • {product.category}
                    </motion.p>

                    {/* Pricing */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="mt-6 flex items-baseline gap-4"
                    >
                      <span className="text-4xl font-black text-stone-900">{formatCurrency(offerPrice)}</span>
                      {showOffer && (
                        <span className="text-lg font-bold text-stone-300 line-through">{formatCurrency(marketPrice)}</span>
                      )}
                    </motion.div>

                    {/* Stock Info */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4"
                    >
                      {product.stock === 0 ? (
                        <p className="text-sm font-black uppercase tracking-wide text-red-600">Out of Stock</p>
                      ) : product.stock < 5 ? (
                        <p className="text-sm font-black uppercase tracking-wide text-amber-600">Only {product.stock} left</p>
                      ) : (
                        <p className="text-sm font-black uppercase tracking-wide text-green-600">In Stock</p>
                      )}
                    </motion.div>

                    {/* Description */}
                    {product.description && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        className="mt-8"
                      >
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">About this piece</h3>
                        <p className="mt-3 text-sm leading-relaxed text-stone-600">{product.description}</p>
                      </motion.div>
                    )}

                    {/* Colors */}
                    {productColors.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8"
                      >
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">Available Colors</h3>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {productColors.map((color, idx) => (
                            <motion.div
                              key={color}
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 + idx * 0.05 }}
                              className="h-8 w-8 rounded-full border-2 border-stone-200 ring-1 ring-stone-100 transition-all hover:ring-2 hover:ring-brand-500"
                              style={{ backgroundColor: color.toLowerCase() }}
                              title={color}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Care Instructions */}
                    {product.careInstructions && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="mt-8"
                      >
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">Care Instructions</h3>
                        <p className="mt-3 text-sm leading-relaxed text-stone-600">{product.careInstructions}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-4"
                  >
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className={`btn-primary flex-1 py-4 text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                        product.stock === 0
                          ? "bg-stone-100 text-stone-300 cursor-not-allowed shadow-none"
                          : "hover:shadow-brand-200/50"
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
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
