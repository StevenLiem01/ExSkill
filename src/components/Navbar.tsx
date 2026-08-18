"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LoginButton from "./LoginButton";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (pathname === "/onboarding") return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
              Ex<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Skill</span>
            </Link>
          </div>
          
          {session ? (
            <>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-slate-300 hover:text-[#00DF9A] hover:scale-105 transition-all font-medium text-sm drop-shadow-sm">Dashboard</Link>
                <Link href="/explore" className="text-slate-300 hover:text-[#00DF9A] hover:scale-105 transition-all font-medium text-sm drop-shadow-sm">Cari Partner</Link>
                <Link href="/proposals" className="text-slate-300 hover:text-[#00DF9A] hover:scale-105 transition-all font-medium text-sm drop-shadow-sm">Kotak Masuk</Link>
                <Link href="/exchanges" className="text-slate-300 hover:text-[#00DF9A] hover:scale-105 transition-all font-medium text-sm drop-shadow-sm">Ruang Pertukaran</Link>
                <Link href="/profile" className="text-slate-300 hover:text-[#00DF9A] hover:scale-105 transition-all font-medium text-sm drop-shadow-sm">Profil</Link>
                <div className="h-6 w-px bg-white/20 mx-2"></div>
                <LoginButton />
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-slate-300 hover:text-[#00DF9A] focus:outline-none transition-colors"
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
        <div className="md:hidden bg-slate-800/95 backdrop-blur-md border-b border-white/10 shadow-2xl absolute w-full">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Dashboard</Link>
            <Link href="/explore" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Cari Partner</Link>
            <Link href="/proposals" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Kotak Masuk</Link>
            <Link href="/exchanges" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Ruang Pertukaran</Link>
            <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Profil</Link>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end items-center">
              <LoginButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
