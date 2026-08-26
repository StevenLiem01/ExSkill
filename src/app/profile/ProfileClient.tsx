"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Settings, Code, Briefcase, Globe } from "lucide-react";
import { User } from "@prisma/client";

export default function ProfileClient({ user }: { user: User }) {
  // Komponen ini sekarang hanya bertugas menampilkan profil dan menangani logout.
  // Logika edit dipindahkan ke /settings

  return (
    <>
      <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-6 shadow-[0_0_30px_rgba(255,255,255,0.02)] space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="relative z-10 flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="font-bold text-white">Profil & Tautan</h2>
          <Link 
            href="/settings"
            className="text-xs bg-[#D946EF]/10 text-[#D946EF] border border-[#D946EF]/30 px-3 py-1.5 rounded-lg hover:bg-[#D946EF]/20 transition-colors font-medium flex items-center gap-1"
          >
            <Settings size={14} /> Edit Profil
          </Link>
        </div>

        <div>
          <h3 className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-2">Bio</h3>
          <p className="text-sm text-slate-300 italic">
            {user.bio ? `"${user.bio}"` : "Belum diatur"}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs text-slate-500 uppercase tracking-wider font-mono">Portofolio</h3>
          
          <div className="flex items-center gap-3">
            <span className="w-6 flex justify-center text-slate-400"><Code size={20} /></span>
            {user.githubUrl ? (
              <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 truncate">
                {user.githubUrl}
              </a>
            ) : (
              <span className="text-sm text-slate-500 italic">Belum diatur</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="w-6 flex justify-center text-slate-400"><Briefcase size={20} /></span>
            {user.linkedinUrl ? (
              <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 truncate">
                {user.linkedinUrl}
              </a>
            ) : (
              <span className="text-sm text-slate-500 italic">Belum diatur</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="w-6 flex justify-center text-slate-400"><Globe size={20} /></span>
            {user.portfolioUrl ? (
              <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 truncate">
                {user.portfolioUrl}
              </a>
            ) : (
              <span className="text-sm text-slate-500 italic">Belum diatur</span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full bg-[#FF5B4F]/10 hover:bg-[#FF5B4F]/20 text-[#FF5B4F] border border-[#FF5B4F]/30 font-bold py-3 px-4 rounded-xl shadow-sm transition-all duration-200"
      >
        Log Out
      </button>

    </>
  );
}
