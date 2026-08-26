import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import ProposalButton from "@/components/ProposalButton";
import Link from "next/link";
import ReportUserButton from "@/components/ReportUserButton";
import BlockUserButton from "@/components/BlockUserButton";
import { Prisma } from "@prisma/client";
import { User, Star, Link as LinkIcon, Wrench, Trophy, FileText } from "lucide-react";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/");
  }

  // Fetch the current user to get their skills for the ProposalButton
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      owned_skills: { include: { skill: true } }
    }
  });

  if (!currentUser) redirect("/");

  // Fetch the target user (public profile)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      owned_skills: { include: { skill: true } },
      wanted_skills: { include: { skill: true } },
      reviews_received: {
        include: { reviewer: true },
        orderBy: { created_at: 'desc' }
      }
    }
  });

  if (!user) {
    notFound();
  }

  // If the user visits their own public profile, maybe they want to see it, 
  // but let's hide the proposal button in that case.
  const isSelf = currentUser.id === user.id;

  const blockData = !isSelf ? await prisma.block.findFirst({
    where: { blocker_id: currentUser.id, blocked_id: user.id }
  }) : null;
  const isBlocked = !!blockData;

  const mySkills = currentUser.owned_skills.map((os: Prisma.UserSkillGetPayload<{ include: { skill: true } }>) => os.skill);
  const partnerSkills = user.owned_skills.map((os: Prisma.UserSkillGetPayload<{ include: { skill: true } }>) => os.skill);

  return (
    <AuthProvider>
      <main className="min-h-screen bg-[#0B061A] text-white p-6 md:p-12 relative overflow-hidden pb-20 selection:bg-purple-500/30">
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          
          <div className="flex justify-between items-center bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 p-6 rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="relative z-10 flex items-center gap-4 w-full justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <User size={28} className="text-purple-400" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Profil Pengguna</span>
              </h1>
              {!isSelf && (
                <div className="flex items-center gap-2">
                  <BlockUserButton targetUserId={user.id} initialIsBlocked={isBlocked} />
                  <ReportUserButton reportedId={user.id} />
                </div>
              )}
            </div>
            <Link href="/explore" className="bg-white/5 hover:bg-white/10 text-slate-300 font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 border border-white/10 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50">
              &larr; Eksplorasi
            </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Identity & Reputation Card */}
            <div className="w-full md:w-1/3 space-y-6">
              <div className="bg-transparent backdrop-blur-3xl border-t border-l border-purple-500/30 border-b-0 border-r-0 rounded-3xl p-8 shadow-[0_0_30px_rgba(168,85,247,0.05)] flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
                <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-purple-500/10 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <Star size={14} className="text-purple-400 fill-purple-400" /> <span className="font-mono">{user.trust_score}</span> Trust Score
                </div>
                
                <div className="w-24 h-24 rounded-full bg-purple-900/50 border-2 border-purple-500/50 overflow-hidden mb-4 mt-4 shadow-[0_0_15px_rgba(168,85,247,0.4)] relative">
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-purple-300">
                      {(user.name || "U")[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-purple-500/20 mix-blend-overlay"></div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{user.name}</h1>
                <p className="text-slate-400 font-medium text-sm mb-1">{user.university}</p>
                <p className="text-purple-400 text-xs font-mono tracking-wider mb-6">{user.major}</p>

                {/* Call-to-Action */}
                {!isSelf && (
                  <div className="w-full mt-2">
                    <ProposalButton
                      receiverId={user.id}
                      receiverName={user.name || "Pengguna"}
                      partnerSkills={partnerSkills}
                      mySkills={mySkills}
                      senderTrustScore={currentUser.trust_score}
                    />
                  </div>
                )}
              </div>

              {/* Bio & Social Links */}
              <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-6 shadow-[0_0_30px_rgba(255,255,255,0.02)] space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-lg text-white border-b border-white/10 pb-2">Tentang {user.name?.split(' ')[0] || "Pengguna"}</h3>
                <p className="text-sm text-slate-300 leading-relaxed min-h-[80px]">
                  {user.bio || <span className="italic text-slate-500">Belum ada bio yang ditambahkan.</span>}
                </p>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  {user.githubUrl && (
                    <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                      <LinkIcon size={16} className="text-purple-400" /> GitHub
                    </a>
                  )}
                  {user.linkedinUrl && (
                    <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                      <LinkIcon size={16} className="text-purple-400" /> LinkedIn
                    </a>
                  )}
                  {user.portfolioUrl && (
                    <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                      <LinkIcon size={16} className="text-purple-400" /> Portfolio
                    </a>
                  )}
                  {!user.githubUrl && !user.linkedinUrl && !user.portfolioUrl && (
                    <p className="text-xs text-slate-500 italic">Tidak ada tautan sosial.</p>
                  )}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Reviews Area */}
            <div className="w-full md:w-2/3 flex flex-col gap-8">
              
              {/* Skills Display (Read Only) */}
              <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-8 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
                <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Wrench size={20} className="text-purple-400" /> Keahlian
                  </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider font-mono mb-4">Ditawarkan</h3>
                    {user.owned_skills.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">Belum ada keahlian.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.owned_skills.map((s: Prisma.UserSkillGetPayload<{ include: { skill: true } }>) => (
                          <span key={s.id} className="bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs px-3 py-1.5 rounded-full font-semibold shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                            {s.skill.name} <span className="opacity-70 font-medium ml-1">({s.proficiency})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-[#D946EF] uppercase tracking-wider font-mono mb-4">Ingin Dipelajari</h3>
                    {user.wanted_skills.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">Belum ada keahlian.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.wanted_skills.map((s: Prisma.WantedSkillGetPayload<{ include: { skill: true } }>) => (
                          <span key={s.id} className="bg-[#D946EF]/10 border border-[#D946EF]/30 text-[#D946EF] text-xs px-3 py-1.5 rounded-full font-semibold shadow-[0_0_10px_rgba(0,223,154,0.15)]">
                            {s.skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Ulasan & Reputasi Section */}
              <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-8 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
                <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Trophy size={20} className="text-purple-400" /> Ulasan & Reputasi
                  </h2>
                
                {user.reviews_received.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-black/20">
                    <FileText size={40} className="mb-3 opacity-50" />
                    <p className="text-slate-400 font-medium text-sm">
                      Belum ada ulasan.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {user.reviews_received.map((review: Prisma.ReviewGetPayload<{ include: { reviewer: true } }>) => (
                      <div key={review.id} className="p-5 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-3 shadow-inner">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-900/50 overflow-hidden border border-purple-500/30">
                              {review.reviewer.image ? (
                                <img src={review.reviewer.image} alt={review.reviewer.name || "Reviewer"} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-purple-300 text-sm">
                                  {(review.reviewer.name || "U")[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">{review.reviewer.name}</p>
                              <p className="text-[10px] text-purple-300/50 font-mono">
                                {new Date(review.created_at).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" : "text-slate-600"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 italic bg-white/5 p-3 rounded-lg border border-white/5">
                          "{review.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthProvider>
  );
}
