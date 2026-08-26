"use client";
import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSFX } from "@/hooks/useSFX";

export default function ProposalActions({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { playClick, playSuccess, playError } = useSFX();

  const handleAction = async (status: "ACCEPTED" | "REJECTED") => {
    if (!confirm(`Yakin ingin ${status === "ACCEPTED" ? "menerima" : "menolak"} proposal pertukaran ini?`)) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        playError();
        throw new Error("Gagal memperbarui status proposal");
      }

      if (status === "ACCEPTED") playSuccess();
      toast.success(status === "ACCEPTED" ? "Proposal diterima! Exchange berhasil dibuat." : "Proposal berhasil ditolak.");
      router.refresh();
    } catch (e: unknown) {
      toast.error("Terjadi kesalahan: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 mt-2 pt-4 border-t border-white/10 relative z-20">
      <button
        onClick={() => { playClick(); handleAction("ACCEPTED"); }}
        disabled={loading}
        className="flex-1 h-12 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold tracking-widest uppercase text-sm border-2 border-emerald-500/50 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
      >
        <span className="relative z-10 group-hover:animate-pulse">Terima</span>
      </button>
      <button
        onClick={() => { playClick(); handleAction("REJECTED"); }}
        disabled={loading}
        className="flex-1 h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold tracking-widest uppercase text-sm border-2 border-red-500/50 hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
      >
        <span className="relative z-10 group-hover:animate-pulse">Tolak</span>
      </button>
    </div>
  );
}