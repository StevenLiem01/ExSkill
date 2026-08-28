"use client";
import toast from "react-hot-toast";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Flag } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

interface ReportModalProps {
  reportedId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ reportedId, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reported_id: reportedId, reason, details }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error((error instanceof Error ? error.message : "Unknown error") || "Gagal mengirim laporan");
      }

      toast.success("Laporan berhasil dikirim ke tim Admin");
      onClose();
      setReason("");
      setDetails("");
    } catch (err: unknown) {
      console.error(err);
      toast.error((err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Flag size={20} className="text-red-500" /> Laporkan Pengguna
            </h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                Alasan Laporan <span className="text-red-400">*</span>
              </label>
              <CustomSelect
                value={reason}
                onChange={(val) => setReason(val)}
                options={[
                  { value: "Spam", label: "Spam / Promosi Ilegal" },
                  { value: "Profil Palsu", label: "Profil Palsu / Penyamaran" },
                  { value: "Pelecehan", label: "Pelecehan / Kata Kasar" },
                  { value: "Penipuan", label: "Penipuan / Scam" },
                  { value: "Lainnya", label: "Lainnya" }
                ]}
                placeholder="Pilih Alasan..."
                glowVariant="accent"
                required={true}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                Detail Tambahan (Opsional)
              </label>
              <textarea 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 min-h-[100px] resize-none"
                placeholder="Ceritakan secara detail apa yang terjadi..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || !reason}
                className="bg-red-500/20 text-red-500 border border-red-500/30 px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
