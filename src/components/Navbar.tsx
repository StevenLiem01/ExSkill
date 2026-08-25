"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LoginButton from "./LoginButton";
import NotificationBell from "./NotificationBell";
import FloatingDock from "./FloatingDock";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (pathname === "/onboarding") return null;

  // Jika role = USER, sembunyikan Navbar Atas dan tampilkan Floating Dock Bawah
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session?.user as any)?.role === "USER") {
    return <FloatingDock session={session} />;
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0B061A]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
              Ex<span className="text-purple-500 text-shadow-glow">Skill</span>
            </Link>
          </div>
          
          {session ? (
            <>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-2">
                {[
                  { name: 'Dashboard', path: '/dashboard' },
                  { name: 'Cari Partner', path: '/explore' },
                  { name: 'Kotak Masuk', path: '/proposals' },
                  { name: 'Ruang Pertukaran', path: '/exchanges' },
                  { name: 'Profil', path: '/profile' },
                  { name: 'Pengaturan', path: '/settings' },
                ].map((item) => {
                  const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                  return (
                    <Link 
                      key={item.path}
                      href={item.path} 
                      className={`transition-all font-medium text-sm drop-shadow-sm px-3 py-2 rounded-lg ${isActive ? 'bg-purple-600/10 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'text-slate-300 hover:text-purple-300 hover:bg-white/5 border border-transparent'}`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <div className="h-6 w-px bg-white/20 mx-2"></div>
                <NotificationBell />
                <LoginButton />
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-4">
                <NotificationBell />
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-slate-300 hover:text-purple-400 focus:outline-none transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center">
              <LoginButton />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {session && isMenuOpen && (
        <div className="md:hidden bg-[#0B061A]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl absolute w-full">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {[
              { name: 'Dashboard', path: '/dashboard' },
              { name: 'Cari Partner', path: '/explore' },
              { name: 'Kotak Masuk', path: '/proposals' },
              { name: 'Ruang Pertukaran', path: '/exchanges' },
              { name: 'Profil', path: '/profile' },
              { name: 'Pengaturan', path: '/settings' },
            ].map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <Link 
                  key={item.path}
                  href={item.path} 
                  onClick={() => setIsMenuOpen(false)} 
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive ? 'bg-purple-600/10 text-purple-400 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end items-center">
              <LoginButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
