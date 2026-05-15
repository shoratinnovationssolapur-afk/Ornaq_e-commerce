import { Link } from "react-router-dom";
import { businessProfile } from "../utils/businessProfile";

export default function BusinessFooter() {
  const legalLinks = [
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms & Conditions", path: "/terms-and-conditions" },
    { label: "Refund Policy", path: "/refund-policy" },
    { label: "Shipping Policy", path: "/shipping-policy" },
    { label: "Cancellation Policy", path: "/cancellation-policy" },
    { label: "Disclaimer", path: "/disclaimer" },
    { label: "Contact", path: "/contact" },
    { label: "FAQ", path: "/faq" }
  ];

  return (
    <footer className="bg-stone-900 pt-24 pb-12 text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-16 border-b border-stone-800 pb-20 lg:grid-cols-12">
          {/* Brand Essence */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-brand-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-400">Est. 2026</p>
            </div>
            <h3 className="mt-6 text-3xl font-black tracking-tighter sm:text-4xl">{businessProfile.brandName}</h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-stone-500">{businessProfile.marathiName}</p>
            <p className="mt-6 text-sm font-medium leading-relaxed text-stone-400">
              {businessProfile.businessDescription}
            </p>
            <div className="mt-10 flex gap-4">
              {Object.entries(businessProfile.socials).map(([platform, url]) => (
                <a 
                  key={platform} 
                  href={url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="rounded-full border border-stone-800 p-3 transition-colors hover:border-brand-500 hover:text-brand-400"
                  aria-label={platform}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{platform.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation & Policies */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-5">
            <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Curations</p>
              <nav className="flex flex-col gap-4 text-sm font-bold">
                <Link to="/shop" className="hover:text-brand-400 transition-colors">Collection</Link>
                <Link to="/shop?isNewArrival=true" className="hover:text-brand-400 transition-colors">New Arrivals</Link>
                <Link to="/wishlist" className="hover:text-brand-400 transition-colors">Wishlist</Link>
                <Link to="/cart" className="hover:text-brand-400 transition-colors">My Cart</Link>
              </nav>
            </div>
            <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Legal Portfolio</p>
              <nav className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-stone-400">
                {legalLinks.map((link) => (
                  <Link key={link.path} to={link.path} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Contact & Intelligence */}
          <div className="lg:col-span-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 mb-6">Concierge</p>
            <div className="space-y-6 text-sm font-medium text-stone-400">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Location</span>
                <p>{businessProfile.businessAddress}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Direct Line</span>
                <p className="text-white font-bold">{businessProfile.phone}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Intelligence</span>
                <p>Managed by {businessProfile.ownerName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">
            © 2026 ORNAQ. All Rights Reserved. Crafted for Sovereignty.
          </p>
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Secure Payments</span>
             <div className="flex gap-3 opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0">
               <div className="h-4 w-8 rounded bg-white/20" />
               <div className="h-4 w-8 rounded bg-white/20" />
               <div className="h-4 w-8 rounded bg-white/20" />
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
