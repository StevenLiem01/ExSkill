"use client";
import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import { Prisma } from "@prisma/client";
import { Construction, CheckCircle, Clock, Calendar } from "lucide-react";
import { useSFX } from "@/hooks/useSFX";
import CustomSelect from "@/components/ui/CustomSelect";

interface SessionConfirmation {
  id: string;
  user_id: string;
}

interface MeetingSession {
  id: string;
  milestone_id: string;
  title: string;
  scheduled_at: string;
  duration: number;
  meeting_link: string | null;
  status: string;
  confirmations: SessionConfirmation[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  created_at: string;
  sessions?: MeetingSession[];
}

export default function MilestoneManager({ exchangeId, currentUserId }: { exchangeId: string, currentUserId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playClick, playSuccess, playError } = useSFX();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exchangeInfo, setExchangeInfo] = useState<Prisma.ExchangeGetPayload<{ include: { participant_a: true, participant_b: true, proposal: { include: { offered_skill: true, requested_skill: true } } } }> | null>(null);

  // States for scheduling sessions inline
  const [sessionFormOpenId, setSessionFormOpenId] = useState<string | null>(null);
  const [sessionFormDate, setSessionFormDate] = useState("");
  const [sessionFormDuration, setSessionFormDuration] = useState("60");
  const [isScheduling, setIsScheduling] = useState(false);

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
      
      if (!res.ok) {
        playError();
        throw new Error("Gagal menambahkan milestone");
      }
      
      playSuccess();
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
      
      if (!res.ok) {
        playError();
        throw new Error("Gagal menyimpan perubahan");
      }
      
      playSuccess();
      const updatedMilestone = await res.json();
      setMilestones(prev => prev.map(m => m.id === id ? { ...updatedMilestone, sessions: m.sessions } : m));
      
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
    playClick();
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
      
      if (!currentStatus) playSuccess();
    } catch (err: unknown) {
      console.error(err);
      // Revert if failed
      setMilestones(prev => prev.map(m => 
        m.id === milestoneId ? { ...m, is_completed: currentStatus } : m
      ));
      toast.error((err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleScheduleSession = async (e: React.FormEvent, milestoneId: string) => {
    e.preventDefault();
    if (!sessionFormDate || !sessionFormDuration) return;

    setIsScheduling(true);
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/milestones/${milestoneId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: "Sesi Milestone",
          scheduled_at: sessionFormDate,
          duration: sessionFormDuration
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Gagal menjadwalkan sesi");
      }

      const newSession = await res.json();
      newSession.confirmations = [];
      
      setMilestones(prev => prev.map(m => 
        m.id === milestoneId ? { ...m, sessions: [newSession] } : m
      ));
      
      setSessionFormOpenId(null);
      setSessionFormDate("");
    } catch (err: unknown) {
      console.error(err);
      toast.error((err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsScheduling(false);
    }
  };

  const handleConfirmSession = async (milestoneId: string, sessionId: string) => {
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/milestones/${milestoneId}/sessions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          session_id: sessionId,
          action: "CONFIRM"
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Gagal konfirmasi sesi");
      }
      
      toast.success("Sesi berhasil dikonfirmasi!");
      fetchMilestones(); // Refresh the list to reflect status correctly
    } catch (err: unknown) {
      console.error(err);
      toast.error((err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <div className="w-full bg-black border-2 border-cyan-500/50 rounded-none p-6 flex flex-col gap-4 relative overflow-hidden font-mono shadow-[4px_4px_0_rgba(6,182,212,0.3)]">
      {/* Background Glow Effect (Subtle) */}
      <div className="absolute top-0 right-0 w-full h-1 bg-cyan-500/30"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2 relative z-10 border-b-2 border-cyan-500/30 pb-4">
        <div>
          <span className="font-mono text-[12px] leading-4 tracking-widest font-bold text-cyan-400 uppercase block mb-1">
            <span className="text-cyan-500">[{">"}]</span> SYS_TARGETS
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
            {exchangeInfo ? `${exchangeInfo.proposal.offered_skill.name} & ${exchangeInfo.proposal.requested_skill.name}` : "LOADING_DATA..."}
          </h2>
        </div>
        {/* Status Indicator */}
        <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-none border-2 border-cyan-500/50 shadow-[2px_2px_0_rgba(6,182,212,0.3)]">
          <div className="w-2 h-2 rounded-none bg-cyan-400 animate-pulse"></div>
          <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
            {exchangeInfo?.status === "COMPLETED" ? "CLOSED" : "ACTIVE"}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm relative z-10">
          {error}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleAddMilestone} className="bg-cyan-900/10 p-5 rounded-none border-2 border-cyan-500/50 shadow-inner space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono mb-1">MILESTONE_TITLE</label>
            <input 
              type="text" 
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full bg-black border-2 border-cyan-500/50 rounded-none px-4 py-2.5 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]"
              placeholder="INPUT_TITLE..."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono mb-1">DESCRIPTION</label>
            <textarea 
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-black border-2 border-cyan-500/50 rounded-none px-4 py-2.5 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 min-h-[80px] shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]"
              placeholder="INPUT_DESCRIPTION..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => { playClick(); setIsFormOpen(false); }}
              className="px-4 py-2 rounded-none text-sm font-bold tracking-widest uppercase text-slate-400 hover:text-white hover:bg-slate-800 border-2 border-transparent hover:border-slate-600 transition-colors focus:outline-none"
            >
              ABORT
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              onClick={() => playClick()}
              className="bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500 px-5 py-2 rounded-none text-sm font-bold uppercase tracking-widest hover:bg-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-colors disabled:opacity-50 focus:outline-none"
            >
              {isSubmitting ? "PROCESSING..." : "SAVE_MILESTONE"}
            </button>
          </div>
        </form>
      )}

      {/* Checklist Section */}
      <div className="flex flex-col gap-3 relative z-10">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : milestones.length === 0 ? (
          !isFormOpen && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-[rgba(255,255,255,0.03)]">
              <Construction size={40} className="mb-3 opacity-50 text-purple-400" />
              <p className="text-slate-400 font-medium text-sm">
                Belum ada milestone yang dibuat. <br />
                Mulai tentukan target pembelajaran Anda.
              </p>
            </div>
          )
        ) : (
          milestones.map((m) => {
            const hasSession = m.sessions && m.sessions.length > 0;
            const session = hasSession ? m.sessions![0] : null;
            const currentUserConfirmed = session?.confirmations?.some(c => c.user_id === currentUserId) || false;
            const bothConfirmed = session?.status === "COMPLETED";

            return editingMilestoneId === m.id ? (
              <form key={m.id} onSubmit={(e) => handleEditMilestone(e, m.id)} className="bg-amber-900/10 p-5 rounded-none border-2 border-amber-500/50 shadow-inner space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider font-mono mb-1">MILESTONE_TITLE</label>
                  <input 
                    type="text" 
                    value={editFormTitle}
                    onChange={(e) => setEditFormTitle(e.target.value)}
                    className="w-full bg-black border-2 border-amber-500/50 rounded-none px-4 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider font-mono mb-1">DESCRIPTION</label>
                  <textarea 
                    value={editFormDescription}
                    onChange={(e) => setEditFormDescription(e.target.value)}
                    className="w-full bg-black border-2 border-amber-500/50 rounded-none px-4 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-400 min-h-[80px]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setEditingMilestoneId(null)}
                    className="px-4 py-2 rounded-none text-sm font-bold tracking-widest uppercase text-slate-400 hover:text-white hover:bg-slate-800 border-2 border-transparent hover:border-slate-600 transition-colors focus:outline-none"
                  >
                    ABORT
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-amber-500/20 text-amber-300 border-2 border-amber-500 px-5 py-2 rounded-none text-sm font-bold uppercase tracking-widest hover:bg-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-colors disabled:opacity-50 focus:outline-none"
                  >
                    {isSubmitting ? "PROCESSING..." : "UPDATE_RECORD"}
                  </button>
                </div>
              </form>
            ) : (
              <div 
                key={m.id} 
                className={`flex flex-col gap-3 p-4 rounded-none border-2 transition-all group ${
                  m.is_completed || bothConfirmed
                    ? 'bg-emerald-900/10 border-emerald-500/50 shadow-[2px_2px_0_rgba(16,185,129,0.3)]' 
                    : 'bg-black border-cyan-500/30 hover:border-cyan-400 hover:shadow-[2px_2px_0_rgba(6,182,212,0.3)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Checkbox/Indicator */}
                  <div 
                    className={`flex-shrink-0 w-6 h-6 mt-1 rounded-full border-2 flex items-center justify-center relative cursor-pointer ${
                      m.is_completed || bothConfirmed
                        ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                        : 'border-purple-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                    }`}
                    onClick={() => handleToggleStatus(m.id, m.is_completed)}
                  >
                    {(m.is_completed || bothConfirmed) ? (
                      <CheckCircle size={14} className="text-emerald-400" />
                    ) : (
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full absolute opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1">
                    <p className={`text-base font-bold ${m.is_completed || bothConfirmed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                      {m.title}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">{m.description}</p>
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

                {/* Session Integration */}
                <div className="ml-9 mt-2 p-3 bg-black/20 border border-white/5 rounded-xl">
                  {hasSession && session ? (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Clock size={16} className={bothConfirmed ? "text-emerald-400" : "text-purple-400"} />
                        <span>
                          {new Date(session.scheduled_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        <span className="text-slate-500">({session.duration} menit)</span>
                      </div>
                      
                      {!bothConfirmed ? (
                        currentUserConfirmed ? (
                          <button disabled className="bg-white/5 text-slate-400 px-4 py-1.5 rounded-full text-xs font-bold border border-white/10 cursor-not-allowed">
                            Menunggu Konfirmasi Partner
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleConfirmSession(m.id, session.id)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-colors"
                          >
                            Konfirmasi Sesi Selesai
                          </button>
                        )
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle size={14} /> Mutual Confirmed
                        </span>
                      )}
                    </div>
                  ) : (
                    sessionFormOpenId === m.id ? (
                      <form onSubmit={(e) => handleScheduleSession(e, m.id)} className="flex flex-col sm:flex-row gap-2">
                        <input 
                          type="datetime-local" 
                          value={sessionFormDate}
                          onChange={(e) => setSessionFormDate(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                          required
                        />
                        <div className="relative z-30 w-32">
                          <CustomSelect 
                            value={sessionFormDuration}
                            onChange={(val) => setSessionFormDuration(val)}
                            options={[
                              { value: "30", label: "30 Menit" },
                              { value: "60", label: "1 Jam" },
                              { value: "90", label: "1.5 Jam" },
                              { value: "120", label: "2 Jam" }
                            ]}
                            glowVariant="primary"
                            className="w-full text-xs"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setSessionFormOpenId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                          >
                            Batal
                          </button>
                          <button 
                            type="submit"
                            disabled={isScheduling}
                            className="bg-purple-500 hover:bg-purple-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            {isScheduling ? "Menyimpan..." : "Simpan"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button 
                        onClick={() => setSessionFormOpenId(m.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Calendar size={14} /> Jadwalkan Sesi untuk Milestone Ini
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer: Assignees & Action */}
      <div className="mt-4 pt-4 border-t-2 border-cyan-500/30 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs font-bold tracking-widest text-cyan-400 mr-2 uppercase">Assignees:</span>
          <div className="flex -space-x-2">
            {exchangeInfo?.participant_a && (
              <img 
                alt={exchangeInfo.participant_a.name || "Participant A"} 
                className="w-8 h-8 rounded-none border-2 border-cyan-500 object-cover" 
                src={exchangeInfo.participant_a.image || `https://ui-avatars.com/api/?name=${exchangeInfo.participant_a.name}&background=000&color=06b6d4`} 
              />
            )}
            {exchangeInfo?.participant_b && (
              <img 
                alt={exchangeInfo.participant_b.name || "Participant B"} 
                className="w-8 h-8 rounded-none border-2 border-cyan-500 object-cover" 
                src={exchangeInfo.participant_b.image || `https://ui-avatars.com/api/?name=${exchangeInfo.participant_b.name}&background=000&color=06b6d4`} 
              />
            )}
          </div>
        </div>
        {!isFormOpen && (
          <button 
            onClick={() => { playClick(); setIsFormOpen(true); }} 
            className="bg-cyan-500/20 hover:bg-cyan-500/40 border-2 border-cyan-500 text-cyan-300 font-bold uppercase tracking-widest text-sm px-4 py-2 rounded-none transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center gap-2 focus:outline-none"
          >
            <span>ADD_MILESTONE</span>
            <span className="text-cyan-400 font-bold text-lg leading-none">+</span>
          </button>
        )}
      </div>
    </div>
  );
}
