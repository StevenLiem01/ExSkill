import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Jika TIDAK ADA sesi, tampilkan landing page
  if (!session || !session.user?.email) {
    return (
      <main className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden text-slate-50">
        {/* Dekorasi blur modern ala SaaS (Dark mode) */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00DF9A]/10 rounded-full blur-3xl pointer-events-none transition-all"></div>
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-all"></div>

        <div className="relative z-10 max-w-3xl w-full text-center space-y-10 p-10 md:p-16 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 ease-in-out">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Welcome to <span className="text-[#00DF9A]">ExSkill</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Tukar Keahlian, Perluas Relasi. Platform peer-to-peer eksklusif untuk mahasiswa yang ingin belajar hal baru dan berbagi keahlian secara gratis tanpa hambatan.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Jika ADA sesi, pastikan data lengkap dari database beserta relasi skill-nya
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      owned_skills: { include: { skill: true } },
      wanted_skills: { include: { skill: true } },
    }
  });

  // Jika data profil belum lengkap, paksa redirect ke /onboarding
  if (!dbUser || !dbUser.university || !dbUser.major) {
    redirect("/onboarding");
  }

  // Tampilan Dasbor untuk yang profilnya sudah lengkap
  return (
    <main className="flex-1 bg-slate-900 text-slate-50 p-6 md:p-12 relative overflow-hidden pb-20">
      <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Header Dasbor */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg transition-all duration-200 ease-in-out relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Dashboard
            </h1>
            <p className="text-[#00DF9A] font-medium mt-2 flex items-center gap-2">
              <span className="text-xl">✨</span> Profil Lengkap, Siap Mengeksplorasi!
            </p>
          </div>
        </div>

        {/* Rangkuman Profil */}
        <div className="bg-slate-800/50 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/10 shadow-lg transition-all duration-200 ease-in-out">
          <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4 text-white">Data Profil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Nama Lengkap</p>
              <p className="font-semibold text-white text-lg">{dbUser.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Universitas</p>
              <p className="font-medium text-slate-300">{dbUser.university}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Jurusan</p>
              <p className="font-medium text-slate-300">{dbUser.major}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Trust Score</p>
              <p className="font-semibold text-white flex items-center gap-2 text-lg">
                <span className="text-amber-400">⭐</span> {dbUser.trust_score} <span className="text-slate-400 font-mono text-sm font-medium">pts</span>
              </p>
            </div>
            <div className="space-y-1 md:col-span-2 mt-2">
              <p className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Bio</p>
              <p className="text-slate-300 bg-slate-900/50 p-5 rounded-lg border border-white/5 mt-2 leading-relaxed">
                "{dbUser.bio || "Belum ada bio."}"
              </p>
            </div>
          </div>
          
          <div className="mt-8 border-t border-white/10 pt-6 flex justify-end">
            <Link 
              href="/profile" 
              className="bg-[#00DF9A] hover:bg-[#00C285] text-slate-900 font-bold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Kelola Profil & Keahlian &rarr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}