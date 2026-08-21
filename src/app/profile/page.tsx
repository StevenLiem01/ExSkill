import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import SkillManager from "@/components/SkillManager";
import ProfileClient from "./ProfileClient";

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
      <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 relative overflow-hidden pb-20">
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-[#00DF9A]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Identity & Reputation Card */}
            <div className="w-full md:w-1/3 space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl flex flex-col items-center text-center relative">
                <div className="absolute top-4 right-4 bg-[#00DF9A]/10 text-[#00DF9A] border border-[#00DF9A]/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(0,223,154,0.2)]">
                  🌟 {user.trust_score} Trust Score
                </div>
                
                <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-[#00DF9A]/50 overflow-hidden mb-4 mt-4 shadow-[0_0_15px_rgba(0,223,154,0.2)]">
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">
                      {(user.name || "U")[0]}
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
                <p className="text-slate-400 font-medium text-sm mb-1">{user.university}</p>
                <p className="text-[#00DF9A] text-xs font-mono tracking-wider">{user.major}</p>
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
              <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>🏆</span> Ulasan & Reputasi
                </h2>
                
                {user.reviews_received.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-slate-800/30">
                    <span className="text-4xl mb-3 opacity-50">📝</span>
                    <p className="text-slate-400 font-medium text-sm">
                      Belum ada ulasan.<br />
                      Selesaikan pertukaran untuk mendapatkan reputasi!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {user.reviews_received.map((review) => (
                      <div key={review.id} className="p-5 rounded-xl bg-slate-900 border border-white/5 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                              {review.reviewer.image ? (
                                <img src={review.reviewer.image} alt={review.reviewer.name || "Reviewer"} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-sm">
                                  {(review.reviewer.name || "U")[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">{review.reviewer.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {new Date(review.created_at).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 text-[#00DF9A] text-sm drop-shadow-[0_0_5px_rgba(0,223,154,0.5)]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < review.rating ? "opacity-100" : "opacity-20 text-slate-600"}>★</span>
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
      </main>
    </AuthProvider>
  );
}
