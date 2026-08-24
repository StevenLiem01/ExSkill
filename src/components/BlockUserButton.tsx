"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Ban } from "lucide-react";

export default function BlockUserButton({ targetUserId, initialIsBlocked }: { targetUserId: string, initialIsBlocked: boolean }) {
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(initialIsBlocked);
  const router = useRouter();

  const handleToggleBlock = async () => {
    if (!confirm(isBlocked ? "Yakin ingin membuka blokir pengguna ini?" : "Yakin ingin memblokir pengguna ini? Mereka tidak akan bisa melihat profil Anda di Eksplorasi.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${targetUserId}/block`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengubah status blokir");
      }

      const data = await res.json();
      setIsBlocked(data.blocked);
      toast.success(data.message);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBlock}
      disabled={loading}
      className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#1A1528] ${
        isBlocked 
          ? "bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 focus:ring-slate-500"
          : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)] focus:ring-red-500/50"
      }`}
      title={isBlocked ? "Buka Blokir" : "Blokir Pengguna"}
    >
      <Ban size={14} className={isBlocked ? "text-slate-400" : "text-red-400"} />
      {loading ? "Memproses..." : isBlocked ? "Buka Blokir" : "Blokir"}
    </button>
  );
}
