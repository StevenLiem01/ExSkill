"use client";
import toast from "react-hot-toast";

import React, { useState, useEffect } from "react";
import SessionManager from "./SessionManager";
import { Prisma } from "@prisma/client";
import { Construction } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  created_at: string;
}

export default function MilestoneManager({ exchangeId }: { exchangeId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exchangeInfo, setExchangeInfo] = useState<Prisma.ExchangeGetPayload<{ include: { participant_a: true, participant_b: true, proposal: { include: { offered_skill: true, requested_skill: true } } } }> | null>(null);

  useEffect(() => {
    fetchMilestones();
    fetchExchangeInfo();
  }, [exchangeId]);

  const fetchExchangeInfo = async () => {
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}`);
      if (res.ok) {
        setExchangeInfo(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editFormTitle, setEditFormTitle] = useState("");
  const [editFormDescription, setEditFormDescription] = useState("");

  const fetchMilestones = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/milestones`);
      if (!res.ok) throw new Error("Gagal mengambil data milestone");
      const data = await res.json();
      setMilestones(data);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formTitle, description: formDescription }),
      });
      
      if (!res.ok) throw new Error("Gagal menambahkan milestone");
      
      const newMilestone = await res.json();
      setMilestones((prev) => [...prev, newMilestone]);
      
      // Reset form
      setFormTitle("");
      setFormDescription("");
      setIsFormOpen(false);
    } catch (err: unknown) {
      console.error(err);
      toast.error((err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (m: Milestone) => {
    setEditingMilestoneId(m.id);
    setEditFormTitle(m.title);
    setEditFormDescription(m.description);
  };

  const handleEditMilestone = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editFormTitle.trim() || !editFormDescription.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/milestones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editFormTitle, description: editFormDescription }),
      });
      
      if (!res.ok) throw new Error("Gagal menyimpan perubahan");
      
      const updatedMilestone = await res.json();
      setMilestones(prev => prev.map(m => m.id === id ? updatedMilestone : m));
      
      setEditingMilestoneId(null);
    } catch (err: unknown) {
      console.error(err);
      toast.error((err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus milestone ini?")) return;

    try {
      const res = await fetch(`/api/milestones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus milestone");
      
      setMilestones(prev => prev.filter(m => m.id !== id));
    } catch (err: unknown) {
      console.error(err);
      toast.error((err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleToggleStatus = async (milestoneId: string, currentStatus: boolean) => {
    // Optimistic update
    setMilestones(prev => prev.map(m => 
      m.id === milestoneId ? { ...m, is_completed: !currentStatus } : m
    ));

    try {
      const res = await fetch(`/api/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !currentStatus }),
      });

      if (!res.ok) {
        throw new Error("Gagal memperbarui status");
      }
    } catch (err: unknown) {
      console.error(err);
      // Revert if failed
      setMilestones(prev => prev.map(m => 
        m.id === milestoneId ? { ...m, is_completed: currentStatus } : m
      ));
      toast.error((err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <div className="w-full bg-[#1A1528]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Background Glow Effect (Subtle) */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <span className="font-mono text-[12px] leading-4 tracking-widest font-medium text-purple-400 uppercase block mb-1">Target Pertukaran</span>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {exchangeInfo ? `${exchangeInfo.proposal.offered_skill.name} & ${exchangeInfo.proposal.requested_skill.name}` : "Memuat..."}
          </h2>
        </div>
        {/* Status Indicator */}
        <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
          <span className="font-mono text-xs font-medium text-purple-400">
            {exchangeInfo?.status === "COMPLETED" ? "Selesai" : "In Progress"}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm relative z-10">
          {error}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleAddMilestone} className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Judul Milestone</label>
            <input 
              type="text" 
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 shadow-inner"
              placeholder="Contoh: Menguasai Dasar React"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Deskripsi</label>
            <textarea 
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 min-h-[80px] shadow-inner"
              placeholder="Jelaskan secara singkat apa yang akan dicapai..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:bg-purple-500 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Milestone"}
            </button>
          </div>
        </form>
      )}

      {/* Checklist Section */}
      <div className="flex flex-col gap-2 relative z-10">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : milestones.length === 0 ? (
          !isFormOpen && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-[rgba(255,255,255,0.03)]">
              <Construction size={40} className="mb-3 opacity-50" />
              <p className="text-slate-400 font-medium text-sm">
                Belum ada milestone yang dibuat. <br />
                Mulai tentukan target pembelajaran Anda.
              </p>
            </div>
          )
        ) : (
          milestones.map((m) => (
            editingMilestoneId === m.id ? (
              <form key={m.id} onSubmit={(e) => handleEditMilestone(e, m.id)} className="bg-white/5 p-5 rounded-xl border border-amber-500/30 shadow-inner space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Judul Milestone</label>
                  <input 
                    type="text" 
                    value={editFormTitle}
                    onChange={(e) => setEditFormTitle(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Deskripsi</label>
                  <textarea 
                    value={editFormDescription}
                    onChange={(e) => setEditFormDescription(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 min-h-[80px]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setEditingMilestoneId(null)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-amber-500 text-slate-900 px-5 py-2 rounded-lg text-sm font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:bg-amber-400 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            ) : (
              <div 
                key={m.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${
                  m.is_completed 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-[rgba(255,255,255,0.03)] border-white/10 hover:bg-white/5'
                }`}
              >
                {/* Status Checkbox/Indicator */}
                <div 
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center relative cursor-pointer ${
                    m.is_completed 
                      ? 'bg-[#D946EF]/20 border-[#D946EF] shadow-[0_0_15px_rgba(0,223,154,0.5)]' 
                      : 'border-purple-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                  }`}
                  onClick={() => handleToggleStatus(m.id, m.is_completed)}
                >
                  {m.is_completed ? (
                    <svg className="w-4 h-4 text-[#D946EF] font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full absolute opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                </div>
                
                {/* Text */}
                <div className="flex-1">
                  <p className={`text-base font-normal ${m.is_completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {m.title}
                  </p>
                </div>
                
                {/* Action Icons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => startEditing(m)} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors" title="Edit Milestone">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDeleteMilestone(m.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Hapus Milestone">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            )
          ))
        )}
      </div>

      {/* Footer: Assignees & Action */}
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs font-medium text-slate-400 mr-2">Assignees:</span>
          <div className="flex -space-x-2">
            {exchangeInfo?.participant_a && (
              <img 
                alt={exchangeInfo.participant_a.name || "Participant A"} 
                className="w-8 h-8 rounded-full border-2 border-[#1A1528] object-cover" 
                src={exchangeInfo.participant_a.image || `https://ui-avatars.com/api/?name=${exchangeInfo.participant_a.name}&background=1A1528&color=fff`} 
              />
            )}
            {exchangeInfo?.participant_b && (
              <img 
                alt={exchangeInfo.participant_b.name || "Participant B"} 
                className="w-8 h-8 rounded-full border-2 border-[#1A1528] object-cover" 
                src={exchangeInfo.participant_b.image || `https://ui-avatars.com/api/?name=${exchangeInfo.participant_b.name}&background=1A1528&color=fff`} 
              />
            )}
          </div>
        </div>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)} 
            className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(139,92,246,0.5)] flex items-center gap-2"
          >
            <span>Details</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        )}
      </div>

      {/* Tampilkan SessionManager dan teruskan daftar milestones yang berhasil diload */}
      {!isLoading && (
        <SessionManager exchangeId={exchangeId} milestones={milestones} />
      )}
    </div>
  );
}
