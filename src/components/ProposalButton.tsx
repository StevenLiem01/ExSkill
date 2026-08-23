"use client";
import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative transform transition-all">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              aria-label="Tutup"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Ajukan Pertukaran</h2>
            <p className="text-sm text-slate-500 font-medium mb-6">Kepada <span className="text-blue-600 font-semibold">{receiverName}</span></p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saya ingin belajar dari {receiverName}:</label>
                <select
                  required
                  value={requestedSkillId} onChange={(e) => setRequestedSkillId(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                >
                  <option value="" disabled>Pilih keahlian partner</option>
                  {partnerSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sebagai gantinya, saya mengajarkan:</label>
                <select
                  required
                  value={offeredSkillId} onChange={(e) => setOfferedSkillId(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                >
                  <option value="" disabled>Pilih keahlianmu</option>
                  {mySkills.length === 0 && <option value="" disabled>Kamu belum menambahkan Offered Skills!</option>}
                  {mySkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pesan Perkenalan</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Halo, aku tertarik untuk belajar desain darimu..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all shadow-sm min-h-[80px]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-11 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || mySkills.length === 0}
                  className="flex-1 h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading ? "Mengirim..." : "Kirim Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}