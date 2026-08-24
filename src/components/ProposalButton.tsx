"use client";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface Skill {
  id: string;
  name: string;
}

interface Props {
  receiverId: string;
  receiverName: string;
  partnerSkills: Skill[]; // Skill yang ditawarkan partner (kita minta ini)
  mySkills: Skill[];      // Skill yang kita tawarkan (partner minta ini)
}

export default function ProposalButton({ receiverId, receiverName, partnerSkills, mySkills }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [requestedSkillId, setRequestedSkillId] = useState("");
  const [offeredSkillId, setOfferedSkillId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedSkillId || !offeredSkillId) {
      setError("Silakan pilih keahlian yang ditawarkan dan diminta.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: receiverId,
          requested_skill_id: requestedSkillId, // Skill partner yang kita inginkan
          offered_skill_id: offeredSkillId,     // Skill kita yang ditawarkan ke partner
          message
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengajukan proposal");
      }

      setIsOpen(false);
      toast.success("Proposal berhasil dikirim!");
      router.refresh();
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-6"
      >
        Ajukan Pertukaran
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
          <div className="bg-[#1A1528] border border-purple-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_30px_rgba(168,85,247,0.2)] relative transform transition-all">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Tutup"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Ajukan Pertukaran</h2>
            <p className="text-sm text-slate-400 font-medium mb-6">Kepada <span className="text-purple-400 font-semibold">{receiverName}</span></p>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saya ingin belajar dari {receiverName}:</label>
                <select
                  required
                  value={requestedSkillId} onChange={(e) => setRequestedSkillId(e.target.value)}
                  className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner"
                >
                  <option value="" disabled className="text-slate-500">Pilih keahlian partner</option>
                  {partnerSkills.map(s => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sebagai gantinya, saya mengajarkan:</label>
                <select
                  required
                  value={offeredSkillId} onChange={(e) => setOfferedSkillId(e.target.value)}
                  className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner"
                >
                  <option value="" disabled className="text-slate-500">Pilih keahlianmu</option>
                  {mySkills.length === 0 && <option value="" disabled>Kamu belum menambahkan Offered Skills!</option>}
                  {mySkills.map(s => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pesan Perkenalan</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Halo, aku tertarik untuk belajar desain darimu..."
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all shadow-inner min-h-[80px]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-11 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || mySkills.length === 0}
                  className="flex-1 h-11 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  {loading ? "Mengirim..." : "Kirim Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}