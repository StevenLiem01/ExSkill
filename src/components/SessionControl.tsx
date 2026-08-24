"use client";
import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";
import { CheckCircle2 } from "lucide-react";

export default function SessionControl({ exchange, currentUser }: { exchange: Prisma.ExchangeGetPayload<{}>, currentUser: Prisma.UserGetPayload<{}> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const status = exchange.session_status;
  const agreedToStart = exchange.agreed_to_start || [];
  const agreedToEnd = exchange.agreed_to_end || [];

  const handleSessionAction = async (action: 'START' | 'END') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exchanges/${exchange.id}/session`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error((err instanceof Error ? err.message : "Unknown error") || "Gagal mengubah status sesi");
      }

      router.refresh();
    } catch (e: unknown) {
      toast.error("Terjadi kesalahan: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (status === "COMPLETED") {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-3 shadow-[0_0_15px_rgba(16,185,129,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none"></div>
        <h3 className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-2 relative z-10">
          <CheckCircle2 size={24} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" /> Sesi Selesai
        </h3>
        <p className="text-sm text-emerald-400/80 font-medium relative z-10">Sesi belajar telah berakhir dan Trust Score kalian telah ditambahkan.</p>
      </div>
    );
  }

  if (status === "IN_PROGRESS") {
    const hasAgreedEnd = agreedToEnd.includes(currentUser.id);

    return (
      <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl text-center space-y-4 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
        <h3 className="text-xl font-bold text-blue-400 flex justify-center items-center gap-2 relative z-10">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          </span>
          Sesi Sedang Berjalan
        </h3>
        <p className="text-sm text-blue-400/80 font-medium relative z-10">Silakan gunakan fitur chat atau aplikasi meeting pihak ketiga untuk sesi belajar Anda.</p>

        <div className="pt-4 border-t border-blue-500/30 relative z-10">
          <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-3">
            Status Persetujuan Akhir: <span className="bg-blue-500/20 border border-blue-500/40 text-blue-300 px-2 py-0.5 rounded ml-1 shadow-sm">{agreedToEnd.length} / 2</span>
          </p>
          <button
            onClick={() => handleSessionAction('END')}
            disabled={loading || hasAgreedEnd}
            className={`w-full min-h-[44px] py-2.5 rounded-xl font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${hasAgreedEnd
              ? 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
              : 'bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 focus:ring-red-500'
              }`}
          >
            {loading ? "Memproses..." : hasAgreedEnd ? "Menunggu Partner Mengakhiri..." : "Setuju Akhiri Sesi"}
          </button>
        </div>
      </div>
    );
  }

  // NOT_STARTED
  const hasAgreedStart = agreedToStart.includes(currentUser.id);

  return (
    <div className="bg-[#1A1528]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-center space-y-4 shadow-[0_0_15px_rgba(168,85,247,0.1)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none"></div>
      <h3 className="text-xl font-bold text-white relative z-10">Menunggu Dimulai</h3>
      <p className="text-sm text-slate-400 font-medium relative z-10">Sesi hanya akan dimulai jika kedua belah pihak menekan tombol setuju di bawah ini.</p>

      <div className="pt-4 border-t border-white/10 relative z-10">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">
          Persetujuan Awal: <span className={`ml-1 px-2 py-0.5 rounded border shadow-sm transition-colors ${agreedToStart.length > 0 ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-white/10 border-white/20 text-slate-300"}`}>{agreedToStart.length} / 2 Setuju</span>
        </p>
        <button
          onClick={() => handleSessionAction('START')}
          disabled={loading || hasAgreedStart}
          className={`w-full min-h-[44px] py-2.5 rounded-xl font-bold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${hasAgreedStart
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 cursor-not-allowed shadow-[0_0_10px_rgba(16,185,129,0.1)]'
            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 focus:ring-purple-500'
            }`}
        >
          {loading ? "Memproses..." : hasAgreedStart ? "Menunggu Partner..." : "Setuju Mulai Sesi"}
        </button>
      </div>
    </div>
  );
}