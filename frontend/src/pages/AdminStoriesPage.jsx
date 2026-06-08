import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../services/api";

const emptyForm = {
  title: "",
  excerpt: "",
  imageUrl: "",
  ctaLabel: "Read Story",
  ctaUrl: "",
  author: "ORNAQ",
  published: true,
  sortOrder: 0
};

export default function AdminStoriesPage() {
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchStories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/stories/admin");
      setStories(response.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load stories"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
    setError("");
  };

  const editStory = (story) => {
    setEditingId(story._id);
    setForm({
      title: story.title || "",
      excerpt: story.excerpt || "",
      imageUrl: story.imageUrl || "",
      ctaLabel: story.ctaLabel || "Read Story",
      ctaUrl: story.ctaUrl || "",
      author: story.author || "ORNAQ",
      published: Boolean(story.published),
      sortOrder: Number(story.sortOrder || 0)
    });
    setError("");
  };

  const submitStory = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder || 0)
      };

      if (editingId) {
        await api.patch(`/stories/${editingId}`, payload);
      } else {
        await api.post("/stories", payload);
      }

      resetForm();
      fetchStories();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save story"));
    } finally {
      setSaving(false);
    }
  };

  const deleteStory = async (storyId) => {
    if (!window.confirm("Delete this story?")) return;

    try {
      await api.delete(`/stories/${storyId}`);
      fetchStories();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete story"));
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-16">
        <header className="flex flex-col justify-between gap-6 border-b border-stone-100 pb-10 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Storefront Content</p>
            <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-5xl">Trending Stories</h1>
            <p className="mt-4 max-w-2xl text-sm font-medium text-stone-500 sm:text-base">
              Add editorial stories for the homepage. These are separate from products.
            </p>
          </div>
          <button type="button" onClick={resetForm} className="btn-secondary px-8">
            New Story
          </button>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={submitStory} className="h-fit rounded-[2rem] border border-stone-100 bg-white p-6 shadow-xl shadow-stone-100">
            <h2 className="text-xl font-black text-stone-900">{editingId ? "Edit Story" : "Add Story"}</h2>

            <div className="mt-6 space-y-4">
              <input
                required
                className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0"
                placeholder="Story title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
              <textarea
                required
                rows={5}
                className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-medium leading-relaxed border-transparent focus:bg-white focus:border-brand-300 focus:ring-0"
                placeholder="Short story excerpt"
                value={form.excerpt}
                onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
              />
              <input
                className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0"
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0"
                  placeholder="CTA label"
                  value={form.ctaLabel}
                  onChange={(event) => setForm((current) => ({ ...current, ctaLabel: event.target.value }))}
                />
                <input
                  className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0"
                  placeholder="/shop or external URL"
                  value={form.ctaUrl}
                  onChange={(event) => setForm((current) => ({ ...current, ctaUrl: event.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0"
                  placeholder="Author"
                  value={form.author}
                  onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
                />
                <input
                  type="number"
                  className="w-full rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold border-transparent focus:bg-white focus:border-brand-300 focus:ring-0"
                  placeholder="Sort order"
                  value={form.sortOrder}
                  onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
                />
              </div>
              <label className="flex items-center gap-3 rounded-2xl bg-stone-50 px-5 py-4 text-sm font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
                />
                Show on homepage
              </label>
            </div>

            {error && <p className="mt-4 text-sm font-bold text-red-500">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex-1 py-4 disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Update Story" : "Publish Story"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-secondary px-6">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <section className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-[2rem] border border-stone-100 bg-white" />
              ))
            ) : stories.length ? (
              stories.map((story) => (
                <article key={story._id} className="grid gap-5 rounded-[2rem] border border-stone-100 bg-white p-5 shadow-xl shadow-stone-100 sm:grid-cols-[10rem_1fr]">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">
                    {story.imageUrl ? (
                      <img src={story.imageUrl} alt={story.title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${story.published ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                        {story.published ? "Published" : "Hidden"}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Order {story.sortOrder || 0}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-black text-stone-900">{story.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-stone-500">{story.excerpt}</p>
                    <div className="mt-5 flex gap-3">
                      <button type="button" onClick={() => editStory(story)} className="btn-secondary px-5 py-2.5">
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteStory(story._id)} className="rounded-xl bg-red-50 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-red-600">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[2rem] border border-dashed border-stone-200 bg-white px-8 py-16 text-center">
                <p className="text-sm font-bold text-stone-500">No stories yet. Add the first homepage story.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
