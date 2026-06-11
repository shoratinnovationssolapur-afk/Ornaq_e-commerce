import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import api, { getApiErrorMessage } from "../services/api";
import { formatCurrency, getProductImage } from "../utils/catalog";

const ProductDetails = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const res = await api.get(`/products/saree/${encodeURIComponent(code)}`);
        setProduct(res.data);
      } catch (error) {
        console.log(error);
        setProduct(null);
        setErrorMessage(getApiErrorMessage(error, "No saree found for this code."));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [code]);

  const selectedColor = product?.color || product?.colors?.[0] || "";
  const availableStock = Number(product?.stock ?? 0);
  const isOutOfStock = availableStock <= 0;
  const effectivePrice = product?.discountPrice || product?.price || 0;

  const buyNow = () => {
    if (!product || isOutOfStock) return;

    navigate("/checkout", {
      state: {
        directItem: {
          product,
          quantity: 1,
          selectedColor
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-stone-500">
        Loading saree details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h2 className="text-2xl font-black text-stone-900">{errorMessage || "No saree found for this code."}</h2>
        <Link to="/shop" className="btn-primary mt-6 inline-flex px-8 py-3">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="grid gap-8 overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-xl shadow-stone-100 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="aspect-[4/5] bg-stone-50 md:aspect-auto">
          <img src={getProductImage(product, selectedColor)} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-700">
            Saree Code: {product.sareeCode || code}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-stone-400">
            {[product.category, product.fabric, selectedColor].filter(Boolean).join(" • ")}
          </p>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <p className="text-3xl font-black text-stone-900">{formatCurrency(effectivePrice)}</p>
            {Number(product.discountPercent || 0) > 0 && (
              <>
                <span className="text-base font-bold text-stone-300 line-through">{formatCurrency(product.price)}</span>
                <span className="rounded-lg bg-red-100 px-2 py-1 text-xs font-black text-red-600">
                  SAVE {product.discountPercent}%
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-5 text-base leading-relaxed text-stone-600">{product.description}</p>
          )}

          <div className="mt-6 rounded-2xl border border-stone-100 bg-stone-50 px-5 py-4">
            <p className={`text-sm font-black uppercase tracking-wider ${isOutOfStock ? "text-red-600" : "text-emerald-700"}`}>
              {isOutOfStock ? "Sold Out" : `${availableStock} in stock`}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => addToCart(product, 1, selectedColor)}
              disabled={isOutOfStock}
              className="btn-primary justify-center py-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isOutOfStock ? "Sold Out" : "Add to Bag"}
            </button>
            <button
              type="button"
              onClick={buyNow}
              disabled={isOutOfStock}
              className="rounded-full border-2 border-stone-900 bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-stone-900 transition-all hover:bg-stone-900 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400 disabled:hover:bg-stone-100"
            >
              {isOutOfStock ? "Unavailable" : "Buy Now"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {product.slug && (
              <Link to={`/product/${product.slug}`} className="text-sm font-black text-brand-700 hover:text-brand-900">
                View full details
              </Link>
            )}
            {product.youtubeLink && (
              <a href={product.youtubeLink} target="_blank" rel="noreferrer" className="text-sm font-black text-brand-700 hover:text-brand-900">
                Watch Video
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
