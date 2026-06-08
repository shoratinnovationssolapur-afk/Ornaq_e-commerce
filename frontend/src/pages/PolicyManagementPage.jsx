import { useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { createPolicySlug, getPolicyPath } from "../utils/policyPages";

const createBlankForm = () => ({
  title: "",
  slug: "",
  footerLabel: "",
  eyebrow: "Policy",
  summary: "",
  body: "",
  showInFooter: true,
  showOnHome: false,
  isPublished: true,
  sortOrder: 100
});

export default function PolicyManagementPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState(createBlankForm());
  const { showToast } = useNotification();

  const isEditing = Boolean(editingId);
  const publishedCount = useMemo(
    () => policies.filter((policy) => policy.isPublished).length,
    [policies]
  );

  const fetchPolicies = async () => {
    try {
      const response = await api.get("/policies/admin/list");
      setPolicies(response.data);
    } catch (error) {
      showToast({
        title: "Unable to load rules",
        message: getApiErrorMessage(error, "Please refresh and try again."),
        tone: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const resetForm = () => {
    setEditingId("");
    setSlugTouched(false);
    setForm(createBlankForm());
  };

  const setField = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "title" && !slugTouched) {
        next.slug = createPolicySlug(value);
      }
      if (key === "slug") {
        next.slug = createPolicySlug(value);
      }
      return next;
    });
  };

  const startEditing = (policy) => {
    setEditingId(policy._id);
    setSlugTouched(true);
    setForm({
      title: policy.title,
      slug: policy.slug,
      footerLabel: policy.footerLabel || "",
      eyebrow: policy.eyebrow || "Policy",
      summary: policy.summary || "",
      body: policy.body,
      showInFooter: Boolean(policy.showInFooter),
      showOnHome: Boolean(policy.showOnHome),
      isPublished: Boolean(policy.isPublished),
      sortOrder: policy.sortOrder ?? 100
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        slug: createPolicySlug(form.slug || form.title),
        sortOrder: Number(form.sortOrder || 100)
      };

      if (isEditing) {
        await api.put(`/policies/${editingId}`, payload);
        showToast({ title: "Rule updated", message: "The policy page is live with the latest content." });
      } else {
        await api.post("/policies", payload);
        showToast({ title: "Rule added", message: "The new rule is ready for customers." });
      }

      await fetchPolicies();
      resetForm();
    } catch (error) {
      showToast({
        title: isEditing ? "Update failed" : "Creation failed",
        message: getApiErrorMessage(error, "Please review the fields and try again."),
        tone: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (policy) => {
    if (!window.confirm(`Delete "${policy.title}"?`)) return;

    try {
      await api.delete(`/policies/${policy._id}`);
      showToast({ title: "Rule deleted", message: "The policy page has been removed." });
      await fetchPolicies();
      if (editingId === policy._id) {
        resetForm();
      }
    } catch (error) {
      showToast({
        title: "Delete failed",
        message: getApiErrorMessage(error, "This rule could not be removed."),
        tone: "error"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-6 border-b border-stone-100 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Governance</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-5xl">Policy Manager</h1>
            <p className="mt-4 max-w-3xl text-sm font-medium text-stone-500 sm:text-base">
              Publish privacy, terms, refund guidance, or any new rule from one place. Each rule can be shown on the homepage, in the footer, or kept hidden until it is ready.
            </p>
          </div>
          <div className="rounded-[2rem] border border-stone-100 bg-white px-6 py-4 shadow-lg shadow-stone-100/60">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Live Pages</p>
            <p className="mt-2 text-3xl font-black text-stone-900">{publishedCount}</p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">Editor</p>
                <h2 className="mt-2 text-2xl font-black text-stone-900">
                  {isEditing ? "Edit policy page" : "Create a new rule"}
                </h2>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[10px] font-black uppercase tracking-widest text-stone-400 transition-colors hover:text-stone-900"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Title</span>
                  <input
                    required
                    value={form.title}
                    onChange={(event) => setField("title", event.target.value)}
                    className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent transition-all focus:bg-white focus:border-brand-300 focus:ring-0"
                    placeholder="Refund turnaround rule"
                  />
                </label>
                <label className="space-y-2">
                  <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Slug</span>
                  <input
                    required
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setField("slug", event.target.value);
                    }}
                    className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent transition-all focus:bg-white focus:border-brand-300 focus:ring-0"
                    placeholder="refund-turnaround-rule"
                  />
                </label>
              </div>

              <div className="grid gap-6 sm:grid-cols-[0.8fr_1.2fr]">
                <label className="space-y-2">
                  <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Eyebrow</span>
                  <input
                    value={form.eyebrow}
                    onChange={(event) => setField("eyebrow", event.target.value)}
                    className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent transition-all focus:bg-white focus:border-brand-300 focus:ring-0"
                    placeholder="Policy"
                  />
                </label>
                <label className="space-y-2">
                  <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Footer label</span>
                  <input
                    value={form.footerLabel}
                    onChange={(event) => setField("footerLabel", event.target.value)}
                    className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent transition-all focus:bg-white focus:border-brand-300 focus:ring-0"
                    placeholder="Short label shown in footer"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Summary</span>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={(event) => setField("summary", event.target.value)}
                  className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-medium leading-relaxed border-transparent transition-all focus:bg-white focus:border-brand-300 focus:ring-0"
                  placeholder="Short explanation shown in cards and previews"
                />
              </label>

              <label className="space-y-2">
                <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Body</span>
                <textarea
                  required
                  rows={18}
                  value={form.body}
                  onChange={(event) => setField("body", event.target.value)}
                  className="w-full rounded-[2rem] bg-stone-50 px-6 py-5 text-sm font-medium leading-relaxed border-transparent transition-all focus:bg-white focus:border-brand-300 focus:ring-0"
                  placeholder={`Use simple formatting:

## Section heading

- Bullet item
- Another bullet

1. Step one
2. Step two`}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Sort order</span>
                  <input
                    type="number"
                    min="0"
                    value={form.sortOrder}
                    onChange={(event) => setField("sortOrder", event.target.value)}
                    className="w-full rounded-2xl bg-stone-50 px-6 py-4 text-sm font-bold border-transparent transition-all focus:bg-white focus:border-brand-300 focus:ring-0"
                  />
                </label>
                <div className="grid gap-3">
                  <label className="flex items-center gap-3 rounded-2xl bg-stone-50 px-5 py-4">
                    <input
                      type="checkbox"
                      checked={form.showInFooter}
                      onChange={(event) => setField("showInFooter", event.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Show in footer</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl bg-stone-50 px-5 py-4">
                    <input
                      type="checkbox"
                      checked={form.showOnHome}
                      onChange={(event) => setField("showOnHome", event.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Show on homepage</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl bg-stone-50 px-5 py-4">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(event) => setField("isPublished", event.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Published</span>
                  </label>
                </div>
              </div>

              <div className="rounded-[2rem] border border-brand-100 bg-brand-50 px-6 py-5">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">Preview path</p>
                <p className="mt-2 text-sm font-bold text-stone-900">{getPolicyPath(form.slug || "your-rule")}</p>
              </div>

              <button disabled={submitting} className="btn-primary w-full py-5 text-xs sm:text-sm">
                {submitting ? "Saving rule..." : isEditing ? "Update Rule" : "Publish Rule"}
              </button>
            </form>
          </section>

          <section className="rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">Rule Library</p>
                <h2 className="mt-2 text-2xl font-black text-stone-900">Published and draft pages</h2>
              </div>
              <span className="rounded-full bg-stone-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-stone-500">
                {policies.length} total
              </span>
            </div>

            <div className="mt-8 space-y-4">
              {loading && (
                <div className="py-16 text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
                  <p className="mt-4 text-sm font-bold text-stone-400">Loading policy pages...</p>
                </div>
              )}

              {!loading && policies.map((policy) => (
                <article
                  key={policy._id}
                  className="rounded-[2rem] border border-stone-100 bg-stone-50/60 p-6 transition-all hover:border-brand-200 hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-stone-900">{policy.title}</p>
                        {policy.isSystem && (
                          <span className="rounded-full bg-brand-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-700">
                            Default
                          </span>
                        )}
                        {!policy.isPublished && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{policy.slug}</p>
                      <p className="mt-4 text-sm font-medium leading-relaxed text-stone-500">
                        {policy.summary || "No summary added yet."}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEditing(policy)} className="btn-secondary px-5 py-3 text-xs">
                        Edit
                      </button>
                      {!policy.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDelete(policy)}
                          className="rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-red-600 transition-colors hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {policy.showInFooter && (
                      <span className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                        Footer
                      </span>
                    )}
                    {policy.showOnHome && (
                      <span className="rounded-full bg-brand-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                        Homepage
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
