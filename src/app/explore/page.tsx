import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import ProposalButton from "@/components/ProposalButton";
import RecommendedPartners from "@/components/RecommendedPartners";
import { Prisma } from "@prisma/client";
import SearchFilterBar from "@/components/SearchFilterBar";
import { Search, Globe, Star, MessageSquare } from "lucide-react";
import { calculateMatchScore } from "@/lib/matching";

export default async function ExplorePage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/");
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      wanted_skills: { include: { skill: true } },
      owned_skills: { include: { skill: true } }
    },
  });

  if (!currentUser) redirect("/");

  const wantedSkillIds = currentUser.wanted_skills.map((w) => w.skill_id);

  const blockedByMe = await prisma.block.findMany({ where: { blocker_id: currentUser.id } });
  const blockingMe = await prisma.block.findMany({ where: { blocked_id: currentUser.id } });
  const excludedUserIds = [
    currentUser.id,
    ...blockedByMe.map(b => b.blocked_id),
    ...blockingMe.map(b => b.blocker_id)
  ];

  const q = searchParams?.q || "";
  const minScore = parseInt(searchParams?.min_score || "0");
  const sortParam = searchParams?.sort || "newest";

  let queryWhere: Prisma.UserWhereInput = { id: { notIn: excludedUserIds } };

  if (q) {
    queryWhere = {
      ...queryWhere,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        {
          owned_skills: {
            some: {
              skill: {
                name: { contains: q, mode: 'insensitive' }
              }
            }
          }
        }
      ]
    };
  }

  if (minScore > 0) {
    queryWhere.trust_score = { gte: minScore };
  }

  let orderByQuery: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[] = { created_at: 'desc' };
  if (sortParam === 'score_desc') {
    orderByQuery = { trust_score: 'desc' };
  }

  const universalSearchUsers = await prisma.user.findMany({
    where: queryWhere,
    orderBy: orderByQuery,
    include: {
      owned_skills: {
        include: { skill: true }
      },
      wanted_skills: {
        include: { skill: true }
      },
      reviews_received: {
        orderBy: { created_at: 'desc' }
      }
    }
  });

  const usersWithScore = universalSearchUsers.map(u => ({
    ...u,
    matchScore: calculateMatchScore(currentUser, u)
  }));

  // Urutkan berdasarkan matchScore, kecuali jika eksplisit diminta sort trust score
  if (sortParam !== 'score_desc') {
    usersWithScore.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Data keahlian saya yang bisa saya tawarkan (Owned Skills)
  const mySkills = currentUser.owned_skills.map((os) => os.skill);

  type ExploreUser = Prisma.UserGetPayload<{
    include: {
      owned_skills: {
        include: { skill: true }
      },
      wanted_skills: {
        include: { skill: true }
      },
      reviews_received: true
    }
  }> & { matchScore: number };

  return (
    <AuthProvider>
      <main className="min-h-screen bg-[#0B061A] text-slate-50 p-6 md:p-12 relative overflow-hidden pb-20 selection:bg-purple-500/30">
        <div className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none transition-all"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[30rem] h-[30rem] bg-fuchsia-600/15 rounded-full blur-[120px] pointer-events-none transition-all"></div>

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 gap-6 shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-200 ease-in-out relative z-50">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <Search size={28} className="text-purple-400" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Eksplorasi Partner</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm font-medium">
                Temukan mahasiswa lain yang memiliki keahlian yang sedang kamu butuhkan!
              </p>
            </div>

            <Link href="/" className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-purple-300 font-semibold px-5 py-2.5 min-h-[44px] rounded-xl shadow-sm transition-all duration-200 ease-in-out border border-white/10 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 flex items-center justify-center">
              &larr; Kembali ke Dasbor
            </Link>
          </div>

          <RecommendedPartners />

          <div className="pt-8 border-t border-white/10">
            <div className="mb-6 flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Globe size={24} className="text-white" /> Pencarian Universal
              </h2>
              <p className="text-slate-400 text-sm">Cari keahlian spesifik atau filter berdasarkan reputasi.</p>
            </div>
            
            <SearchFilterBar />
          </div>

          {universalSearchUsers.length === 0 ? (
            <div className="text-center p-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.1)] mt-8 flex flex-col items-center">
              <Search size={48} className="opacity-50 mb-4 text-slate-300" />
              <p className="text-slate-300 font-medium">Partner dengan kriteria tersebut belum ditemukan di ExSkill.</p>
              <p className="text-slate-400 text-sm mt-2">Coba ubah kata kunci atau kurangi batas filter reputasi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {usersWithScore.map((user: ExploreUser) => {
                const partnerSkills = user.owned_skills.map((os) => os.skill);

                // Tentukan warna glow berdasarkan score
                let matchGlow = "shadow-[0_0_10px_rgba(148,163,184,0.2)] bg-slate-500/10 border-slate-500/30 text-slate-300";
                if (user.matchScore >= 80) {
                  matchGlow = "shadow-[0_0_15px_rgba(16,185,129,0.25)] bg-emerald-500/15 border-emerald-500/40 text-emerald-300";
                } else if (user.matchScore >= 50) {
                  matchGlow = "shadow-[0_0_15px_rgba(234,179,8,0.25)] bg-yellow-500/15 border-yellow-500/40 text-yellow-300";
                }

                return (
                  <div key={user.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300 ease-in-out hover:-translate-y-1 flex flex-col justify-between group">
                    <div className="space-y-5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-full bg-purple-900/50 border border-purple-500/30 overflow-hidden flex-shrink-0">
                            {user.image ? (
                              <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-purple-300 text-lg">
                                {(user.name || "U")[0]}
                              </div>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-400 transition-colors" title={user.name || undefined}>{user.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${matchGlow}`}>
                                {user.matchScore}% Match
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium truncate mt-1" title={`${user.major} di ${user.university}`}>
                              {user.major} <span className="opacity-50">&bull;</span> {user.university}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-amber-900/30 px-2.5 py-1.5 rounded-lg border border-amber-500/30 shadow-sm flex-shrink-0">
                          <Star size={14} className="text-amber-400" />
                          <span className="text-xs font-bold text-amber-400 font-mono">{user.trust_score}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-[10px] text-purple-300/80 uppercase tracking-widest mb-2 font-bold font-mono">Bisa Mengajarkan:</p>
                        <div className="flex flex-wrap gap-2">
                          {partnerSkills.slice(0, 3).map((skill) => (
                            <span key={skill.id} className="bg-purple-500/10 border border-purple-500/20 text-purple-200 text-[10px] px-2 py-1 rounded-md font-medium shadow-sm">
                              {skill.name}
                            </span>
                          ))}
                          {partnerSkills.length > 3 && (
                            <span className="bg-white/5 border border-white/10 text-slate-400 text-[10px] px-2 py-1 rounded-md font-medium shadow-sm">
                              +{partnerSkills.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      </div>

                      {user.bio && (
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
                          <p className="text-xs text-slate-300 line-clamp-2 italic font-medium">
                            "{user.bio}"
                          </p>
                        </div>
                      )}

                      {user.reviews_received && user.reviews_received.length > 0 && (
                        <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20 mt-2 space-y-2">
                          <div className="flex items-center gap-2 border-b border-purple-500/20 pb-2">
                            <Star size={16} className="text-amber-400" />
                            <span className="text-white font-bold text-sm font-mono">
                              {(user.reviews_received.reduce((acc, curr) => acc + curr.rating, 0) / user.reviews_received.length).toFixed(1)} / 5.0
                            </span>
                            <span className="text-slate-400 text-xs font-medium">({user.reviews_received.length} ulasan)</span>
                          </div>
                          <p className="text-xs text-slate-300 italic line-clamp-1 font-medium flex items-start gap-1">
                            <MessageSquare size={12} className="inline mt-0.5 flex-shrink-0" /> "{user.reviews_received[0].comment}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <ProposalButton
                        receiverId={user.id}
                        receiverName={user.name || "User"}
                        partnerSkills={partnerSkills}
                        mySkills={mySkills}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </AuthProvider>
  );
}