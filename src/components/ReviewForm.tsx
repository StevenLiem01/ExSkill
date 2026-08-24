"use client";
import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";

export default function ReviewForm({ exchangeId, existingReview }: { exchangeId: string, existingReview?: Prisma.ReviewGetPayload<{}> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  if (existingReview) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-sm shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all">
        <h4 className="font-bold text-emerald-400 mb-3 flex items-center gap-2 text-base">
          <span>⭐</span> Ulasan berhasil dikirim ({existingReview.rating}/5)
        </h4>
        <p className="text-emerald-300 font-medium italic bg-black/20 p-4 rounded-xl border border-emerald-500/20 shadow-inner leading-relaxed">
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

      toast.success("Ulasan berhasil dikirim! Terima kasih atas tanggapan Anda.");
      router.refresh();
    } catch (e: unknown) {
      toast.error("Terjadi kesalahan: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1528]/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none"></div>
      <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-3 relative z-10">Berikan Ulasan untuk Partner Anda</h3>
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Rating (1-5)
          </label>
          <div className="flex flex-wrap gap-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <label
                key={num}
                className={`flex items-center gap-2 cursor-pointer border px-4 py-2.5 rounded-xl transition-all shadow-sm ${rating === num.toString() ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-black/40 border-white/10 text-slate-400 hover:bg-white/5'}`}
              >
                <input
                  type="radio"
                  name="rating"
                  value={num}
                  checked={rating === num.toString()}
                  onChange={(e) => setRating(e.target.value)}
                  className="accent-amber-500 w-4 h-4 focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 focus:ring-offset-black/20"
                />
                <span className="text-sm font-bold">{num} ⭐</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Komentar & Kesan
          </label>
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner min-h-[120px] resize-y placeholder:text-slate-500"
            placeholder="Tuliskan pengalaman belajar bersama partner Anda..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] bg-purple-600 hover:bg-purple-500 text-white py-2.5 px-8 rounded-xl font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          {loading ? "Mengirim..." : "Kirim Ulasan"}
        </button>
      </form>
    </div>
  );
}