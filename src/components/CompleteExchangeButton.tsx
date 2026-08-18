"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteExchangeButton({ exchangeId }: { exchangeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!confirm("Apakah Anda yakin ingin menyelesaikan sesi pertukaran ini? (Akan menambahkan +10 Trust Score ke kedua belah pihak)")) return;
    setLoading(true);
    
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" })
      });
      
      if (!res.ok) throw new Error("Gagal menyelesaikan pertukaran");
      
      alert("Pertukaran berhasil diselesaikan! Trust Score Anda meningkat.");
      router.refresh();
    } catch (e: any) {
      alert("Terjadi kesalahan: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleComplete}
      disabled={loading}
      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white py-3 px-6 rounded-xl font-bold shadow-lg shadow-emerald-900/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto"
    >
      <span>✅</span> Tandai Selesai & Klaim Trust Score
    </button>
  );
}
