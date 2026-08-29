"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthProvider from "@/components/AuthProvider";

function OnboardingForm() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Memuat...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  // Jika user sudah onboarding, kembalikan ke dashboard
  if (session?.user?.is_onboarded) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ university, major, bio }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal memperbarui profil");
      }

      // Panggil update session NextAuth agar JWT token di-refresh dengan is_onboarded = true
      await update({ is_onboarded: true });
      
      // Redirect ke dashboard setelah sukses
      router.push("/dashboard");
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-3xl mix-blend-screen"></div>

      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">Lengkapi Profilmu</h1>
          <p className="text-slate-300 text-sm">
            Halo <span className="font-semibold text-white">{session?.user?.name}</span>! Mari lengkapi data dirimu sebelum mulai mengeksplorasi ExSkill.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="university" className="block text-sm font-medium text-slate-300">
              Universitas <span className="text-red-400">*</span>
            </label>
            <input
              id="university"
              type="text"
              required
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Contoh: Universitas Indonesia"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="major" className="block text-sm font-medium text-slate-300">
              Jurusan <span className="text-red-400">*</span>
            </label>
            <input
              id="major"
              type="text"
              required
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Contoh: Ilmu Komputer"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="bio" className="block text-sm font-medium text-slate-300">
              Bio Singkat
            </label>
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="Ceritakan sedikit tentang dirimu..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AuthProvider>
      <OnboardingForm />
    </AuthProvider>
  );
}
