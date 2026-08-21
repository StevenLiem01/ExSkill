import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import LoginButton from "@/components/LoginButton";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // Jika profil belum lengkap, ke onboarding
  if (session && session.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (dbUser && (!dbUser.university || !dbUser.major)) {
      redirect("/onboarding");
    }
  }

  const isLoggedIn = !!session;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-50 relative overflow-hidden font-sans">
      
      {/* Dekorasi Latar Belakang (Glassmorphism & Cyber Mint/Indigo) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-[#00DF9A]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50rem] h-[50rem] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Grid Pattern Ornamen */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* HERO SECTION */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32">
          <div className="max-w-4xl space-y-8">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[#00DF9A]/30 bg-[#00DF9A]/10 text-[#00DF9A] text-sm font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,223,154,0.15)]">
              🚀 Platform Pertukaran Skill No.1 untuk Mahasiswa
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg leading-tight">
              Tukar Keahlianmu,<br className="hidden md:block"/> Tingkatkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00DF9A] to-indigo-400">Potensimu</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Platform peer-to-peer eksklusif untuk mahasiswa yang ingin belajar hal baru dan berbagi keahlian secara gratis tanpa hambatan. Perluas relasimu sekarang.
            </p>
            
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard"
                  className="px-8 py-4 rounded-xl font-extrabold text-slate-900 bg-[#00DF9A] hover:bg-[#00C285] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,223,154,0.3)] transition-all duration-300 w-full sm:w-auto text-lg text-center"
                >
                  Masuk ke Dashboard &rarr;
                </Link>
              ) : (
                <div className="w-full sm:w-auto [&>button]:w-full [&>button]:px-8 [&>button]:py-4 [&>button]:text-lg [&>button]:bg-[#00DF9A] [&>button]:hover:bg-[#00C285] [&>button]:text-slate-900 [&>button]:hover:scale-105 [&>button]:hover:shadow-[0_0_30px_rgba(0,223,154,0.3)] [&>button]:font-extrabold [&>button]:rounded-xl [&>button]:border-0">
                  <LoginButton text="Mulai Sekarang (Gratis)" />
                </div>
              )}
              
              <Link 
                href="/explore" 
                className="px-8 py-4 rounded-xl font-bold text-white bg-slate-800 border border-white/10 hover:bg-slate-700 hover:border-white/30 transition-all duration-300 w-full sm:w-auto text-lg text-center"
              >
                Eksplorasi Keahlian
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 px-6 bg-slate-900/50 backdrop-blur-md border-t border-white/5 relative z-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Mengapa Memilih <span className="text-[#00DF9A]">ExSkill</span>?
              </h2>
              <p className="text-slate-400 font-medium max-w-xl mx-auto">
                Kami merancang ekosistem belajar yang berfokus pada kolaborasi nyata antar-mahasiswa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:-translate-y-2 hover:border-[#00DF9A]/50 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  🧠
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Smart Match Algorithm</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Tidak perlu mencari manual. Algoritma kami mencocokkan keahlian yang ingin Anda pelajari dengan pengguna yang tepat menawarkan hal tersebut.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:-translate-y-2 hover:border-[#00DF9A]/50 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-[#00DF9A]/10 border border-[#00DF9A]/20 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  🎓
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Ruang Belajar Terintegrasi</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Kelola sesi belajar Anda dengan mudah. Buat target (Milestone) dan jadwalkan sesi (Meeting) tanpa perlu keluar dari platform.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:-translate-y-2 hover:border-[#00DF9A]/50 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  🌟
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Sistem Reputasi (Trust Score)</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Bangun portofolio dan kredibilitasmu! Kumpulkan Trust Score berdasarkan ulasan jujur setelah berhasil menuntaskan pertukaran keahlian.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-auto border-t border-white/10 bg-slate-900 py-10 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Ex<span className="text-[#00DF9A]">Skill</span>
              </span>
              <p className="text-xs text-slate-500">&copy; 2026 ExSkill Platform. All rights reserved.</p>
            </div>
            
            <div className="flex gap-6 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Tentang Kami</a>
              <a href="#" className="hover:text-white transition-colors">Kontak</a>
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}