import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";

export default function WishlistPage() {
  const { wishlist } = useStore();

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-16">
        <header className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Collection</p>
          <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-5xl">Your Wishlist</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium text-stone-500 sm:text-base">
            Your curated collection of premium handloom artifacts. These items are reserved here for your future acquisitions.
          </p>
        </header>

        {wishlist.length === 0 ? (
          <div className="rounded-[3rem] border border-dashed border-stone-200 bg-white px-8 py-20 text-center shadow-xl shadow-stone-100">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-50 text-2xl">✨</div>
            <h2 className="text-2xl font-black text-stone-900">A canvas waiting for art</h2>
            <p className="mt-3 text-stone-500">Your wishlist is currently empty. Begin your journey through our curated collections.</p>
            <Link to="/shop" className="btn-primary mt-8 inline-flex px-10">
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {wishlist.map((product) => (
              <div key={product._id} className="animate-fade-in">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
