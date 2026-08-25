"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, Inbox, ArrowRightLeft, User, Settings } from "lucide-react";
import NotificationBell from "./NotificationBell";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FloatingDock({ session }: { session: any }) {
  const pathname = usePathname();

  // Hide on onboarding
  if (pathname === "/onboarding") return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Cari Partner', path: '/explore', icon: Compass },
    { name: 'Kotak Masuk', path: '/proposals', icon: Inbox },
    { name: 'Pertukaran', path: '/exchanges', icon: ArrowRightLeft },
    { name: 'Profil', path: '/profile', icon: User },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="pointer-events-auto bg-[#0B061A]/80 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.2)] flex flex-col items-center gap-1 sm:gap-2 group/dock transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]">
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          return (
            <Link 
              key={item.path}
              href={item.path} 
              className={`relative group flex items-center justify-center p-3 rounded-full transition-all duration-300 ${isActive ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1'}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip */}
              <span className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-transform origin-left bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-white/10 whitespace-nowrap shadow-lg">
                {item.name}
              </span>
              
              {/* Active Dot */}
              {isActive && (
                <span className="absolute -left-1 w-1 h-4 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,1)]"></span>
              )}
            </Link>
          );
        })}

        <div className="w-8 h-px bg-white/20 my-1"></div>
        
        <div className="relative group flex items-center justify-center rounded-full transition-all duration-300 hover:translate-x-1">
          <NotificationBell direction="right" />
          <span className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-transform origin-left bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-white/10 whitespace-nowrap shadow-lg pointer-events-none">
            Notifikasi
          </span>
        </div>
      </div>
    </div>
  );
}
