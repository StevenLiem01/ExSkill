"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    bio: user.bio || "",
    githubUrl: user.githubUrl || "",
    linkedinUrl: user.linkedinUrl || "",
    portfolioUrl: user.portfolioUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const isValidUrl = (urlStr: string) => {
    if (!urlStr) return true; // optional
    try {
      new URL(urlStr);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Frontend
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
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        setErrorMsg(error.message || "Gagal memperbarui profil");
      } else {
        setIsModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="font-bold text-white">Profil & Tautan</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs bg-[#00DF9A]/10 text-[#00DF9A] border border-[#00DF9A]/30 px-3 py-1.5 rounded-lg hover:bg-[#00DF9A]/20 transition-colors font-medium"
          >
            ✏️ Edit
          </button>
        </div>

        <div>
          <h3 className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-2">Bio</h3>
          <p className="text-sm text-slate-300 italic">
            {user.bio ? `"${user.bio}"` : "Belum diatur"}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs text-slate-500 uppercase tracking-wider font-mono">Portofolio</h3>
          
          <div className="flex items-center gap-3">
            <span className="text-xl w-6">🐙</span>
            {user.githubUrl ? (
              <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 truncate">
                {user.githubUrl}
              </a>
            ) : (
              <span className="text-sm text-slate-500 italic">Belum diatur</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xl w-6">💼</span>
            {user.linkedinUrl ? (
              <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 truncate">
                {user.linkedinUrl}
              </a>
            ) : (
              <span className="text-sm text-slate-500 italic">Belum diatur</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xl w-6">🌍</span>
            {user.portfolioUrl ? (
              <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 truncate">
                {user.portfolioUrl}
              </a>
            ) : (
              <span className="text-sm text-slate-500 italic">Belum diatur</span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full bg-[#FF5B4F]/10 hover:bg-[#FF5B4F]/20 text-[#FF5B4F] border border-[#FF5B4F]/30 font-bold py-3 px-4 rounded-xl shadow-sm transition-all duration-200"
      >
        Log Out
      </button>

      {/* Modal Edit Profil */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Edit Profil</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {errorMsg && (
                <div className="bg-[#FF5B4F]/10 border border-[#FF5B4F]/30 text-[#FF5B4F] px-4 py-3 rounded-xl text-sm font-medium">
                  {errorMsg}
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
                  rows={3}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00DF9A]"
                  placeholder="Ceritakan sedikit tentang dirimu (min 10 karakter)..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">URL GitHub</label>
                <input
                  type="text"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00DF9A]"
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">URL LinkedIn</label>
                <input
                  type="text"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00DF9A]"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">URL Portofolio Pribadi</label>
                <input
                  type="text"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00DF9A]"
                  placeholder="https://mywebsite.com"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 text-white font-semibold rounded-xl border border-white/10 hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#00DF9A] hover:bg-[#00C285] text-slate-900 font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
