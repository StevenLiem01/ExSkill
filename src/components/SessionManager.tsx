"use client";

import React, { useState, useEffect } from "react";

interface Milestone {
  id: string;
  title: string;
}

interface MeetingSession {
  id: string;
  title: string;
  milestone_id: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  milestone: {
    title: string;
  };
}

interface SessionManagerProps {
  exchangeId: string;
  milestones: Milestone[];
}

export default function SessionManager({ exchangeId, milestones }: SessionManagerProps) {
  const [sessions, setSessions] = useState<MeetingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formMilestoneId, setFormMilestoneId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formLink, setFormLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [exchangeId]);

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editFormTitle, setEditFormTitle] = useState("");
  const [editFormMilestoneId, setEditFormMilestoneId] = useState("");
  const [editFormDate, setEditFormDate] = useState("");
  const [editFormLink, setEditFormLink] = useState("");

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/sessions`);
      if (!res.ok) throw new Error("Gagal mengambil data jadwal pertemuan");
      const data = await res.json();
      setSessions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMilestoneId || !formDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          milestoneId: formMilestoneId,
          scheduledAt: formDate,
          meetingLink: formLink
        }),
      });
      
      if (!res.ok) throw new Error("Gagal menambahkan jadwal pertemuan");
      
      const newSession = await res.json();
      // Ensure milestone object exists in the new session data for rendering
      const milestone = milestones.find(m => m.id === newSession.milestone_id);
      if (milestone) newSession.milestone = { title: milestone.title };
      
      setSessions((prev) => [...prev, newSession].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()));
      
      // Reset form
      setFormTitle("");
      setFormMilestoneId("");
      setFormDate("");
      setFormLink("");
      setIsFormOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (s: MeetingSession) => {
    setEditingSessionId(s.id);
    setEditFormTitle(s.title);
    setEditFormMilestoneId(s.milestone_id);
    setEditFormDate(new Date(s.scheduled_at).toISOString().slice(0, 16));
    setEditFormLink(s.meeting_link || "");
  };

  const handleEditSession = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editFormTitle.trim() || !editFormDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: editFormTitle, 
          scheduled_at: editFormDate,
          meeting_link: editFormLink
        }),
      });
      
      if (!res.ok) throw new Error("Gagal menyimpan perubahan");
      
      const updatedSession = await res.json();
      // Keep milestone data for rendering
      const milestone = milestones.find(m => m.id === updatedSession.milestone_id);
      if (milestone) updatedSession.milestone = { title: milestone.title };

      setSessions(prev => prev.map(s => s.id === id ? updatedSession : s).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()));
      
      setEditingSessionId(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jadwal pertemuan ini?")) return;

    try {
      const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus jadwal");
      
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "COMPLETED":
        return <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[10px] uppercase font-bold">Selesai</span>;
      case "CANCELLED":
        return <span className="bg-red-900/30 text-red-400 border border-red-500/30 px-2 py-1 rounded text-[10px] uppercase font-bold">Batal</span>;
      default:
        return <span className="bg-indigo-900/30 text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded text-[10px] uppercase font-bold">Terjadwal</span>;
    }
  };

  return (
    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 shadow-lg mt-6 flex flex-col gap-6 relative">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📅</span> Jadwal Pertemuan
        </h2>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-500/20 transition-all"
            disabled={milestones.length === 0}
            title={milestones.length === 0 ? "Buat milestone terlebih dahulu" : "Tambah Jadwal Baru"}
          >
            + Jadwal Baru
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleAddSession} className="bg-slate-800/80 p-5 rounded-xl border border-indigo-500/30 shadow-inner space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Judul Sesi</label>
              <input 
                type="text" 
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                placeholder="Contoh: Sesi 1 - Pengenalan"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Terkait Milestone</label>
              <select 
                value={formMilestoneId}
                onChange={(e) => setFormMilestoneId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                required
              >
                <option value="" disabled>Pilih Milestone...</option>
                {milestones.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Tanggal & Waktu</label>
              <input 
                type="datetime-local" 
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Tautan Meeting / Catatan</label>
              <input 
                type="text" 
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                placeholder="https://meet.google.com/..."
              />
            </div>
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
              className="bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          </div>
        ) : sessions.length === 0 ? (
          !isFormOpen && (
            <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-xl bg-slate-800/30">
              <span className="text-3xl mb-2 opacity-50">📆</span>
              <p className="text-slate-400 font-medium text-sm">
                Belum ada jadwal pertemuan.
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((s) => (
              editingSessionId === s.id ? (
                <form key={s.id} onSubmit={(e) => handleEditSession(e, s.id)} className="bg-slate-800/80 p-5 rounded-xl border border-amber-500/30 shadow-inner space-y-4 col-span-1 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Judul Sesi</label>
                      <input 
                        type="text" 
                        value={editFormTitle}
                        onChange={(e) => setEditFormTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Tanggal & Waktu</label>
                      <input 
                        type="datetime-local" 
                        value={editFormDate}
                        onChange={(e) => setEditFormDate(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Tautan Meeting / Catatan</label>
                    <input 
                      type="text" 
                      value={editFormLink}
                      onChange={(e) => setEditFormLink(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setEditingSessionId(null)}
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
                  key={s.id} 
                  className="p-5 rounded-xl bg-slate-800/80 border border-white/10 shadow-sm flex flex-col gap-3 relative group hover:border-indigo-500/30 transition-all"
                >
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(s.status)}
                  </div>
                  
                  <div className="flex justify-between items-start pr-16">
                    <div>
                      <h3 className="font-bold text-white pr-2">{s.title}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-1 border border-white/10 bg-white/5 inline-block px-2 py-0.5 rounded">
                        🎯 {s.milestone?.title || "Milestone Dihapus"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(s)} className="text-slate-400 hover:text-amber-400 transition-colors" title="Edit Jadwal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteSession(s.id)} className="text-slate-400 hover:text-red-400 transition-colors" title="Hapus Jadwal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm mt-1 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span>🕒</span>
                      <span className="font-medium">
                        {new Date(s.scheduled_at).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>
                    {s.meeting_link && (
                      <div className="flex items-start gap-2 text-slate-300">
                        <span>🔗</span>
                        <a href={s.meeting_link.startsWith('http') ? s.meeting_link : `https://${s.meeting_link}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium truncate max-w-[200px]" title={s.meeting_link}>
                          {s.meeting_link}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
