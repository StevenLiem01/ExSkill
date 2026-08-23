"use client";
import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProposalActions({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: "ACCEPTED" | "REJECTED") => {
    if (!confirm(`Yakin ingin ${status === "ACCEPTED" ? "menerima" : "menolak"} proposal pertukaran ini?`)) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error("Gagal memperbarui status proposal");

      toast.success(status === "ACCEPTED" ? "Proposal diterima! Exchange berhasil dibuat." : "Proposal berhasil ditolak.");
      router.refresh();
    } catch (e: unknown) {
      toast.error("Terjadi kesalahan: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100">
      <button
        onClick={() => handleAction("ACCEPTED")}
        disabled={loading}
        className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        Terima
      </button>
      <button
        onClick={() => handleAction("REJECTED")}
        disabled={loading}
        className="flex-1 h-11 bg-white hover:bg-red-50 text-red-600 font-semibold border border-red-200 hover:border-red-300 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Tolak
      </button>
    </div>
  );
}