import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import SkillManager from "@/components/SkillManager";
import ProfileClient from "./ProfileClient";
import { Star, Trophy, MessageSquare } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      owned_skills: { include: { skill: true } },
      wanted_skills: { include: { skill: true } },
      reviews_received: {
        include: { reviewer: true },
        orderBy: { created_at: 'desc' }
      }
    }
  });

  if (!user) redirect("/");

  const catalog = await prisma.skill.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <AuthProvider>
      <main className="min-h-screen bg-[#0B061A] text-white p-6 md:p-12 relative overflow-hidden pb-20 selection:bg-purple-500/30">
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Identity & Reputation Card (Hacker ID Card) */}
            <div className="w-full md:w-1/3 space-y-6">
              <div className="bg-transparent backdrop-blur-3xl border-t border-l border-purple-500/30 border-b-0 border-r-0 rounded-3xl p-8 shadow-[0_0_30px_rgba(168,85,247,0.05)] flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
                <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-purple-500/10 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <Star size={14} /> <span className="font-mono">{user.trust_score}</span> Trust Score
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
                <p className="text-purple-400 text-xs font-mono tracking-wider">{user.major}</p>
              </div>

              {/* Bio & Portofolio Client Component */}
              <ProfileClient user={user} />
            </div>

            {/* Skill Manager Area */}
            <div className="w-full md:w-2/3 flex flex-col gap-8">
              <SkillManager
                catalog={catalog}
                initialOffered={user.owned_skills}
                initialWanted={user.wanted_skills}
              />

              {/* Ulasan & Reputasi Section */}
              <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-8 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
                <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Trophy size={24} className="text-purple-400" /> Ulasan & Reputasi
                  </h2>

                {user.reviews_received.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-black/20">
                    <MessageSquare size={40} className="mb-3 opacity-50 text-slate-300" />
                    <p className="text-slate-400 font-medium text-sm">
                      Belum ada ulasan.<br />
                      Selesaikan pertukaran untuk mendapatkan reputasi!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {user.reviews_received.map((review) => (
                      <div key={review.id} className="p-5 rounded-xl bg-black/20 border border-white/5 shadow-inner flex flex-col gap-3">
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
                          <div className="flex gap-1 text-amber-400 text-sm drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? "fill-current" : "opacity-20 text-slate-600"} />
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
