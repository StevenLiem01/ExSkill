import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import ProposalButton from "@/components/ProposalButton";

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/");
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      wanted_skills: true,
      owned_skills: { include: { skill: true } }
    },
  });

  if (!currentUser) redirect("/");

  const wantedSkillIds = currentUser.wanted_skills.map(w => w.skill_id);

  // Cari partner yang cocok
  let matchedUsers: any[] = [];
  if (wantedSkillIds.length > 0) {
    matchedUsers = await prisma.user.findMany({
      where: {
        id: { not: currentUser.id },
        owned_skills: {
          some: {
            skill_id: { in: wantedSkillIds }
          }
        }
      },
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
  }

  // Data keahlian saya yang bisa saya tawarkan (Owned Skills)
  const mySkills = currentUser.owned_skills.map((os: any) => os.skill);

  return (
    <AuthProvider>
      <main className="min-h-screen bg-slate-900 text-slate-50 p-6 md:p-12 relative overflow-hidden pb-20">
        <div className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-all"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[30rem] h-[30rem] bg-[#00DF9A]/10 rounded-full blur-3xl pointer-events-none transition-all"></div>

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 gap-6 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out relative z-50">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                🔍 <span className="text-[#00DF9A]">Eksplorasi Partner</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm font-medium">
                Temukan mahasiswa lain yang memiliki keahlian yang sedang kamu butuhkan!
              </p>
            </div>

            <Link href="/" className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 min-h-[44px] rounded-xl shadow-sm transition-all duration-200 ease-in-out border border-white/10 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 flex items-center justify-center">
              &larr; Kembali ke Dasbor
            </Link>
          </div>

          {wantedSkillIds.length === 0 ? (
            <div className="text-center p-12 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm transition-all">
              <p className="text-slate-300 mb-4 font-medium">Untuk mendapatkan rekomendasi partner, kamu harus menentukan keahlian yang ingin kamu pelajari terlebih dahulu.</p>
              <Link href="/" className="text-[#00DF9A] hover:text-[#00C285] font-semibold underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#00DF9A] rounded p-1">
                + Tambahkan "Keahlian yang Dicari" di Dasbor
              </Link>
            </div>
          ) : matchedUsers.length === 0 ? (
            <div className="text-center p-12 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm transition-all">
              <p className="text-slate-300 font-medium">Belum ada partner yang cocok dengan daftar keahlian yang kamu cari saat ini. Cek lagi nanti!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedUsers.map((user) => {
                const matchedSkills = user.owned_skills.filter((os: any) => wantedSkillIds.includes(os.skill_id));
                const partnerSkills = user.owned_skills.map((os: any) => os.skill);

                return (
                  <div key={user.id} className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-[#00DF9A]/50 hover:shadow-lg hover:shadow-[#00DF9A]/5 transition-all duration-300 ease-in-out hover:-translate-y-1 flex flex-col justify-between group shadow-sm">
                    <div className="space-y-5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="overflow-hidden">
                          <h3 className="text-xl font-bold text-white truncate" title={user.name}>{user.name}</h3>
                          <p className="text-xs text-slate-400 font-medium truncate mt-0.5" title={`${user.major} di ${user.university}`}>
                            {user.major} <span className="opacity-50">&bull;</span> {user.university}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-amber-900/30 px-2.5 py-1.5 rounded-lg border border-amber-500/30 shadow-sm flex-shrink-0">
                          <span className="text-amber-400 text-xs">⭐</span>
                          <span className="text-xs font-bold text-amber-400 font-mono">{user.trust_score}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold font-mono">Keahlian yang Cocok (Match):</p>
                        <div className="flex flex-wrap gap-2">
                          {matchedSkills.map((ms: any) => (
                            <span key={ms.id} className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm">
                              {ms.skill.name} <span className="opacity-70 font-medium ml-1">({ms.proficiency.charAt(0) + ms.proficiency.slice(1).toLowerCase()})</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {user.bio && (
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 shadow-inner">
                          <p className="text-sm text-slate-300 line-clamp-3 italic font-medium">
                            "{user.bio}"
                          </p>
                        </div>
                      )}

                      {user.reviews_received && user.reviews_received.length > 0 && (
                        <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/20 mt-2 space-y-2">
                          <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-2">
                            <span className="text-amber-400 text-sm">⭐</span>
                            <span className="text-white font-bold text-sm font-mono">
                              {(user.reviews_received.reduce((acc: number, curr: any) => acc + curr.rating, 0) / user.reviews_received.length).toFixed(1)} / 5.0
                            </span>
                            <span className="text-slate-400 text-xs font-medium">({user.reviews_received.length} ulasan)</span>
                          </div>
                          <p className="text-xs text-slate-300 italic line-clamp-2 font-medium">
                            💬 "{user.reviews_received[0].comment}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <ProposalButton
                        receiverId={user.id}
                        receiverName={user.name}
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