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
    } catch (err: any) {
      console.error(err);
      alert(err.message);
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
    } catch (err: any) {
      console.error(err);
      alert(err.message);
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
              editingMilestoneId === m.id ? (
                <form key={m.id} onSubmit={(e) => handleEditMilestone(e, m.id)} className="bg-slate-800/80 p-5 rounded-xl border border-amber-500/30 shadow-inner space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Judul Milestone</label>
                    <input 
                      type="text" 
                      value={editFormTitle}
                      onChange={(e) => setEditFormTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Deskripsi</label>
                    <textarea 
                      value={editFormDescription}
                      onChange={(e) => setEditFormDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 min-h-[80px]"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setEditingMilestoneId(null)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-amber-500 text-slate-900 px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-amber-400 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              ) : (
                <div 
                  key={m.id} 
                  className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 group ${
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
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold ${m.is_completed ? "text-slate-400 line-through" : "text-white"}`}>
                        {m.title}
                      </h3>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditing(m)} className="text-slate-400 hover:text-amber-400 transition-colors" title="Edit Milestone">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteMilestone(m.id)} className="text-slate-400 hover:text-red-400 transition-colors" title="Hapus Milestone">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm mt-1 pr-10 ${m.is_completed ? "text-slate-500" : "text-slate-300"}`}>
                      {m.description}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-3">
                      Ditambahkan: {new Date(m.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              )
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
