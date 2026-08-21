import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import ProposalButton from "@/components/ProposalButton";
import RecommendedPartners from "@/components/RecommendedPartners";
import SearchFilterBar from "@/components/SearchFilterBar";

export default async function ExplorePage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
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

  const wantedSkillIds = currentUser.wanted_skills.map((w: any) => w.skill_id);

  const q = searchParams?.q || "";
  const minScore = parseInt(searchParams?.min_score || "0");
  const sortParam = searchParams?.sort || "newest";

  let queryWhere: any = { id: { not: currentUser.id } };

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

  let orderByQuery: any = { created_at: 'desc' };
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

          <RecommendedPartners />

          <div className="pt-8 border-t border-white/10">
            <div className="mb-6 flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🌐</span> Pencarian Universal
              </h2>
              <p className="text-slate-400 text-sm">Cari keahlian spesifik atau filter berdasarkan reputasi.</p>
            </div>
            
            <SearchFilterBar />
          </div>

          {universalSearchUsers.length === 0 ? (
            <div className="text-center p-12 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm mt-8">
              <span className="text-5xl opacity-50 mb-4 block">🔍</span>
              <p className="text-slate-300 font-medium">Partner dengan kriteria tersebut belum ditemukan di ExSkill.</p>
              <p className="text-slate-400 text-sm mt-2">Coba ubah kata kunci atau kurangi batas filter reputasi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {universalSearchUsers.map((user: any) => {
                const partnerSkills = user.owned_skills.map((os: any) => os.skill);

                return (
                  <div key={user.id} className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-[#00DF9A]/50 hover:shadow-lg hover:shadow-[#00DF9A]/5 transition-all duration-300 ease-in-out hover:-translate-y-1 flex flex-col justify-between group shadow-sm">
                    <div className="space-y-5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 border border-white/10">
                            {user.image ? (
                              <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 text-lg">
                                {(user.name || "U")[0]}
                              </div>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="text-lg font-bold text-white truncate" title={user.name}>{user.name}</h3>
                            <p className="text-xs text-slate-400 font-medium truncate mt-0.5" title={`${user.major} di ${user.university}`}>
                              {user.major} <span className="opacity-50">&bull;</span> {user.university}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-amber-900/30 px-2.5 py-1.5 rounded-lg border border-amber-500/30 shadow-sm flex-shrink-0">
                          <span className="text-amber-400 text-xs">⭐</span>
                          <span className="text-xs font-bold text-amber-400 font-mono">{user.trust_score}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold font-mono">Bisa Mengajarkan:</p>
                        <div className="flex flex-wrap gap-2">
                          {partnerSkills.slice(0, 3).map((skill: any) => (
                            <span key={skill.id} className="bg-white/5 border border-white/10 text-slate-300 text-[10px] px-2 py-1 rounded-md font-medium shadow-sm">
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
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 shadow-inner">
                          <p className="text-xs text-slate-300 line-clamp-2 italic font-medium">
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
                          <p className="text-xs text-slate-300 italic line-clamp-1 font-medium">
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