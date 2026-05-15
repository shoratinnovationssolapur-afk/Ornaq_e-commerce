import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard";
import api from "../services/api";
import heroBanner from "../assets/hero-banner.png";
import catSilk from "../assets/category-silk.png";
import catWedding from "../assets/category-wedding.png";

export default function HomePage() {
  const [homeFeed, setHomeFeed] = useState({
    newArrivals: [],
    trending: [],
    recommended: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products/home-feed")
      .then((response) => setHomeFeed(response.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { name: "Silk", img: catSilk, slug: "Silk" },
    { name: "Wedding Sarees", img: catWedding, slug: "Wedding Sarees" },
    { name: "Cotton", img: catSilk, slug: "Cotton" },
    { name: "Paithani", img: catWedding, slug: "Paithani" }
  ];

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      {/* Hero Section - High Impact */}
      <section className="relative h-[90vh] w-full overflow-hidden sm:h-[85vh] lg:h-screen">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src={heroBanner} 
          alt="Luxury Saree Collection" 
          className="absolute inset-0 h-full w-full object-cover object-center" 
        />
        <div className="absolute inset-0 bg-stone-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent" />
        
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-24 sm:px-8 sm:pb-32 lg:pb-40">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-4xl"
          >
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-12 bg-brand-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-400 sm:text-xs">
                The Artisan Anthology
              </span>
            </div>
            <h1 className="text-5xl font-black leading-[1] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl">
              Sovereign <br /> <span className="text-brand-400 italic font-serif">Elegance.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-stone-300 sm:text-xl">
              Immerse yourself in the legacy of hand-woven mastery. Handpicked treasures for the modern connoisseur of tradition.
            </p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-6">
              <Link to="/shop" className="btn-primary px-12 py-6 text-sm shadow-2xl">
                Enter Collection
              </Link>
              <Link to="/shop?isNewArrival=true" className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-12 py-6 text-sm font-black uppercase tracking-widest text-white backdrop-blur-xl transition-all hover:bg-white/10 active:scale-95">
                New Arrivals
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Anthology */}
      <section className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Exploration</p>
            <h2 className="mt-3 text-4xl font-black tracking-tighter text-stone-900 sm:text-6xl">The Collection</h2>
          </div>
          <Link to="/shop" className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-brand-700 transition-colors hover:text-brand-800">
            View All Series
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 sm:gap-8 lg:grid-cols-4">
          {categories.map((category, i) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-stone-100 shadow-2xl shadow-stone-200/50"
            >
              <Link to={`/shop?category=${encodeURIComponent(category.slug)}`} className="block h-full w-full">
                <img 
                  src={category.img} 
                  alt={category.name} 
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">Discover</p>
                   <p className="text-xl font-black uppercase tracking-tighter text-white sm:text-2xl">{category.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Fresh Selection */}
      <section className="mx-auto mt-32 max-w-7xl px-6 sm:mt-48 sm:px-8">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-700">Artisan Fresh</p>
          <h2 className="mt-4 text-4xl font-black tracking-tighter text-stone-900 sm:text-6xl">New Artifacts</h2>
          <p className="mx-auto mt-6 max-w-xl text-sm font-medium text-stone-500 sm:text-base">Witness the latest masterpieces recently added to our sovereign inventory.</p>
        </div>
        <div className="mt-16 grid gap-6 grid-cols-2 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="aspect-[3/4] animate-pulse rounded-[2.5rem] bg-stone-50 border border-stone-100" />
             ))
          ) : (
            homeFeed.newArrivals.map((product) => <ProductCard key={product._id} product={product} />)
          )}
        </div>
      </section>

      {/* Trending Narrative */}
      <section className="mt-32 bg-stone-900 py-24 text-white sm:mt-48 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-16 flex flex-col gap-8 sm:mb-24 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-500">Popularity Score</p>
              <h2 className="text-4xl font-black tracking-tighter sm:text-7xl">Trending Stories</h2>
              <p className="max-w-md text-sm font-medium text-stone-400 sm:text-base">The drapes that are capturing hearts and defining contemporary elegance.</p>
            </div>
            <Link to="/shop?sort=trending" className="btn-secondary border-stone-700 bg-transparent text-white hover:bg-stone-800 px-10">Experience Trends</Link>
          </div>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {loading ? (
               Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="aspect-[3/4] animate-pulse rounded-[2.5rem] bg-stone-800" />
               ))
            ) : (
              homeFeed.trending.map((product) => <ProductCard key={product._id} product={product} dark />)
            )}
          </div>
        </div>
      </section>

      {/* Intelligence Section */}
      <section className="mx-auto mt-32 max-w-6xl px-6 sm:mt-48 sm:px-8 pb-32">
        <div className="grid gap-12 rounded-[4rem] border border-stone-100 bg-white p-12 shadow-2xl shadow-stone-200/50 md:grid-cols-3 md:gap-16 md:p-20">
          {[
            { title: "Artisanal Purity", desc: "Every thread verified for authenticity and weave integrity.", label: "Heritage" },
            { title: "Sovereign Care", desc: "Dedicated concierge for your drapery needs and aftercare.", label: "Patronage" },
            { title: "Rapid Logistics", desc: "Pincode-optimized delivery ensuring your attire arrives in 3-5 days.", label: "Execution" }
          ].map((item) => (
            <div key={item.title} className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">{item.label}</p>
              <h3 className="mt-6 text-xl font-black text-stone-900 sm:text-2xl">{item.title}</h3>
              <p className="mt-4 text-sm font-medium leading-relaxed text-stone-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
