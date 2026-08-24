"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";

export default function DisputeButton({ exchangeId }: { exchangeId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !description) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/disputes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, description })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal membuka sengketa");
      }

      toast.success("Sengketa berhasil dibuka. Admin akan segera meninjau.");
      setIsOpen(false);
      setReason("");
      setDescription("");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div className="bg-[#1A0B1A] border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(239,68,68,0.2)] relative transform transition-all overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>
        
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors focus:outline-none z-10"
        >
          <X size={18} />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
              <AlertTriangle size={24} className="text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
            </div>
            <h2 className="text-xl font-bold text-white">Buka Sengketa</h2>
          </div>
          <p className="text-sm text-slate-400 font-medium mb-6 mt-2 leading-relaxed">
            Laporkan masalah jika terjadi kecurangan atau konflik dalam pertukaran ini. Admin akan segera meninjau laporan Anda.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alasan Sengketa</label>
              <select
                required
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all shadow-inner"
              >
                <option value="" disabled className="text-slate-500">Pilih alasan...</option>
                <option value="UNRESPONSIVE" className="text-slate-900">Partner tidak responsif</option>
                <option value="INAPPROPRIATE" className="text-slate-900">Perilaku tidak pantas</option>
                <option value="SCAM" className="text-slate-900">Indikasi penipuan / spam</option>
                <option value="OTHER" className="text-slate-900">Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi Masalah</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan detail masalah yang terjadi..."
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none transition-all shadow-inner placeholder:text-slate-500"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 h-11 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !reason || !description}
                className="flex-1 h-11 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                {loading ? "Memproses..." : "Kirim Laporan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold text-sm transition-all shadow-[0_0_10px_rgba(239,68,68,0.15)] focus:outline-none focus:ring-2 focus:ring-red-500/50"
        title="Buka Sengketa"
      >
        <AlertTriangle size={16} /> Buka Sengketa
      </button>

      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}
