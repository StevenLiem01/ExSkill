"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import Link from "next/link";

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00DF9A]"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-xl relative z-10">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Pengaturan Profil</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="bg-[#FF5B4F]/10 border border-[#FF5B4F]/30 text-[#FF5B4F] px-4 py-3 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-[#00DF9A]/10 border border-[#00DF9A]/30 text-[#00DF9A] px-4 py-3 rounded-xl text-sm font-medium">
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
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00DF9A] transition-colors"
            placeholder="Ceritakan sedikit tentang dirimu (min 10 karakter)..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="text-lg">🐙</span> URL GitHub
            </label>
            <input
              type="text"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00DF9A] transition-colors"
              placeholder="https://github.com/username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="text-lg">💼</span> URL LinkedIn
            </label>
            <input
              type="text"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00DF9A] transition-colors"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="text-lg">🌍</span> URL Website Pribadi
            </label>
            <input
              type="text"
              name="portfolioUrl"
              value={formData.portfolioUrl}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00DF9A] transition-colors"
              placeholder="https://mywebsite.com"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#00DF9A] hover:bg-[#00C285] text-slate-900 font-bold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
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
      <main className="min-h-screen bg-slate-900 text-slate-50 p-6 md:p-12 relative overflow-hidden pb-20">
        <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[30rem] h-[30rem] bg-[#00DF9A]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 gap-6 shadow-sm">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                ⚙️ <span className="text-[#00DF9A]">Pengaturan</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm font-medium">
                Sesuaikan profil dan tautan portofolio untuk meningkatkan kredibilitasmu.
              </p>
            </div>

            <Link href="/dashboard" className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 ease-in-out border border-white/10 flex items-center">
              &larr; Kembali
            </Link>
          </div>

          <SettingsForm />
        </div>
      </main>
    </AuthProvider>
  );
}
