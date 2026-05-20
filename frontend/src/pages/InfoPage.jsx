import { businessProfile } from "../utils/businessProfile";

const pageContent = {
  "privacy-policy": {
    title: "Privacy Policy",
    eyebrow: "Privacy",
    paragraphs: [
      "ORNAQ collects account, order, delivery, and communication details only to operate the ecommerce experience, support customer care, and send order updates.",
      "This is a placeholder legal page for the current build. Replace it with your final legal text before production launch."
    ]
  },
  "terms-and-conditions": {
    title: "Terms & Conditions",
    eyebrow: "Terms",
    paragraphs: [
      "By placing an order on ORNAQ, customers agree to the pricing, delivery, cancellation, and return policies shown at checkout.",
      "This is a placeholder page and should be reviewed with final legal-approved terms before launch."
    ]
  },
  "refund-policy": {
    title: "Refund Policy",
    eyebrow: "Refunds",
    paragraphs: [
      "Refunds for prepaid orders are initiated after cancellation approval or successful return processing according to the order timeline.",
      "This placeholder text should be replaced with your final policy wording and settlement timelines."
    ]
  },
  "shipping-policy": {
    title: "Shipping Policy",
    eyebrow: "Shipping",
    paragraphs: [
      "ORNAQ currently uses standard delivery windows of 3 to 5 days for serviceable pincodes, with free shipping above Rs. 999 and Rs. 50 below that threshold.",
      "This is sample policy content and should be finalized before public release."
    ]
  },
  "cancellation-policy": {
    title: "Cancellation Policy",
    eyebrow: "Cancellations",
    paragraphs: [
      "Orders may be cancelled before shipment. Once an order has shipped, customers should use the return request workflow instead.",
      "This is a temporary page and should be updated with your final operational policy."
    ]
  },
  disclaimer: {
    title: "Disclaimer",
    eyebrow: "Disclaimer",
    paragraphs: [
      "Product colors, weave appearance, and blouse styling may vary slightly due to photography, display settings, and artisan finishing.",
      "This placeholder disclaimer should be replaced with your final approved brand copy."
    ]
  },
  contact: {
    title: "Contact",
    eyebrow: "Support",
    paragraphs: [
      "Reach the ORNAQ team for order help, catalog questions, delivery support, collaborations, or social updates through any of the official channels below."
    ],
    showContactDirectory: true
  },
  faq: {
    title: "FAQ",
    eyebrow: "Help",
    paragraphs: [
      "Customers can browse FAQs about delivery timelines, care instructions, payment options, returns, and festive catalog availability here.",
      "This page currently contains placeholder content and should be expanded with real support answers."
    ]
  }
};

export default function InfoPage({ slug }) {
  const page = pageContent[slug] || pageContent.disclaimer;
  const isContactPage = Boolean(page.showContactDirectory);

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-16">
        <header className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">{page.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-5xl">{page.title}</h1>
        </header>

        <div className="space-y-8 rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-12">
          {page.paragraphs.map((paragraph, idx) => (
            <p key={idx} className="text-sm font-medium leading-[1.8] text-stone-500 sm:text-base">
              {paragraph}
            </p>
          ))}

          {isContactPage && (
            <>
              <div className="grid gap-4 pt-2 sm:grid-cols-3">
                <a href={`mailto:${businessProfile.email}`} className="rounded-[2rem] border border-stone-100 bg-stone-50 px-6 py-6 transition-colors hover:bg-stone-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">Email</p>
                  <p className="mt-3 text-sm font-bold text-stone-900">{businessProfile.email}</p>
                </a>
                <a href={businessProfile.socials.whatsapp} target="_blank" rel="noreferrer" className="rounded-[2rem] border border-stone-100 bg-stone-50 px-6 py-6 transition-colors hover:bg-stone-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">WhatsApp</p>
                  <p className="mt-3 text-sm font-bold text-stone-900">+91 98229 37198</p>
                </a>
                <a href={businessProfile.website} target="_blank" rel="noreferrer" className="rounded-[2rem] border border-stone-100 bg-stone-50 px-6 py-6 transition-colors hover:bg-stone-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">Website</p>
                  <p className="mt-3 text-sm font-bold text-stone-900">www.ornaq.in</p>
                </a>
              </div>

              <div className="rounded-[2.5rem] border border-stone-100 bg-stone-50/60 p-6 sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-700">Official Channels</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {businessProfile.contactLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                      className="rounded-[1.75rem] border border-white bg-white px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-200/50"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">{item.label}</p>
                      <p className="mt-2 text-sm font-bold leading-relaxed text-stone-900">{item.value}</p>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
