"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, Inbox, ArrowRightLeft, User, Settings, Home, Volume2, VolumeX } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useSFX } from "@/hooks/useSFX";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FloatingDock({ session }: { session: any }) {
  const pathname = usePathname();
  const { playHover, playClick, isMuted, toggleMute } = useSFX();

  // Hide on onboarding
  if (pathname === "/onboarding") return null;

  const navItems = [
    { name: 'Beranda', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Cari Partner', path: '/explore', icon: Compass },
    { name: 'Kotak Masuk', path: '/proposals', icon: Inbox },
    { name: 'Pertukaran', path: '/exchanges', icon: ArrowRightLeft },
    { name: 'Profil', path: '/profile', icon: User },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-6 md:top-[45%] md:-translate-y-1/2 md:translate-x-0 z-50 pointer-events-none w-[90vw] md:w-auto">
      <div className="pointer-events-auto bg-[#0B061A]/80 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.2)] flex flex-row md:flex-col items-center justify-between md:justify-center gap-1 sm:gap-2 group/dock transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] overflow-x-auto md:overflow-visible no-scrollbar">
        {navItems.map((item) => {
          const isActive = item.path === '/' 
            ? pathname === '/' 
            : pathname === item.path || pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          return (
            <Link 
              key={item.path}
              href={item.path} 
              onMouseEnter={playHover}
              onClick={playClick}
              className={`relative group flex items-center justify-center p-3 rounded-full transition-all duration-300 ${isActive ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1'}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip */}
              <span className="absolute bottom-full mb-4 md:bottom-auto md:mb-0 md:left-full md:ml-4 scale-0 group-hover:scale-100 transition-transform origin-bottom md:origin-left bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-white/10 whitespace-nowrap shadow-lg">
                {item.name}
              </span>
              
              {/* Active Dot */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:-left-1 md:translate-x-0 w-1 h-1 md:w-1 md:h-4 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,1)]"></span>
              )}
            </Link>
          );
        })}

        <div className="h-6 w-px md:w-8 md:h-px bg-white/20 mx-1 md:my-1 md:mx-0 flex-shrink-0"></div>
        
        <div className="relative group flex items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-0 md:hover:translate-x-1">
          <NotificationBell direction="right" />
          <span className="absolute bottom-full mb-4 md:bottom-auto md:mb-0 md:left-full md:ml-4 scale-0 group-hover:scale-100 transition-transform origin-bottom md:origin-left bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-white/10 whitespace-nowrap shadow-lg pointer-events-none z-50">
            Notifikasi
          </span>
        </div>

        <button
          onClick={() => {
            toggleMute();
            if (isMuted) playClick(); // Plays click sound right after unmuting
          }}
          onMouseEnter={playHover}
          className="relative group flex items-center justify-center p-3 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-full transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-0 md:hover:translate-x-1 focus:outline-none"
        >
          {isMuted ? <VolumeX size={20} strokeWidth={2} /> : <Volume2 size={20} strokeWidth={2} />}
          <span className="absolute bottom-full mb-4 md:bottom-auto md:mb-0 md:left-full md:ml-4 scale-0 group-hover:scale-100 transition-transform origin-bottom md:origin-left bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-white/10 whitespace-nowrap shadow-lg pointer-events-none z-50">
            {isMuted ? "Unmute SFX" : "Mute SFX"}
          </span>
        </button>
      </div>
    </div>
  );
}
