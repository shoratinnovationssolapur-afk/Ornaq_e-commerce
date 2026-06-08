import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard";
import api from "../services/api";
import heroBanner from "../assets/hero-banner.png";
import { JEWELLERY_CATEGORY } from "../utils/catalog";
import { getHomeCategories } from "../utils/homeCategories";
import { PRIMARY_POLICY_SLUGS, getPolicyPath } from "../utils/policyPages";

export default function HomePage() {
  const [homeFeed, setHomeFeed] = useState({
    newArrivals: [],
    trending: [],
    recommended: [],
    jewellerySpotlight: []
  });
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/products/home-feed"), api.get("/policies")])
      .then(([homeFeedResponse, policyResponse]) => {
        setHomeFeed(homeFeedResponse.data);
        setPolicies(policyResponse.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = getHomeCategories(homeFeed.jewellerySpotlight[0]?.images?.[0]?.url);
  const brandNameParts = [
    {
      label: "OR",
      title: "Ornament",
      desc: "Rooted in ornament, directly signalling jewellery, decoration, and beauty so adornment is the first feeling the name creates."
    },
    {
      label: "NA",
      title: "Nari / Naari",
      desc: "Hidden inside the name, nari means woman in Hindi and Marathi, giving ORNAQ a deeper cultural resonance with its core audience."
    },
    {
      label: "Q",
      title: "Quality / Queen",
      desc: "The Q adds modernity, exclusivity, and edge while positioning every customer as the queen of her own story."
    }
  ];
  const taglineOptions = [
    "Wear Your Story."
  ];
  const brandPillars = [
    {
      title: "Heritage",
      desc: "Rooted in Maharashtra's textile and jewellery traditions, drawing from Paithani, Kolhapuri, and beyond."
    },
    {
      title: "Elegance",
      desc: "Every piece is curated to make the modern Indian woman feel confident, graceful, and beautiful."
    },
    {
      title: "Convenience",
      desc: "Online-first and delivered to your door, with shopping kept simple for the busy Indian woman."
    },
    {
      title: "Trust",
      desc: "Authentic products, transparent pricing, easy returns, and care built one customer at a time."
    }
  ];
  const featuredPolicies = policies
    .filter((policy) => policy.showOnHome)
    .sort((a, b) => {
      const aPriority = PRIMARY_POLICY_SLUGS.indexOf(a.slug);
      const bPriority = PRIMARY_POLICY_SLUGS.indexOf(b.slug);
      const normalizedA = aPriority === -1 ? 999 : aPriority;
      const normalizedB = bPriority === -1 ? 999 : bPriority;
      return normalizedA - normalizedB || a.sortOrder - b.sortOrder;
    });

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      {/* Hero Section - High Impact */}
      <section className="relative h-[90vh] w-full overflow-hidden sm:h-[85vh] lg:h-[94vh]">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src={heroBanner} 
          alt="ORNAQ occasion wear collection" 
          className="absolute inset-0 h-full w-full object-cover object-center" 
        />
        <div className="absolute inset-0 bg-stone-950/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-transparent" />
        
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 sm:px-8 sm:pb-28 lg:pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-4xl"
          >
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-12 bg-brand-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-400 sm:text-xs">
                Maharashtra / India
              </span>
            </div>
            <h1 className="text-5xl font-black leading-[1] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl">
              Wear Your <br /> <span className="text-brand-400 italic font-serif">Story.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-stone-300 sm:text-xl">
              Sarees and jewellery curated for the modern Indian woman, rooted in Maharashtra and delivered across India.
            </p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-6">
              <Link to="/shop" className="btn-primary px-12 py-6 text-sm shadow-2xl">
                Shop Collection
              </Link>
              <Link to="/shop?isNewArrival=true" className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-12 py-6 text-sm font-black uppercase tracking-widest text-white backdrop-blur-xl transition-all hover:bg-white/10 active:scale-95">
                New Arrivals
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Identity */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-brand-700">Brand Identity</p>
              <h2 className="mt-4 text-4xl font-black tracking-tighter text-stone-900 sm:text-6xl">A short name with deep cultural resonance.</h2>
            </div>
            <div className="space-y-5 text-sm font-medium leading-relaxed text-stone-600 sm:text-base">
              <p>
                ORNAQ is a coined brand name: short, distinctive, and memorable. It blends ornament, nari, and quality into one word, connecting sarees and jewellery with beauty, culture, and self-expression.
              </p>
              <p>
                Born in Maharashtra, it is designed to feel premium, easy to remember, and flexible enough to grow across sarees, jewellery, and the wider world of adornment.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {brandNameParts.map((part) => (
              <div key={part.label} className="rounded-lg border border-stone-100 bg-[#fffdf9] p-6 shadow-lg shadow-stone-200/40">
                <p className="text-5xl font-black tracking-tighter text-brand-700">{part.label}</p>
                <h3 className="mt-5 text-2xl font-black text-stone-900">{part.title}</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-stone-500">{part.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-lg bg-stone-900 p-7 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-400">Brand Name Score</p>
              <p className="mt-6 text-6xl font-black tracking-tighter">8.5/10</p>
              <p className="mt-4 text-sm font-medium leading-relaxed text-stone-300">
                Short, pronounceable in Marathi, Hindi, and English, unique in the market, and visually distinctive for a digital-first brand.
              </p>
            </div>
            <div className="rounded-lg border border-brand-100 bg-brand-50 p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-700">Brand Voice</p>
              <h3 className="mt-4 text-3xl font-black tracking-tight text-stone-900">Tagline direction</h3>
              <div className="mt-6 flex flex-wrap gap-3">
                {taglineOptions.map((tagline, index) => (
                  <span key={tagline} className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.18em] ${index === 0 ? "bg-stone-900 text-white" : "bg-white text-stone-700"}`}>
                    {tagline}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-sm font-medium leading-relaxed text-stone-600">
                "Wear Your Story." is the strongest direction because it is short, emotional, and works naturally for both sarees and jewellery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Copy */}
      <section className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-brand-700">Official Brand Copy</p>
            <h2 className="mt-4 text-4xl font-black tracking-tighter text-stone-900 sm:text-6xl">From Maharashtra, for every Indian woman.</h2>
          </div>
          <div className="rounded-lg border border-stone-100 bg-white p-8 shadow-xl shadow-stone-200/50">
            <p className="text-lg font-semibold leading-relaxed text-stone-800">
              ORNAQ is an online destination for Indian women who want to celebrate their beauty through the timeless elegance of sarees and jewellery.
            </p>
            <p className="mt-5 text-sm font-medium leading-relaxed text-stone-500 sm:text-base">
              Born in Maharashtra, we bring handpicked collections that blend cultural tradition with modern design for weddings, festivals, and every precious moment in between.
            </p>
            <p className="mt-5 text-sm font-medium leading-relaxed text-stone-500 sm:text-base">
              From the silk drapes of Paithani to the shimmer of everyday jewellery, ORNAQ is where you find pieces that feel like they were made for you.
            </p>
            <p className="mt-5 text-sm font-medium leading-relaxed text-stone-500 sm:text-base">
              We believe a saree is more than fabric. It is memory, identity, and grace woven into six yards. Jewellery is the language a woman speaks when words are not enough.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Pillars */}
      <section className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 sm:px-8">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.45em] text-brand-700">Core Brand Pillars</p>
          <h2 className="mt-4 text-4xl font-black tracking-tighter text-stone-900 sm:text-6xl">Heritage, elegance, convenience, trust.</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {brandPillars.map((pillar) => (
            <div key={pillar.title} className="rounded-lg border border-stone-100 bg-white p-6 shadow-lg shadow-stone-200/40">
              <h3 className="text-2xl font-black text-stone-900">{pillar.title}</h3>
              <p className="mt-4 text-sm font-medium leading-relaxed text-stone-500">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category Anthology */}
      <section id="collection-categories" className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">ORNAQ Edit</p>
            <h2 className="mt-3 text-4xl font-black tracking-tighter text-stone-900 sm:text-6xl">Stories in Silk</h2>
          </div>
          <Link to="/categories" className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-brand-700 transition-colors hover:text-brand-800">
            View All Categories
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 sm:gap-8 lg:grid-cols-5">
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

      <section className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 sm:px-8">
        <div className="overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_top_left,_rgba(252,211,77,0.22),_transparent_32%),linear-gradient(135deg,_#1f1712,_#3a2419_50%,_#6a3a20)] px-8 py-12 text-white shadow-2xl shadow-amber-200/40 sm:px-12 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-amber-300">Jewellery Edit</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Jewellery Spotlight</h2>
              <p className="mt-5 text-sm font-medium leading-relaxed text-stone-200 sm:text-base">
                Discover necklaces, earrings, bangles, and festive finishing pieces that bring shimmer, grace, and personality to every look.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to={`/shop?category=${encodeURIComponent(JEWELLERY_CATEGORY)}`}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-xs font-black uppercase tracking-[0.25em] text-stone-900 transition-all hover:bg-amber-50"
              >
                Explore Jewellery
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-xs font-black uppercase tracking-[0.25em] text-white transition-all hover:bg-white/15"
              >
                Browse Full Catalog
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {(loading ? Array.from({ length: 3 }) : homeFeed.jewellerySpotlight.slice(0, 3)).map((product, index) =>
              loading ? (
                <div key={index} className="aspect-[4/5] animate-pulse rounded-[2.5rem] bg-white/10" />
              ) : (
                <ProductCard key={product._id} product={product} />
              )
            )}
          </div>

          {!loading && homeFeed.jewellerySpotlight.length === 0 && (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 px-6 py-8 text-center">
              <p className="text-sm font-semibold text-stone-200">
                This showcase is ready for the first jewellery drop from the catalog.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Fresh Selection */}
      <section className="mx-auto mt-32 max-w-7xl px-6 sm:mt-48 sm:px-8">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-700">Freshly Added</p>
          <h2 className="mt-4 text-4xl font-black tracking-tighter text-stone-900 sm:text-6xl">New Arrivals</h2>
          <p className="mx-auto mt-6 max-w-xl text-sm font-medium text-stone-500 sm:text-base">Fresh additions for weddings, festive dressing, gifting, and everyday grace.</p>
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
              <p className="max-w-md text-sm font-medium text-stone-400 sm:text-base">The sarees and jewellery our shoppers are turning to for celebrations, gifting, and standout dressing.</p>
            </div>
            <Link to="/shop?sort=trending" className="btn-secondary border-stone-700 bg-transparent text-white hover:bg-stone-800 px-10">Shop Trends</Link>
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

      <section className="mx-auto mt-32 max-w-7xl px-6 sm:mt-48 sm:px-8">
        <div className="rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Store Policies</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-5xl">
                Clear rules, transparent shopping.
              </h2>
            </div>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-stone-500 sm:text-base">
              Review privacy, terms, refund guidance, and any new rules published by the ORNAQ admin team before placing an order.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {featuredPolicies.map((policy) => (
              <Link
                key={policy._id}
                to={getPolicyPath(policy.slug)}
                className="group rounded-[2rem] border border-stone-100 bg-stone-50/70 p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:bg-white hover:shadow-xl hover:shadow-stone-200/50"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-700">{policy.eyebrow || "Policy"}</p>
                <h3 className="mt-4 text-2xl font-black text-stone-900">{policy.title}</h3>
                <p className="mt-4 text-sm font-medium leading-relaxed text-stone-500">
                  {policy.summary}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-700">
                  Read rule
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {!loading && featuredPolicies.length === 0 && (
            <div className="mt-10 rounded-[2rem] border border-dashed border-stone-200 bg-stone-50 px-6 py-8 text-center">
              <p className="text-sm font-semibold text-stone-500">
                Policy cards will appear here when the admin enables them for the homepage.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Intelligence Section */}
      <section className="mx-auto mt-16 max-w-6xl px-6 pb-32 sm:px-8">
        <div className="grid gap-12 rounded-[4rem] border border-stone-100 bg-white p-12 shadow-2xl shadow-stone-200/50 md:grid-cols-3 md:gap-16 md:p-20">
          {[
            { title: "Occasion Ready", desc: "Handpicked sarees and jewellery for weddings, festivals, gifting, and graceful everyday dressing.", label: "Curation" },
            { title: "Made to Feel Personal", desc: "Every piece is chosen to help the woman wearing it feel adorned in a way that feels true to her.", label: "Identity" },
            { title: "Delivered with Care", desc: "A simple online experience backed by careful delivery, clear pricing, and dependable service.", label: "Service" }
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
