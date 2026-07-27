import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { businessProfile } from "../utils/businessProfile";

const staticPageContent = {
  contact: {
    title: "Contact",
    eyebrow: "Support",
    paragraphs: [
      "Reach the ORNAQ team for order help, catalog questions, delivery support, collaborations, or social updates through any of the official channels below."
    ],
    showContactDirectory: true
  },
  "shipping-policy": {
    title: "Shipping Policy",
    eyebrow: "Shipping",
    paragraphs: [
      "Shipping timelines, charges, and serviceability may vary by pincode, product type, and courier network availability.",
      "Please review delivery estimates shown on the product page and at checkout for the most current dispatch commitment."
    ]
  },
  "cancellation-policy": {
    title: "Cancellation Policy",
    eyebrow: "Cancellations",
    paragraphs: [
      "Orders may be reviewed for cancellation before dispatch. Once an order has shipped, only the approved return or replacement workflow can be used.",
      "For urgent cancellation requests, contact ORNAQ support as quickly as possible with your order number."
    ]
  },
  disclaimer: {
    title: "Disclaimer",
    eyebrow: "Disclaimer",
    paragraphs: [
      "Product colors, weave appearance, zari tone, embroidery finish, and blouse styling can vary slightly because of photography, device screens, and handcrafted processes.",
      "Customers should review product descriptions carefully before placing an order."
    ]
  },
  faq: {
    title: "FAQ",
    eyebrow: "Help",
    paragraphs: [
      "For help with delivery timelines, payment methods, care guidance, or exchange eligibility, please reach out to the ORNAQ support team directly."
    ]
  }
};

const parsePolicyBody = (body = "") =>
  body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (!lines.length) return null;

      if (/^##\s+/.test(lines[0])) {
        return { type: "heading", content: lines[0].replace(/^##\s+/, "") };
      }

      if (lines.every((line) => /^[-*]\s+/.test(line))) {
        return {
          type: "list",
          ordered: false,
          items: lines.map((line) => line.replace(/^[-*]\s+/, ""))
        };
      }

      if (lines.every((line) => /^\d+\.\s+/.test(line))) {
        return {
          type: "list",
          ordered: true,
          items: lines.map((line) => line.replace(/^\d+\.\s+/, ""))
        };
      }

      return { type: "paragraph", content: lines.join(" ") };
    })
    .filter(Boolean);

const formatUpdatedDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

export default function InfoPage({ slug: propSlug }) {
  const params = useParams();
  const resolvedSlug = propSlug || params.slug || "contact";
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(!staticPageContent[resolvedSlug]);

  useEffect(() => {
    let isMounted = true;

    if (staticPageContent[resolvedSlug]) {
      setPolicy(null);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);
    api.get(`/policies/${resolvedSlug}`)
      .then((response) => {
        if (isMounted) {
          setPolicy(response.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPolicy(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedSlug]);

  const staticPage = staticPageContent[resolvedSlug];
  const bodyBlocks = useMemo(() => parsePolicyBody(policy?.body), [policy]);
  const pageTitle = policy?.title || staticPage?.title || "Information";
  const pageEyebrow = policy?.eyebrow || staticPage?.eyebrow || "Info";
  const summary = policy?.summary;
  const isContactPage = Boolean(staticPage?.showContactDirectory);

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-16">
        <header className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">{pageEyebrow}</p>
          <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-5xl">{pageTitle}</h1>
          {policy?.updatedAt && (
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
              Updated {formatUpdatedDate(policy.updatedAt)}
            </p>
          )}
        </header>

        <div className="space-y-8 rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-12">
          {loading && (
            <div className="py-12 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
              <p className="mt-4 text-sm font-bold text-stone-400">Loading page content...</p>
            </div>
          )}

          {!loading && policy && (
            <>
              {summary && (
                <div className="rounded-[2.5rem] border border-brand-100 bg-brand-50/70 p-6 sm:p-8">
                  <p className="text-sm font-semibold leading-relaxed text-stone-700 sm:text-base">{summary}</p>
                </div>
              )}

              <div className="space-y-6">
                {bodyBlocks.map((block, index) => {
                  if (block.type === "heading") {
                    return (
                      <h2 key={index} className="pt-2 text-2xl font-black text-stone-900 sm:text-3xl">
                        {block.content}
                      </h2>
                    );
                  }

                  if (block.type === "list") {
                    const ListTag = block.ordered ? "ol" : "ul";
                    return (
                      <ListTag
                        key={index}
                        className={`space-y-3 pl-5 text-sm font-medium leading-[1.8] text-stone-600 sm:text-base ${
                          block.ordered ? "list-decimal" : "list-disc"
                        }`}
                      >
                        {block.items.map((item, itemIndex) => (
                          <li key={`${itemIndex}-${item}`}>{item}</li>
                        ))}
                      </ListTag>
                    );
                  }

                  return (
                    <p key={index} className="text-sm font-medium leading-[1.8] text-stone-500 sm:text-base">
                      {block.content}
                    </p>
                  );
                })}
              </div>
            </>
          )}

          {!loading && !policy && staticPage?.paragraphs?.map((paragraph, idx) => (
            <p key={idx} className="text-sm font-medium leading-[1.8] text-stone-500 sm:text-base">
              {paragraph}
            </p>
          ))}

          {!loading && !policy && !staticPage && (
            <p className="text-sm font-medium leading-[1.8] text-stone-500 sm:text-base">
              This page is not available right now.
            </p>
          )}

          {isContactPage && (
            <>
              <div className="grid gap-4 pt-2 sm:grid-cols-3">
                <a href={`mailto:${businessProfile.email}`} className="rounded-[2rem] border border-stone-100 bg-stone-50 px-6 py-6 transition-colors hover:bg-stone-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">Email</p>
                  <p className="mt-3 text-sm font-bold text-stone-900">{businessProfile.email}</p>
                </a>
                <a href={businessProfile.socials.whatsapp} target="_blank" rel="noreferrer" className="rounded-[2rem] border border-stone-100 bg-stone-50 px-6 py-6 transition-colors hover:bg-stone-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">WhatsApp</p>
                  <p className="mt-3 text-sm font-bold text-stone-900">{businessProfile.phone}</p>
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
