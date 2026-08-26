"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import Link from "next/link";
import { Code2, Briefcase, Globe, Settings } from "lucide-react";

function SettingsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    bio: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });

  // Fetch current profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            bio: data.bio || "",
            githubUrl: data.githubUrl || "",
            linkedinUrl: data.linkedinUrl || "",
            portfolioUrl: data.portfolioUrl || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
    setSuccessMsg("");
  };

  const isValidUrl = (urlStr: string) => {
    if (!urlStr) return true;
    try {
      new URL(urlStr);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.bio && (formData.bio.length < 10 || formData.bio.length > 200)) {
      setErrorMsg("Bio harus antara 10 - 200 karakter.");
      return;
    }
    if (!isValidUrl(formData.githubUrl) || !isValidUrl(formData.linkedinUrl) || !isValidUrl(formData.portfolioUrl)) {
      setErrorMsg("Format URL tidak valid (harus menyertakan http:// atau https://).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        setErrorMsg(error.message || "Gagal memperbarui profil");
      } else {
        setSuccessMsg("Profil berhasil diperbarui!");
        setTimeout(() => setSuccessMsg(""), 3000);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D946EF]"></div>
      </div>
    );
  }

  return (
    <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-8 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden z-10">
      <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Pengaturan Profil</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="bg-[#FF5B4F]/10 border border-[#FF5B4F]/30 text-[#FF5B4F] px-4 py-3 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-[#D946EF]/10 border border-[#D946EF]/30 text-[#D946EF] px-4 py-3 rounded-xl text-sm font-medium">
            {successMsg}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex justify-between">
            <span>Bio Singkat</span>
            <span className={formData.bio.length > 200 || (formData.bio.length > 0 && formData.bio.length < 10) ? 'text-[#FF5B4F]' : 'text-slate-500'}>
              {formData.bio.length}/200
            </span>
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D946EF] transition-colors"
            placeholder="Ceritakan sedikit tentang dirimu (min 10 karakter)..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Code2 size={18} /> URL GitHub
            </label>
            <input
              type="text"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D946EF] transition-colors"
              placeholder="https://github.com/username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Briefcase size={18} /> URL LinkedIn
            </label>
            <input
              type="text"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D946EF] transition-colors"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Globe size={18} /> URL Website Pribadi
            </label>
            <input
              type="text"
              name="portfolioUrl"
              value={formData.portfolioUrl}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D946EF] transition-colors"
              placeholder="https://mywebsite.com"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#D946EF] hover:bg-[#C026D3] text-slate-900 font-bold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthProvider>
      <main className="min-h-screen bg-[#0B061A] text-slate-50 p-6 md:p-12 relative overflow-hidden pb-20 selection:bg-[#D946EF]/30">
        <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[30rem] h-[30rem] bg-[#D946EF]/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-6 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <Settings size={28} className="text-[#D946EF]" /> <span className="text-[#D946EF]">Pengaturan</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm font-medium">
                Sesuaikan profil dan tautan portofolio untuk meningkatkan kredibilitasmu.
              </p>
            </div>

            <Link href="/dashboard" className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 ease-in-out border border-white/10 flex items-center">
              &larr; Kembali
            </Link>
            </div>
          </div>

          <SettingsForm />
        </div>
      </main>
    </AuthProvider>
  );
}
