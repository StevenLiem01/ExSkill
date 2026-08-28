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
      
      {/* Latar Belakang Video (Blackhole) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center bg-[#0B061A]">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="min-w-full min-h-full object-cover opacity-60 mix-blend-screen"
        >
          <source src="/blackhole2.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay agar video menyatu mulus ke bawah (Features Section) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B061A] via-transparent to-transparent"></div>
      </div>
      
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