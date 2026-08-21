import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import ProposalButton from "@/components/ProposalButton";
import Link from "next/link";
import ReportUserButton from "@/components/ReportUserButton";

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

  const mySkills = currentUser.owned_skills.map((os: any) => os.skill);
  const partnerSkills = user.owned_skills.map((os: any) => os.skill);

  return (
    <AuthProvider>
      <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 relative overflow-hidden pb-20">
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-[#00DF9A]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          
          <div className="flex justify-between items-center bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-sm">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                👤 <span className="text-[#00DF9A]">Profil Pengguna</span>
              </h1>
              {!isSelf && <ReportUserButton reportedId={user.id} />}
            </div>
            <Link href="/explore" className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 border border-white/10 hover:-translate-y-0.5">
              &larr; Eksplorasi
            </Link>
          </div>

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
                <p className="text-[#00DF9A] text-xs font-mono tracking-wider mb-6">{user.major}</p>

                {/* Call-to-Action */}
                {!isSelf && (
                  <div className="w-full mt-2">
                    <ProposalButton
                      receiverId={user.id}
                      receiverName={user.name || "Pengguna"}
                      partnerSkills={partnerSkills}
                      mySkills={mySkills}
                    />
                  </div>
                )}
              </div>

              {/* Bio & Social Links */}
              <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="font-bold text-lg text-white border-b border-white/10 pb-2">Tentang {user.name?.split(' ')[0] || "Pengguna"}</h3>
                <p className="text-sm text-slate-300 leading-relaxed min-h-[80px]">
                  {user.bio || <span className="italic text-slate-500">Belum ada bio yang ditambahkan.</span>}
                </p>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  {user.githubUrl && (
                    <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                      <span className="text-[#00DF9A]">🔗</span> GitHub
                    </a>
                  )}
                  {user.linkedinUrl && (
                    <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                      <span className="text-[#00DF9A]">🔗</span> LinkedIn
                    </a>
                  )}
                  {user.portfolioUrl && (
                    <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                      <span className="text-[#00DF9A]">🔗</span> Portfolio
                    </a>
                  )}
                  {!user.githubUrl && !user.linkedinUrl && !user.portfolioUrl && (
                    <p className="text-xs text-slate-500 italic">Tidak ada tautan sosial.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills & Reviews Area */}
            <div className="w-full md:w-2/3 flex flex-col gap-8">
              
              {/* Skills Display (Read Only) */}
              <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>🛠️</span> Keahlian
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider font-mono mb-4">Ditawarkan</h3>
                    {user.owned_skills.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">Belum ada keahlian.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.owned_skills.map((s: any) => (
                          <span key={s.id} className="bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs px-3 py-1.5 rounded-full font-semibold">
                            {s.skill.name} <span className="opacity-70 font-medium ml-1">({s.proficiency})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-[#00DF9A] uppercase tracking-wider font-mono mb-4">Ingin Dipelajari</h3>
                    {user.wanted_skills.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">Belum ada keahlian.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.wanted_skills.map((s: any) => (
                          <span key={s.id} className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-semibold">
                            {s.skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Ulasan & Reputasi Section */}
              <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>🏆</span> Ulasan & Reputasi
                </h2>
                
                {user.reviews_received.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-slate-800/30">
                    <span className="text-4xl mb-3 opacity-50">📝</span>
                    <p className="text-slate-400 font-medium text-sm">
                      Belum ada ulasan.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {user.reviews_received.map((review: any) => (
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
