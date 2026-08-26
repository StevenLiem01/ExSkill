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
      <div className="bg-black border-2 border-emerald-500/50 p-6 rounded-none text-center space-y-3 relative overflow-hidden font-mono shadow-[4px_4px_0_rgba(16,185,129,0.3)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/30"></div>
        <h3 className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-2 relative z-10 uppercase tracking-widest">
          <span className="text-emerald-500">[{">"}]</span> SYS_STATUS: COMPLETED
        </h3>
        <p className="text-sm text-emerald-400/80 font-medium relative z-10">Sesi belajar telah berakhir dan Trust Score kalian telah ditambahkan.</p>
      </div>
    );
  }

  if (status === "IN_PROGRESS") {
    const hasAgreedEnd = agreedToEnd.includes(currentUser.id);

    return (
      <div className="bg-black border-2 border-cyan-500/50 p-6 rounded-none text-center space-y-4 relative overflow-hidden font-mono shadow-[4px_4px_0_rgba(6,182,212,0.3)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/30"></div>
        <h3 className="text-xl font-bold text-cyan-400 flex justify-center items-center gap-2 relative z-10 uppercase tracking-widest">
          <span className="text-cyan-500 animate-pulse">_</span> SYS_STATUS: ACTIVE
        </h3>
        <p className="text-sm text-cyan-400/80 font-medium relative z-10">Silakan gunakan fitur chat atau aplikasi meeting pihak ketiga untuk sesi belajar Anda.</p>

        <div className="pt-4 border-t border-cyan-500/30 relative z-10">
          <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold mb-3">
            TERMS_END: <span className="bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-none ml-1">{agreedToEnd.length}/2</span>
          </p>
          <button
            onClick={() => handleSessionAction('END')}
            disabled={loading || hasAgreedEnd}
            className={`w-full min-h-[44px] py-2.5 rounded-none font-bold tracking-widest uppercase transition-all duration-200 ease-in-out focus:outline-none ${hasAgreedEnd
              ? 'bg-transparent text-slate-500 border-2 border-slate-700 cursor-not-allowed'
              : 'bg-red-500/10 border-2 border-red-500/80 text-red-400 hover:bg-red-500/30 hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              }`}
          >
            {loading ? "PROCESSING..." : hasAgreedEnd ? "AWAITING_PARTNER..." : "EXEC_TERMINATE()"}
          </button>
        </div>
      </div>
    );
  }

  // NOT_STARTED
  const hasAgreedStart = agreedToStart.includes(currentUser.id);

  return (
    <div className="bg-black border-2 border-purple-500/50 p-6 rounded-none text-center space-y-4 relative overflow-hidden font-mono shadow-[4px_4px_0_rgba(168,85,247,0.3)]">
      <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/30"></div>
      <h3 className="text-xl font-bold text-purple-400 relative z-10 uppercase tracking-widest flex items-center justify-center gap-2">
        <span className="text-purple-500">[{">"}]</span> SYS_STATUS: PENDING
      </h3>
      <p className="text-sm text-purple-400/80 font-medium relative z-10">Sesi hanya akan dimulai jika kedua belah pihak menekan tombol setuju di bawah ini.</p>

      <div className="pt-4 border-t border-purple-500/30 relative z-10">
        <p className="text-xs text-purple-400 uppercase tracking-widest font-bold mb-3">
          TERMS_START: <span className={`ml-1 px-2 py-0.5 rounded-none border-2 transition-colors ${agreedToStart.length > 0 ? "bg-emerald-900/50 border-emerald-500/80 text-emerald-400" : "bg-transparent border-purple-500/40 text-purple-300"}`}>{agreedToStart.length}/2</span>
        </p>
        <button
          onClick={() => handleSessionAction('START')}
          disabled={loading || hasAgreedStart}
          className={`w-full min-h-[44px] py-2.5 rounded-none font-bold tracking-widest uppercase transition-all duration-200 ease-in-out focus:outline-none ${hasAgreedStart
            ? 'bg-transparent text-emerald-500 border-2 border-emerald-500/50 cursor-not-allowed shadow-[0_0_10px_rgba(16,185,129,0.1)]'
            : 'bg-purple-500/10 border-2 border-purple-500 text-purple-400 hover:bg-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]'
            }`}
        >
          {loading ? "PROCESSING..." : hasAgreedStart ? "AWAITING_PARTNER..." : "EXEC_START()"}
        </button>
      </div>
    </div>
  );
}