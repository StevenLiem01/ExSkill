import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import { Prisma } from "@prisma/client";
import { Zap, Inbox, Star, Handshake, Calendar, Sprout, Link as LinkIcon } from "lucide-react";

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

  const pendingProposalsCount = await prisma.exchangeProposal.count({
    where: {
      status: "PENDING",
      receiver_id: dbUser.id
    }
  });

  type DashboardExchange = Prisma.ExchangeGetPayload<{
    include: {
      participant_a: true,
      participant_b: true,
      milestones: {
        include: {
          sessions: true
        }
      }
    }
  }>;

  // Kumpulkan semua jadwal terdekat dari seluruh exchange aktif melalui milestones
  const upcomingMeetings = activeExchanges
    .flatMap(ex => ex.milestones.flatMap(m => m.sessions.map(s => ({ ...s, exchange: ex }))))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  return (
    <AuthProvider>
      <main className="min-h-screen bg-[#0B061A] text-slate-50 p-6 md:p-12 relative overflow-hidden pb-20 selection:bg-purple-500/30">
        <div className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[30rem] h-[30rem] bg-fuchsia-600/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          
          {/* HEADER & WELCOME */}
          <header className="mb-6 px-2 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-600/20 border-2 border-purple-400/50 flex items-center justify-center text-xl font-bold text-white overflow-hidden shadow-[0_0_10px_rgba(168,85,247,0.3)] flex-shrink-0">
              {dbUser.image ? (
                <img src={dbUser.image} alt={dbUser.name || "User"} className="w-full h-full object-cover" />
              ) : (
                (dbUser.name || "U")[0].toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Dashboard</h1>
              <p className="text-sm font-medium text-slate-400 opacity-80">Welcome back, {dbUser.name} • {dbUser.major}</p>
            </div>
          </header>

          {/* BENTO GRID STATS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min md:auto-rows-[180px] mb-8">
            {/* Card 1: HOLOGRAPHIC GLASS (Total Pertukaran Aktif) */}
            <div className="relative overflow-hidden transition-all duration-300 group rounded-3xl bg-transparent backdrop-blur-3xl border-t border-l border-purple-500/30 border-b-0 border-r-0 p-6 md:p-8 flex flex-col justify-between hover:bg-white/[0.02] hover:border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.05)] md:col-span-8 row-span-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
              <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors text-purple-400">
                      <Zap size={24} />
                    </div>
                    <span className="font-mono text-sm text-slate-400 uppercase tracking-wider font-bold">Total Pertukaran Aktif</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 font-mono text-xs text-purple-400 flex items-center gap-1 font-bold">
                    <span>{activeExchanges.length > 0 ? 'Sedang Berlangsung' : 'Mulai Sekarang'}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="text-5xl md:text-6xl font-black text-white">{activeExchanges.length}</div>
                </div>
              </div>
            </div>

            {/* Card 2: NEON CORE / FLOATING SHADOWS (Proposal Menunggu) */}
            <div className="relative overflow-hidden transition-all duration-500 group rounded-3xl bg-[#090212] border-0 p-6 md:p-8 flex flex-col justify-between hover:-translate-y-2 shadow-[0_0_40px_rgba(217,70,239,0.15)] hover:shadow-[0_0_60px_rgba(217,70,239,0.5)] md:col-span-4 row-span-1">
              {/* Core Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-fuchsia-500/30 rounded-full blur-[80px] group-hover:bg-fuchsia-500/50 transition-all duration-500 pointer-events-none z-0"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center gap-1">
                <div className="w-12 h-12 rounded-full bg-fuchsia-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.8)] group-hover:shadow-[0_0_30px_rgba(217,70,239,1)] group-hover:scale-110 transition-all duration-300">
                  <Inbox size={24} />
                </div>
                <span className="font-sans text-sm text-fuchsia-200 uppercase tracking-widest font-black mt-3 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]">Proposal Masuk</span>
                <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-fuchsia-300 mt-2 drop-shadow-lg">
                  {pendingProposalsCount}
                </div>
              </div>
            </div>

            {/* Card 3: NEON CORE (Trust Score) */}
            <div className="relative overflow-hidden transition-all duration-500 group rounded-3xl bg-[#090212] border-0 p-6 md:p-8 flex flex-col justify-between hover:-translate-y-2 shadow-[0_0_40px_rgba(245,158,11,0.15)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] md:col-span-4 row-span-1">
              {/* Core Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/30 rounded-full blur-[80px] group-hover:bg-amber-500/50 transition-all duration-500 pointer-events-none z-0"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center gap-1">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.8)] group-hover:shadow-[0_0_30px_rgba(245,158,11,1)] group-hover:scale-110 transition-all duration-300">
                  <Star size={24} />
                </div>
                <span className="font-sans text-sm text-amber-200 uppercase tracking-widest font-black mt-3 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">Trust Score Anda</span>
                <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-amber-300 mt-2 drop-shadow-lg flex items-baseline">
                  {dbUser.trust_score} <span className="text-xl text-amber-400 font-medium ml-2">pts</span>
                </div>
              </div>
            </div>

            {/* Card 4: Selesai / Filler (8 cols) - HOLOGRAPHIC GLASS */}
            <div className="relative overflow-hidden transition-all duration-300 group rounded-3xl bg-transparent backdrop-blur-3xl border-t border-l border-[#D946EF]/30 border-b-0 border-r-0 border-dashed hover:border-solid hover:bg-white/[0.02] hover:border-[#D946EF]/60 shadow-[0_0_30px_rgba(217,70,239,0.05)] p-6 md:p-8 flex flex-col justify-center items-center md:col-span-8 row-span-1 text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D946EF]/10 rounded-bl-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center">
                  <Handshake size={32} className="mb-3 opacity-80 text-[#D946EF] transition-colors" />
                  <span className="font-mono text-sm text-slate-400 uppercase tracking-wider font-bold mb-1">Pertukaran Selesai</span>
                  <div className="text-4xl font-black text-white">{completedExchangesCount}</div>
                  <p className="text-xs text-[#D946EF] mt-2 font-medium">Terus tingkatkan kolaborasi Anda!</p>
              </div>
            </div>
          </div>

          {/* Bottom Section: Active Exchanges (Left 60%) & Upcoming Meetings (Right 40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Widget 2: Pertukaran Aktif Saat Ini */}
            <div className="lg:col-span-2 bg-transparent backdrop-blur-3xl p-6 md:p-8 rounded-3xl border-t border-l border-white/10 border-b-0 border-r-0 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
              <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap size={20} className="text-purple-400" /> Pertukaran Aktif Saat Ini
                </h2>
                <Link href="/exchanges" className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4">
                  Lihat Semua
                </Link>
              </div>

              {activeExchanges.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-10 text-center border border-white/5 flex flex-col items-center justify-center">
                  <Sprout size={40} className="mb-4 opacity-50 text-slate-300" />
                  <p className="text-slate-300 font-medium mb-2">Belum ada pertukaran yang aktif.</p>
                  <Link href="/explore" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    Mulai cari partner belajar sekarang! &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeExchanges.map((ex: DashboardExchange) => {
                    const isParticipantA = ex.participant_a_id === dbUser.id;
                    const partner = isParticipantA ? ex.participant_b : ex.participant_a;
                    const totalMilestones = ex.milestones.length;
                    const completedMilestones = ex.milestones.filter(m => m.is_completed).length;
                    const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

                    return (
                      <Link href={`/exchanges/${ex.id}`} key={ex.id} className="block">
                        <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl p-5 transition-all duration-300 group shadow-sm hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:-translate-y-1">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/30 overflow-hidden flex-shrink-0">
                                {partner.image ? (
                                  <img src={partner.image} alt={partner.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                                    {(partner.name || "P")[0]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-sm md:text-base group-hover:text-purple-400 transition-colors">{partner.name}</h3>
                                <p className="text-xs text-slate-400">Belajar bersama</p>
                              </div>
                            </div>
                            <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2 py-1 rounded-full border border-purple-500/20">
                              ACTIVE
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-slate-400 font-mono font-medium">Progres Pembelajaran</span>
                              <span className="text-white font-bold">{progressPercent}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                              <div 
                                className="bg-gradient-to-r from-fuchsia-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
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
            <div className="bg-transparent backdrop-blur-3xl p-6 rounded-3xl border-t border-l border-white/10 border-b-0 border-r-0 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
              <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar size={20} className="text-fuchsia-400" /> Jadwal Terdekat
                </h2>
              </div>

              {upcomingMeetings.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/5">
                  <p className="text-slate-400 text-sm italic">Tidak ada jadwal pertemuan terdekat.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => {
                    const isParticipantA = meeting.exchange.participant_a_id === dbUser.id;
                    const partner = isParticipantA ? meeting.exchange.participant_b : meeting.exchange.participant_a;
                    const dateObj = new Date(meeting.scheduled_at);
                    const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
                    const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <Link href={`/exchanges/${meeting.exchange.id}`} key={meeting.id} className="block">
                        <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl p-4 transition-all duration-200 group relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500/50 group-hover:bg-purple-400 transition-colors"></div>
                          
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs text-purple-400 font-bold mb-1">{dateStr} • {timeStr}</p>
                              <p className="text-sm font-medium text-white mb-1 truncate">Bersama {partner.name}</p>
                              {meeting.meeting_link && (
                                <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-[150px]">
                                  <LinkIcon size={10} /> Ada Tautan Rapat
                                </p>
                              )}
                            </div>
                            <div className="bg-white/5 w-10 h-10 rounded-lg flex flex-col items-center justify-center border border-white/10">
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
