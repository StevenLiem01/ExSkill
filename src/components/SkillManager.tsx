"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Skill = { id: string; name: string; category: string };
type UserSkill = { id: string; skill_id: string; proficiency: string; skill: Skill };
type WantedSkill = { id: string; skill_id: string; skill: Skill };

interface Props {
  catalog: Skill[];
  initialOffered: UserSkill[];
  initialWanted: WantedSkill[];
}

export default function SkillManager({ catalog, initialOffered, initialWanted }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [type, setType] = useState("OFFERED");
  const [proficiency, setProficiency] = useState("BEGINNER");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/users/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill_id: selectedSkillId,
          type,
          ...(type === "OFFERED" ? { proficiency } : {})
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.message || "Gagal menambahkan skill");
      } else {
        setSelectedSkillId("");
        router.refresh();
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (skillId: string, type: "OFFERED" | "WANTED") => {
    if (!confirm("Yakin ingin menghapus skill ini dari profilmu?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/users/skills?skill_id=${skillId}&type=${type}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal menghapus skill");
      }
    } finally {
      setLoading(false);
    }
  };

  const availableSkills = catalog.filter(
    (c) => !initialOffered.find((o) => o.skill_id === c.id) && !initialWanted.find((w) => w.skill_id === c.id)
  );

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 mt-8 space-y-8 shadow-sm transition-all duration-200 ease-in-out">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">Manajemen Keahlian</h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">Tambahkan apa yang kamu kuasai (Offered) dan apa yang ingin kamu pelajari (Wanted).</p>
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-inner">
        <div className="md:col-span-1 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Tipe</label>
          <select
            value={type} onChange={(e) => setType(e.target.value)}
            className="w-full h-11 px-4 bg-slate-800 border border-white/10 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00DF9A] focus:border-[#00DF9A] transition-all duration-200"
          >
            <option value="OFFERED">Ditawarkan</option>
            <option value="WANTED">Dicari</option>
          </select>
        </div>

        <div className="md:col-span-1 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Pilih Skill</label>
          <select
            required
            value={selectedSkillId} onChange={(e) => setSelectedSkillId(e.target.value)}
            className="w-full h-11 px-4 bg-slate-800 border border-white/10 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00DF9A] focus:border-[#00DF9A] transition-all duration-200"
          >
            <option value="" disabled>-- Pilih dari Katalog --</option>
            {availableSkills.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
            ))}
          </select>
        </div>

        {type === "OFFERED" && (
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Kemahiran</label>
            <select
              value={proficiency} onChange={(e) => setProficiency(e.target.value)}
              className="w-full h-11 px-4 bg-slate-800 border border-white/10 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00DF9A] focus:border-[#00DF9A] transition-all duration-200"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        )}

        <div className={`md:col-span-1 ${type === "WANTED" ? "md:col-start-3" : ""}`}>
          <button
            type="submit" disabled={loading || !selectedSkillId}
            className="w-full h-11 px-4 bg-[#00DF9A] hover:bg-[#00C285] text-slate-900 font-bold rounded-xl shadow-sm transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00DF9A] focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {loading ? "Menambahkan..." : "+ Tambah Skill"}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Offered Skills */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-500/30 pb-3">
            <span>✨</span> Keahlian yang Ditawarkan
          </h3>
          <div className="flex flex-wrap gap-3">
            {initialOffered.length === 0 ? (
              <p className="text-slate-500 text-sm">Belum ada skill yang ditawarkan.</p>
            ) : (
              initialOffered.map((o) => (
                <div key={o.id} className="group relative flex items-center gap-2 bg-[#00DF9A]/10 border border-[#00DF9A]/30 px-4 py-2.5 rounded-full text-sm text-[#00DF9A] pr-10 hover:bg-[#00DF9A]/20 transition-all duration-200 ease-in-out cursor-default shadow-sm">
                  <span className="font-semibold">{o.skill.name}</span>
                  <span className="text-[#00DF9A]/70 text-xs font-medium border-l border-[#00DF9A]/30 pl-2">
                    {o.proficiency.charAt(0) + o.proficiency.slice(1).toLowerCase()}
                  </span>
                  <button
                    onClick={() => handleRemove(o.skill_id, "OFFERED")}
                    disabled={loading}
                    aria-label={`Hapus ${o.skill.name}`}
                    className="absolute right-1.5 w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-200 ease-in-out opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                    title="Hapus"
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wanted Skills */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 border-b border-indigo-500/30 pb-3">
            <span>🔍</span> Keahlian yang Dicari
          </h3>
          <div className="flex flex-wrap gap-3">
            {initialWanted.length === 0 ? (
              <p className="text-slate-500 text-sm">Belum ada skill yang dicari.</p>
            ) : (
              initialWanted.map((w) => (
                <div key={w.id} className="group relative flex items-center gap-2 bg-indigo-900/30 border border-indigo-500/30 px-4 py-2.5 rounded-full text-sm text-indigo-300 pr-10 hover:bg-indigo-900/50 transition-all duration-200 ease-in-out cursor-default shadow-sm">
                  <span className="font-semibold">{w.skill.name}</span>
                  <button
                    onClick={() => handleRemove(w.skill_id, "WANTED")}
                    disabled={loading}
                    aria-label={`Hapus ${w.skill.name}`}
                    className="absolute right-1.5 w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-200 ease-in-out opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                    title="Hapus"
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}