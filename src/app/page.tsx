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
    <main className="min-h-screen bg-[#0B061A] text-slate-50 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Dekorasi Latar Belakang (Neon Glow & Glassmorphism) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[10%] right-[-10%] w-[40rem] h-[40rem] bg-[#D946EF]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[50rem] h-[50rem] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Grid Pattern Ornamen */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* HERO SECTION */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-40">
          <div className="max-w-5xl space-y-10 flex flex-col items-center">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Platform Kolaborasi Mahasiswa
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-white drop-shadow-2xl leading-tight">
              Cari Partner Belajar. <br className="hidden md:block"/> Tukar Keahlian. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-[#D946EF] animate-gradient-x">Selesaikan Project Bareng.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Temukan partner belajar, jadwalkan sesi kolaborasi, dan kembangkan portofolio Anda secara nyata.
            </p>
            
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto sm:max-w-none">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard"
                  className="px-8 py-4 rounded-full font-bold text-white bg-purple-600 hover:bg-purple-500 hover:-translate-y-1 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 w-full sm:w-auto text-lg text-center"
                >
                  Buka Dashboard &rarr;
                </Link>
              ) : (
                <div className="w-full sm:w-auto [&>button]:w-full [&>button]:px-8 [&>button]:py-4 [&>button]:text-lg [&>button]:bg-purple-600 [&>button]:hover:bg-purple-500 [&>button]:text-white [&>button]:hover:-translate-y-1 [&>button]:shadow-lg [&>button]:shadow-purple-500/50 [&>button]:hover:shadow-purple-500/80 [&>button]:font-bold [&>button]:rounded-full [&>button]:border-0 [&>button]:transition-all [&>button]:duration-300">
                  <LoginButton text="Mulai Sekarang" />
                </div>
              )}
              
              <Link 
                href="/explore" 
                className="px-8 py-4 rounded-full font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md transition-all duration-300 w-full sm:w-auto text-lg text-center"
              >
                Jelajahi Keahlian
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION (Bento Grid) */}
        <section className="py-24 px-6 relative z-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group shadow-2xl relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl mb-6 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-shadow duration-300 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Koneksi Tepat</h3>
                <p className="text-slate-400 leading-relaxed text-sm flex-1">
                  Sistem pencarian kami mempertemukan keahlian yang Anda butuhkan dengan pengguna yang siap berkolaborasi secara akurat.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-[#D946EF]/50 transition-all duration-300 group shadow-2xl relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D946EF]/10 rounded-bl-full blur-2xl pointer-events-none"></div>
                <div className="w-14 h-14 rounded-2xl bg-[#D946EF]/20 border border-[#D946EF]/30 flex items-center justify-center text-2xl mb-6 group-hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] transition-shadow duration-300 text-[#D946EF] shadow-[0_0_15px_rgba(0,223,154,0.3)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Exchange Room</h3>
                <p className="text-slate-400 leading-relaxed text-sm flex-1">
                  Miliki ruang kolaborasi eksklusif. Atur jadwal pertemuan, buat *milestone*, dan pantau progres belajar bersama partner.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 group shadow-2xl relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl mb-6 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-shadow duration-300 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Trust Score</h3>
                <p className="text-slate-400 leading-relaxed text-sm flex-1">
                  Bangun portofolio dan tingkatkan kredibilitasmu melalui ulasan dan sistem poin berdasar kualitas sesi pertukaran.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-auto border-t border-white/10 bg-[#0B061A]/80 backdrop-blur-lg py-10 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Ex<span className="text-purple-500">Skill</span>
              </span>
              <p className="text-xs text-slate-500">&copy; 2026 ExSkill Platform. All rights reserved.</p>
            </div>
            
            <div className="flex gap-6 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-purple-400 transition-colors">Tentang Kami</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Kontak</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}