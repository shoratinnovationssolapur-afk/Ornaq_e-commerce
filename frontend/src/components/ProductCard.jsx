import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatCurrency, getProductColors, getProductImage } from "../utils/catalog";

export default function ProductCard({ product, dark = false }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const discounted = Number(product.discountPercent || 0) > 0;
  const wishlisted = wishlist.some((item) => item._id === product._id);
  const productColors = getProductColors(product);
  const colors = productColors.slice(0, 3);

  return (
    <motion.article
      whileHover={{ y: -8 }}
      className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-500 ${
        dark ? "border-stone-800 bg-stone-800 text-white shadow-2xl" : "border-stone-50 bg-white shadow-xl shadow-stone-100 hover:shadow-stone-200/50"
      }`}
    >
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-stone-50">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-stone-900/0 transition-colors duration-500 group-hover:bg-stone-900/5" />
        
        {/* Badges */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {discounted && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
              {product.discountPercent}% Off
            </span>
          )}
          {product.isNewArrival && (
            <span className="rounded-full bg-stone-900/80 backdrop-blur-md px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
              New
            </span>
          )}
        </div>

        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
            Rare
          </span>
        )}
      </Link>

      <div className="flex flex-col p-6">
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="line-clamp-1 flex-1 text-sm font-black text-stone-900 uppercase tracking-wider group-hover:text-brand-700 transition-colors">
              {product.name}
            </h3>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
              className={`shrink-0 transition-all duration-300 hover:scale-125 ${wishlisted ? "text-red-500" : "text-stone-200 hover:text-stone-400"}`}
            >
              <svg className="h-5 w-5" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
            {product.fabric} • {product.category}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-stone-900">{formatCurrency(product.discountPrice || product.price)}</span>
              {discounted && <span className="text-xs font-bold text-stone-300 line-through">{formatCurrency(product.price)}</span>}
            </div>
            {colors.length > 0 && (
              <div className="flex -space-x-1">
                {colors.map((color) => (
                  <div key={color} className="h-3 w-3 rounded-full border-2 border-white ring-1 ring-stone-100" style={{ backgroundColor: color.toLowerCase() }} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); addToCart(product, 1, product.color); }}
              disabled={product.stock === 0}
              className={`btn-primary w-full py-3 shadow-xl shadow-stone-100 transition-all active:scale-95 ${
                product.stock === 0 
                  ? "bg-stone-100 text-stone-300 cursor-not-allowed shadow-none" 
                  : "hover:shadow-brand-200/50"
              }`}
            >
              {product.stock === 0 ? "Sold Out" : "Add to Bag"}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
