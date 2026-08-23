"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Puzzle, Flame, Star } from "lucide-react";

type RecommendedUser = {
  id: string;
  name: string;
  image: string | null;
  major: string;
  trust_score: number;
  matchCount: number;
  matchedSkills: { id: string; skill: { name: string } }[];
};

export default function RecommendedPartners() {
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/api/recommendations");
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full bg-slate-800/30 border border-white/10 rounded-2xl p-8 animate-pulse flex flex-col justify-center items-center h-48">
        <div className="w-8 h-8 border-4 border-[#D946EF] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">Mencari kecocokan terbaik untukmu...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="w-full bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-lg">
        <Puzzle size={40} className="mb-4 opacity-70 text-slate-300" />
        <h3 className="text-lg font-bold text-white mb-2">Belum Ada Rekomendasi</h3>
        <p className="text-slate-400 text-sm font-medium max-w-md">
          Belum ada rekomendasi yang pas. Coba tambahkan atau perbarui "Keahlian yang Dicari" di profilmu agar sistem kami bisa mencarikan partner yang tepat!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Flame size={24} className="text-[#D946EF]" /> Rekomendasi Spesial Untukmu
      </h2>
      
      {/* Horizontal Carousel */}
      <div className="flex overflow-x-auto pb-4 pt-2 -mx-2 px-2 snap-x snap-mandatory gap-4 custom-scrollbar">
        {recommendations.map((user) => (
          <div 
            key={user.id} 
            className="flex-shrink-0 w-80 bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 snap-start shadow-lg hover:shadow-[0_0_20px_rgba(0,223,154,0.15)] hover:border-[#D946EF]/30 transition-all duration-300 relative group"
          >
            {/* Lencana Trust Score */}
            <div className="absolute top-4 right-4 bg-[#D946EF]/10 text-[#D946EF] border border-[#D946EF]/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Star size={14} className="text-[#D946EF]" /> {user.trust_score}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-slate-700 border border-white/10 overflow-hidden flex-shrink-0">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-400">
                    {(user.name || "U")[0]}
                  </div>
                )}
              </div>
              <div className="overflow-hidden pr-8">
                <h3 className="font-bold text-white text-lg truncate" title={user.name}>{user.name}</h3>
                <p className="text-xs text-slate-400 truncate">{user.major}</p>
              </div>
            </div>

            <div className="mb-6 h-16">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-mono mb-2">Irisan Keahlian ({user.matchCount}):</p>
              <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-12">
                {user.matchedSkills.map((ms) => (
                  <span key={ms.id} className="bg-[#D946EF]/10 border border-[#D946EF]/30 text-[#D946EF] text-[10px] px-2 py-1 rounded-md font-medium whitespace-nowrap">
                    {ms.skill.name}
                  </span>
                ))}
              </div>
            </div>

            <Link 
              href={`/users/${user.id}`}
              className="block w-full py-2.5 bg-white/5 hover:bg-[#D946EF] text-slate-300 hover:text-slate-900 border border-white/10 hover:border-[#D946EF] rounded-xl text-center text-sm font-bold transition-all duration-300"
            >
              Lihat Profil
            </Link>
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 223, 154, 0.5);
        }
      `}</style>
    </div>
  );
}
