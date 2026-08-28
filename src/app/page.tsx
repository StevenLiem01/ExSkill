import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import HeroSection from "@/components/landing/HeroSection";
import LiveStats from "@/components/landing/LiveStats";
import FeaturesSection from "@/components/landing/FeaturesSection";

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
        
        {/* HERO SECTION (Client Component with Framer Motion) */}
        <HeroSection isLoggedIn={isLoggedIn} />

        {/* LIVE STATS COUNTER */}
        <LiveStats />

        {/* FEATURES SECTION (Bento Grid with Scroll Animations) */}
        <FeaturesSection />

        {/* FOOTER */}
        <footer className="mt-auto border-t border-white/10 bg-[#0B061A]/80 backdrop-blur-lg py-10 px-6 relative z-20">
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