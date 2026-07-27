import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { getHomeCategories } from "../utils/homeCategories";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localPresets = getHomeCategories();

    api.get("/products")
      .then((response) => {
        const products = Array.isArray(response.data) ? response.data : response.data.products || [];
        const merged = [...localPresets];

        products.forEach((product) => {
          if (!product.category) return;

          const nameString = product.category.trim();
          const exists = merged.some(c => c.name.toLowerCase() === nameString.toLowerCase());

          // Safely resolve the clean Cloudinary categoryCover URL string stored inside the product document
          let coverImg = "";
          if (product.categoryCover) {
            coverImg = typeof product.categoryCover === "object" ? product.categoryCover.url : product.categoryCover;
          }

          // Fallback image asset string
          if (!coverImg) {
            coverImg = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop";
          }

          if (!exists) {
            merged.push({
              name: nameString,
              slug: nameString,
              img: coverImg,
              isCustom: true
            });
          } else if (product.categoryCover) {
            const idx = merged.findIndex(c => c.name.toLowerCase() === nameString.toLowerCase());
            if (idx !== -1) {
              merged[idx].img = coverImg;
            }
          }
        });

        setCategories(merged);
      })
      .catch((err) => {
        console.error("Dynamic categories rendering fallback triggered:", err);
        setCategories(localPresets);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-16">
        <header className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Categories</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-5xl">Browse Every Series</h1>
          <p className="mt-4 text-sm font-medium leading-relaxed text-stone-500 sm:text-base">
            Choose a collection first, then we will take you straight into the matching catalog instead of showing every product at once.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => (
            <motion.article
              key={category.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-stone-200/50"
            >
              <Link to={`/shop?category=${encodeURIComponent(category.slug)}`} className="block">
                <div className="aspect-[5/4] overflow-hidden bg-stone-100">
                  <img
                    src={category.img}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop";
                    }}
                  />
                </div>
                <div className="border-t border-stone-100 px-6 py-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">Collection</p>
                  <h2 className="mt-3 text-2xl font-black tracking-tight text-stone-900">{category.name}</h2>
                  <p className="mt-3 text-sm font-medium text-stone-500">
                    Open only the {category.name.toLowerCase()} selection.
                  </p>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}