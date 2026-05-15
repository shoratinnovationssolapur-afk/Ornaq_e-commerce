import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-16">
        <header className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Account</p>
          <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-5xl">Your Haven</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium text-stone-500 sm:text-base">
            Manage your personal sanctuary at ORNAQ. Track orders, curate your wishlist, and update your luxury preferences.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <section className="rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-12">
            <div className="flex items-center gap-6 mb-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-900 text-2xl font-black text-white shadow-xl shadow-stone-200">
                {user?.name?.[0] || "U"}
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-900">{user?.name || "ORNAQ Customer"}</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-700 mt-1">Premium Member</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Registered Email</p>
                <p className="text-base font-bold text-stone-700">{user?.email || "No email linked"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Contact Number</p>
                <p className="text-base font-bold text-stone-700">{user?.phone || "No phone linked"}</p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Security & Sign-in</p>
                <div className="flex flex-wrap gap-2">
                  {(user?.authProviders || ["password"]).map((provider) => (
                    <span key={provider} className="rounded-xl bg-stone-50 border border-stone-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-stone-600">
                      {provider.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700 px-4">Navigation Hub</h2>
            <div className="grid gap-4">
              {[
                { to: "/profile/orders", label: "Order Artifacts", desc: "Track and manage your order timeline", icon: "📦" },
                { to: "/wishlist", label: "Wishlist Collection", desc: "Your handpicked items for later", icon: "✨" },
                { to: "/shop?sort=trending", label: "Curated Trends", desc: "What's capturing hearts this season", icon: "🔥" },
                { to: "/info/privacy", label: "Privacy Sovereignty", desc: "How we protect your luxury data", icon: "🛡️" }
              ].map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="group flex items-center gap-6 rounded-[2.5rem] border border-stone-100 bg-white p-6 shadow-xl shadow-stone-100 transition-all hover:shadow-stone-200/50"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-2xl group-hover:scale-110 transition-transform">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-stone-900 uppercase tracking-widest">{link.label}</p>
                    <p className="mt-1 text-xs font-medium text-stone-500">{link.desc}</p>
                  </div>
                  <svg className="h-5 w-5 text-stone-300 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
