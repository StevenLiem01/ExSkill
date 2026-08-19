"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface CompleteExchangeButtonProps {
  exchangeId: string;
  isCompleted: boolean;
}

export default function CompleteExchangeButton({ exchangeId, isCompleted }: CompleteExchangeButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isCompleted) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        <span>✨</span> Pertukaran Selesai
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Silakan berikan rating (1-5 bintang).");
      return;
    }
    if (!comment.trim()) {
      setError("Silakan tuliskan ulasan Anda.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menyelesaikan pertukaran");
      }

      setIsModalOpen(false);
      router.refresh(); // Refresh page to update status

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-[#00DF9A] text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(0,223,154,0.3)] hover:shadow-[0_0_30px_rgba(0,223,154,0.5)] hover:scale-105 transition-all"
      >
        Selesaikan Pertukaran 🏆
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            {/* Neon Accent Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-[#00DF9A] blur-xl opacity-50"></div>
            
            <h2 className="text-xl font-bold text-white mb-2">Selesaikan & Ulas</h2>
            <p className="text-sm text-slate-400 mb-6">
              Berikan penilaian jujur atas pengalaman belajar dengan partner Anda.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-3xl focus:outline-none transition-transform hover:scale-110"
                    >
                      <span className={star <= (hoverRating || rating) ? "text-[#00DF9A] drop-shadow-[0_0_8px_rgba(0,223,154,0.6)]" : "text-slate-700"}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                  Ulasan Pembelajaran
                </label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00DF9A]/50 focus:ring-1 focus:ring-[#00DF9A]/50 min-h-[100px] resize-none"
                  placeholder="Bagaimana cara partner menjelaskan materi? Apakah mudah dipahami?"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Ulasan & Selesai"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
