"use client";

import React, { useState, useEffect } from "react";
import SessionManager from "./SessionManager";

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

  useEffect(() => {
    fetchMilestones();
  }, [exchangeId]);

  const fetchMilestones = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/milestones`);
      if (!res.ok) throw new Error("Gagal mengambil data milestone");
      const data = await res.json();
      setMilestones(data);
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
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
    } catch (err: any) {
      console.error(err);
      // Revert if failed
      setMilestones(prev => prev.map(m => 
        m.id === milestoneId ? { ...m, is_completed: currentStatus } : m
      ));
      alert(err.message);
    }
  };

  return (
    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 shadow-lg min-h-[400px] flex flex-col gap-6 relative">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🎯</span> Target Pembelajaran
        </h2>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-[#00DF9A]/10 text-[#00DF9A] border border-[#00DF9A]/30 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#00DF9A]/20 transition-all"
          >
            + Tambah Milestone
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleAddMilestone} className="bg-slate-800/80 p-5 rounded-xl border border-[#00DF9A]/30 shadow-inner space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Judul Milestone</label>
            <input 
              type="text" 
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DF9A]/50 focus:ring-1 focus:ring-[#00DF9A]/50"
              placeholder="Contoh: Menguasai Dasar React"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Deskripsi</label>
            <textarea 
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DF9A]/50 focus:ring-1 focus:ring-[#00DF9A]/50 min-h-[80px]"
              placeholder="Jelaskan secara singkat apa yang akan dicapai..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#00DF9A] text-slate-900 px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#00C285] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Milestone"}
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00DF9A]"></div>
          </div>
        ) : milestones.length === 0 ? (
          !isFormOpen && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-slate-800/30">
              <span className="text-4xl mb-3 opacity-50">🚧</span>
              <p className="text-slate-400 font-medium text-sm">
                Belum ada milestone yang dibuat. <br />
                Diskusikan dengan partner Anda dan mulailah menentukan target pembelajaran.
              </p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {milestones.map((m) => (
              <div 
                key={m.id} 
                className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 ${
                  m.is_completed 
                    ? "bg-slate-800/30 border-white/5 opacity-60" 
                    : "bg-slate-800/80 border-white/10 hover:border-[#00DF9A]/30 shadow-sm"
                }`}
              >
                <div className="mt-1">
                  <input 
                    type="checkbox" 
                    checked={m.is_completed}
                    onChange={() => handleToggleStatus(m.id, m.is_completed)}
                    className="w-5 h-5 rounded border-slate-600 text-[#00DF9A] focus:ring-[#00DF9A]/50 bg-slate-900 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${m.is_completed ? "text-slate-400 line-through" : "text-white"}`}>
                    {m.title}
                  </h3>
                  <p className={`text-sm mt-1 ${m.is_completed ? "text-slate-500" : "text-slate-300"}`}>
                    {m.description}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-3">
                    Ditambahkan: {new Date(m.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tampilkan SessionManager dan teruskan daftar milestones yang berhasil diload */}
      {!isLoading && (
        <SessionManager exchangeId={exchangeId} milestones={milestones} />
      )}
    </div>
  );
}
