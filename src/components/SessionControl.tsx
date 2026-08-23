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
      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3 shadow-sm">
        <h3 className="text-xl font-bold text-emerald-700 flex items-center justify-center gap-2">
          <CheckCircle2 size={24} className="text-emerald-600" /> Sesi Selesai
        </h3>
        <p className="text-sm text-emerald-600 font-medium">Sesi belajar telah berakhir dan Trust Score kalian telah ditambahkan.</p>
      </div>
    );
  }

  if (status === "IN_PROGRESS") {
    const hasAgreedEnd = agreedToEnd.includes(currentUser.id);

    return (
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-center space-y-4 shadow-sm">
        <h3 className="text-xl font-bold text-blue-700 flex justify-center items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          Sesi Sedang Berjalan
        </h3>
        <p className="text-sm text-blue-800/80 font-medium">Silakan gunakan fitur chat atau aplikasi meeting pihak ketiga untuk sesi belajar Anda.</p>

        <div className="pt-4 border-t border-blue-200/60">
          <p className="text-xs text-blue-600 uppercase tracking-widest font-bold mb-3">
            Status Persetujuan Akhir: <span className="bg-white border border-blue-200 px-2 py-0.5 rounded ml-1 shadow-sm">{agreedToEnd.length} / 2</span>
          </p>
          <button
            onClick={() => handleSessionAction('END')}
            disabled={loading || hasAgreedEnd}
            className={`w-full min-h-[44px] py-2.5 rounded-xl font-semibold transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${hasAgreedEnd
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:shadow-md hover:-translate-y-0.5 focus:ring-red-500'
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
    <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center space-y-4 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900">Menunggu Dimulai</h3>
      <p className="text-sm text-slate-500 font-medium">Sesi hanya akan dimulai jika kedua belah pihak menekan tombol setuju di bawah ini.</p>

      <div className="pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">
          Persetujuan Awal: <span className={`ml-1 px-2 py-0.5 rounded border shadow-sm ${agreedToStart.length > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-700"}`}>{agreedToStart.length} / 2 Setuju</span>
        </p>
        <button
          onClick={() => handleSessionAction('START')}
          disabled={loading || hasAgreedStart}
          className={`w-full min-h-[44px] py-2.5 rounded-xl font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${hasAgreedStart
            ? 'bg-emerald-50 text-emerald-500 border border-emerald-200 cursor-not-allowed shadow-sm'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-blue-500'
            }`}
        >
          {loading ? "Memproses..." : hasAgreedStart ? "Menunggu Partner..." : "Setuju Mulai Sesi"}
        </button>
      </div>
    </div>
  );
}