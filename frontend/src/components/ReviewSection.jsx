import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import SkeletonBlock from "./SkeletonBlock";

const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-2xl transition ${star <= value ? "text-amber-500" : "text-stone-300"}`}
      >
        ★
      </button>
    ))}
  </div>
);

export default function ReviewSection({ productId, ratingSummary }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(ratingSummary);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reviews/${productId}`);
      setReviews(response.data.reviews || []);
      setSummary({
        averageRating: response.data.averageRating,
        totalReviews: response.data.totalReviews
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const myReview = useMemo(
    () => reviews.find((review) => String(review.userId?._id || review.userId) === String(user?.id || user?._id)),
    [reviews, user]
  );

  useEffect(() => {
    if (myReview) {
      setForm({ rating: myReview.rating, title: myReview.title || "", comment: myReview.comment || "" });
    }
  }, [myReview]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let images = myReview?.images || [];
      if (files.length) {
        const data = new FormData();
        files.forEach((file) => data.append("images", file));
        const uploadResponse = await api.post("/uploads/reviews", data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        images = uploadResponse.data;
      }

      await api.post("/reviews", {
        productId,
        rating: form.rating,
        title: form.title,
        comment: form.comment,
        images
      });
      setFiles([]);
      await fetchReviews();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
      <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-700">Ratings and reviews</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">What customers think</h2>
        </div>
        <div className="rounded-[1.5rem] bg-brand-50 px-5 py-4">
          <p className="text-3xl font-semibold text-brand-800">{Number(summary.averageRating || 0).toFixed(1)}</p>
          <p className="text-sm text-stone-600">{summary.totalReviews || 0} review(s)</p>
        </div>
      </div>

      {user ? (
        <form onSubmit={submit} className="mt-6 rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5">
          <p className="font-semibold text-stone-900">{myReview ? "Update your review" : "Write a review"}</p>
          <div className="mt-4">
            <StarPicker value={form.rating} onChange={(rating) => setForm((current) => ({ ...current, rating }))} />
          </div>
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Short headline"
            className="mt-4 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
          />
          <textarea
            rows={4}
            value={form.comment}
            onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
            placeholder="Share details about the fabric, finish, fit, or overall experience."
            className="mt-4 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
          />
          <input type="file" multiple accept="image/*" onChange={(event) => setFiles(Array.from(event.target.files || []))} className="mt-4 block w-full text-sm text-stone-500" />
          <button
            disabled={submitting}
            className="mt-4 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {submitting ? "Saving..." : myReview ? "Update review" : "Submit review"}
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-stone-500">Sign in to rate and review this product.</p>
      )}

      <div className="mt-6 space-y-4">
        {loading && (
          <>
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-24 w-full" />
          </>
        )}
        {!loading && reviews.length === 0 && (
          <div className="rounded-[1.5rem] border border-dashed border-stone-200 px-4 py-8 text-center text-sm text-stone-500">
            No reviews yet. Be the first to rate this saree.
          </div>
        )}
        {!loading &&
          reviews.map((review) => (
            <article key={review._id} className="rounded-[1.5rem] border border-stone-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-stone-900">{review.userId?.name || "Verified customer"}</p>
                    {review.verifiedPurchase && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Verified</span>}
                  </div>
                  <p className="text-xs text-stone-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-sm font-bold text-amber-500">{`${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`}</div>
              </div>
              {review.title && <p className="mt-3 font-semibold text-stone-900">{review.title}</p>}
              <p className="mt-2 text-sm leading-6 text-stone-600">{review.comment || "Rated this product."}</p>
              {review.images?.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {review.images.map((image) => (
                    <img key={image.url} src={image.url} alt={review.title || "Review"} className="h-24 w-full rounded-2xl object-cover" />
                  ))}
                </div>
              )}
            </article>
          ))}
      </div>
    </section>
  );
}
