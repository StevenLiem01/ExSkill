import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!dbUser) redirect("/");

  // 1. Ambil Quick Stats
  const activeExchanges = await prisma.exchange.findMany({
    where: {
      status: "ONGOING",
      OR: [
        { participant_a_id: dbUser.id },
        { participant_b_id: dbUser.id }
      ]
    },
    include: {
      participant_a: true,
      participant_b: true,
      milestones: {
        include: {
          sessions: {
            where: {
              scheduled_at: { gt: new Date() }
            },
            orderBy: { scheduled_at: "asc" }
          }
        }
      }
    }
  });

  const completedExchangesCount = await prisma.exchange.count({
    where: {
      status: "COMPLETED",
      OR: [
        { participant_a_id: dbUser.id },
        { participant_b_id: dbUser.id }
      ]
    }
  });

  // Kumpulkan semua jadwal terdekat dari seluruh exchange aktif melalui milestones
  const upcomingMeetings = activeExchanges
    .flatMap(ex => ex.milestones.flatMap(m => m.sessions.map((s: any) => ({ ...s, exchange: ex }))))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  return (
    <AuthProvider>
      <main className="min-h-screen bg-slate-900 text-slate-50 p-6 md:p-12 relative overflow-hidden pb-20">
        <div className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[30rem] h-[30rem] bg-[#00DF9A]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          
          {/* Widget 1: Top Bar (Welcome & Quick Stats) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-400/50 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-inner flex-shrink-0">
                {dbUser.image ? (
                  <img src={dbUser.image} alt={dbUser.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  (dbUser.name || "U")[0].toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm text-[#00DF9A] font-bold tracking-wider uppercase mb-1">Welcome Back,</p>
                <h1 className="text-2xl font-extrabold text-white truncate">{dbUser.name}</h1>
                <p className="text-slate-400 text-sm mt-1 truncate">{dbUser.major} • {dbUser.university}</p>
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-6xl opacity-5 group-hover:scale-110 transition-transform">⭐</div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest font-mono mb-2">Trust Score</p>
              <p className="text-4xl font-black text-white">{dbUser.trust_score} <span className="text-lg text-amber-400 font-medium ml-1">pts</span></p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-6xl opacity-5 group-hover:scale-110 transition-transform">🤝</div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest font-mono mb-2">Selesai</p>
                  <p className="text-4xl font-black text-white">{completedExchangesCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest font-mono mb-2">Aktif</p>
                  <p className="text-4xl font-black text-[#00DF9A]">{activeExchanges.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Active Exchanges (Left 60%) & Upcoming Meetings (Right 40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Widget 2: Pertukaran Aktif Saat Ini */}
            <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-[#00DF9A]">⚡</span> Pertukaran Aktif Saat Ini
                </h2>
                <Link href="/exchanges" className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4">
                  Lihat Semua
                </Link>
              </div>

              {activeExchanges.length === 0 ? (
                <div className="bg-slate-900/50 rounded-2xl p-10 text-center border border-white/5 flex flex-col items-center justify-center">
                  <span className="text-4xl mb-4 opacity-50">🌱</span>
                  <p className="text-slate-300 font-medium mb-2">Belum ada pertukaran yang aktif.</p>
                  <Link href="/explore" className="text-sm text-[#00DF9A] hover:text-[#00C285] transition-colors">
                    Mulai cari partner belajar sekarang! &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeExchanges.map((ex: any) => {
                    const isParticipantA = ex.participant_a_id === dbUser.id;
                    const partner = isParticipantA ? ex.participant_b : ex.participant_a;
                    const totalMilestones = ex.milestones.length;
                    const completedMilestones = ex.milestones.filter((m: any) => m.is_completed).length;
                    const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

                    return (
                      <Link href={`/exchanges/${ex.id}`} key={ex.id} className="block">
                        <div className="bg-slate-900/40 hover:bg-slate-800 border border-white/10 hover:border-[#00DF9A]/50 rounded-2xl p-5 transition-all duration-300 group shadow-sm hover:shadow-md hover:-translate-y-0.5">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                                {partner.image ? (
                                  <img src={partner.image} alt={partner.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                                    {(partner.name || "P")[0]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-sm md:text-base group-hover:text-[#00DF9A] transition-colors">{partner.name}</h3>
                                <p className="text-xs text-slate-400">Belajar bersama</p>
                              </div>
                            </div>
                            <span className="bg-[#00DF9A]/10 text-[#00DF9A] text-[10px] font-bold px-2 py-1 rounded-full border border-[#00DF9A]/20">
                              ACTIVE
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-slate-400 font-mono font-medium">Progres Pembelajaran</span>
                              <span className="text-white font-bold">{progressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                              <div 
                                className="bg-gradient-to-r from-emerald-400 to-[#00DF9A] h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 text-right">
                              {completedMilestones} dari {totalMilestones} target selesai
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Widget 3: Jadwal Pertemuan Terdekat */}
            <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🗓️</span> Jadwal Terdekat
                </h2>
              </div>

              {upcomingMeetings.length === 0 ? (
                <div className="bg-slate-900/50 rounded-2xl p-6 text-center border border-white/5">
                  <p className="text-slate-400 text-sm italic">Tidak ada jadwal pertemuan terdekat.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting: any) => {
                    const isParticipantA = meeting.exchange.participant_a_id === dbUser.id;
                    const partner = isParticipantA ? meeting.exchange.participant_b : meeting.exchange.participant_a;
                    const dateObj = new Date(meeting.scheduled_at);
                    const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
                    const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <Link href={`/exchanges/${meeting.exchange.id}`} key={meeting.id} className="block">
                        <div className="bg-slate-900/60 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-200 group relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50 group-hover:bg-indigo-400 transition-colors"></div>
                          
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs text-indigo-400 font-bold mb-1">{dateStr} • {timeStr}</p>
                              <p className="text-sm font-medium text-white mb-1 truncate">Bersama {partner.name}</p>
                              {meeting.platform_link && (
                                <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate max-w-[150px]">
                                  <span>🔗</span> Ada Tautan Rapat
                                </p>
                              )}
                            </div>
                            <div className="bg-slate-800 w-10 h-10 rounded-lg flex flex-col items-center justify-center border border-white/5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">{dateObj.toLocaleDateString('id-ID', { month: 'short' })}</span>
                              <span className="text-sm font-black text-white leading-none">{dateObj.getDate()}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </AuthProvider>
  );
}
