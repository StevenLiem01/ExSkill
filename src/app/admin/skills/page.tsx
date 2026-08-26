"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import Link from "next/link";
import { Crown, ArrowLeft, Search, Plus, Power, PowerOff } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

function AdminSkills() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [processingId, setProcessingId] = useState<string | null>(null);

  // New Skill Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Programming");

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchSkills();
    }
  }, [status, session, router]);

  const fetchSkills = () => {
    setLoading(true);
    fetch("/api/admin/skills")
      .then(res => {
        if (!res.ok) throw new Error("Gagal mengambil data keahlian");
        return res.json();
      })
      .then(data => {
        setSkills(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleToggleStatus = async (skill: Skill) => {
    const newStatus = !skill.is_active;
    const actionText = newStatus ? "Mengaktifkan" : "Menonaktifkan";
    
    if (!confirm(`Apakah Anda yakin ingin ${actionText} keahlian "${skill.name}"?`)) return;

    setProcessingId(skill.id);
    try {
      const res = await fetch(`/api/admin/skills/${skill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengubah status");
      }

      // Update local state directly for faster UI response
      setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, is_active: newStatus } : s));
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, category: newCategory })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menambahkan keahlian");
      }

      alert("Keahlian berhasil ditambahkan!");
      setNewName("");
      setShowAddForm(false);
      fetchSkills();
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0B061A] text-white p-6 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-slate-400">Memuat Master Keahlian...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B061A] text-white p-6 md:p-12 relative overflow-hidden selection:bg-emerald-500/30">
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 p-6 rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
              <ArrowLeft size={20} className="text-slate-300" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Crown size={28} className="text-emerald-400" /> Master Keahlian
              </h1>
              <p className="text-sm text-slate-400 mt-1">Kelola data referensi keahlian yang dapat dipilih oleh pengguna.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
          >
            <Plus size={18} /> Tambah Keahlian
          </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="bg-transparent backdrop-blur-3xl p-6 rounded-3xl border-t border-l border-emerald-500/30 border-b-0 border-r-0 shadow-[0_0_30px_rgba(16,185,129,0.05)] animate-fade-in-down relative overflow-hidden">
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-4">Tambah Keahlian Baru</h2>
            <form onSubmit={handleAddSkill} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:flex-1">
                <label className="block text-xs font-bold text-slate-400 mb-1">Nama Keahlian</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: React.js"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="w-full md:flex-1">
                <label className="block text-xs font-bold text-slate-400 mb-1">Kategori</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Language">Language</option>
                  <option value="Business">Business</option>
                  <option value="Music">Music</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" className="w-full md:w-auto bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors">
                Simpan
              </button>
            </form>
            </div>
          </div>
        )}

        <div className="bg-transparent backdrop-blur-3xl p-6 rounded-3xl border-t border-l border-white/10 border-b-0 border-r-0 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="relative z-10">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari keahlian berdasarkan nama atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-4">Nama Keahlian</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSkills.map(skill => (
                  <tr key={skill.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-4 font-medium text-white">{skill.name}</td>
                    <td className="py-4 text-slate-300">
                      <span className="bg-slate-700/50 text-xs px-3 py-1 rounded-full border border-white/5">
                        {skill.category}
                      </span>
                    </td>
                    <td className="py-4">
                      {skill.is_active ? (
                        <span className="text-emerald-400 bg-emerald-400/10 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Aktif
                        </span>
                      ) : (
                        <span className="text-red-400 bg-red-400/10 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                          <span className="w-2 h-2 rounded-full bg-red-400"></span> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <button 
                        onClick={() => handleToggleStatus(skill)}
                        disabled={processingId === skill.id}
                        className={`p-2 rounded-lg transition-colors border flex ml-auto ${
                          skill.is_active 
                            ? "border-red-500/30 text-red-400 hover:bg-red-500/20" 
                            : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        } disabled:opacity-50`}
                        title={skill.is_active ? "Nonaktifkan (Disable)" : "Aktifkan"}
                      >
                        {skill.is_active ? <PowerOff size={18} /> : <Power size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSkills.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      Tidak ada keahlian yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminSkillsPage() {
  return (
    <AuthProvider>
      <AdminSkills />
    </AuthProvider>
  );
}
