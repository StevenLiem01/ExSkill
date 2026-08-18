"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ exchangeId, existingReview }: { exchangeId: string, existingReview?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  if (existingReview) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-sm shadow-sm transition-all">
        <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2 text-base">
          <span>⭐</span> Ulasan berhasil dikirim ({existingReview.rating}/5)
        </h4>
        <p className="text-emerald-700 font-medium italic bg-white p-4 rounded-xl border border-emerald-100 shadow-inner leading-relaxed">
          "{existingReview.comment}"
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchange_id: exchangeId, rating, comment })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal mengirim ulasan");
      }

      alert("Ulasan berhasil dikirim! Terima kasih atas tanggapan Anda.");
      router.refresh();
    } catch (e: any) {
      alert("Terjadi kesalahan: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm transition-all">
      <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3">Berikan Ulasan untuk Partner Anda</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Rating (1-5)
          </label>
          <div className="flex flex-wrap gap-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <label
                key={num}
                className={`flex items-center gap-2 cursor-pointer border px-4 py-2.5 rounded-xl transition-all shadow-sm ${rating === num.toString() ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <input
                  type="radio"
                  name="rating"
                  value={num}
                  checked={rating === num.toString()}
                  onChange={(e) => setRating(e.target.value)}
                  className="accent-amber-500 w-4 h-4 focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                />
                <span className="text-sm font-bold">{num} ⭐</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Komentar & Kesan
          </label>
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm min-h-[120px] resize-y"
            placeholder="Tuliskan pengalaman belajar bersama partner Anda..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-8 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? "Mengirim..." : "Kirim Ulasan"}
        </button>
      </form>
    </div>
  );
}