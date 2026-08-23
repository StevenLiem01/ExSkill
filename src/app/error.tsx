"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B061A] p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-[0_0_30px_rgba(239,68,68,0.15)] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-fuchsia-500 to-red-600"></div>
        <h2 className="text-4xl font-black text-white mb-2 drop-shadow-md">
          <span className="text-red-500 text-shadow-glow">SYSTEM</span> ERROR
        </h2>
        <p className="text-slate-400 mb-8 mt-4 font-mono text-sm leading-relaxed">
          Terjadi anomali pada sistem. Sinyal terputus saat mencoba mengakses matriks data.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-6 py-2.5 rounded-full font-semibold transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            Coba Lagi
          </button>
          <Link
            href="/dashboard"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-full font-semibold transition-all"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
