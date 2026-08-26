import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import { Prisma } from "@prisma/client";
import { Handshake, Flame, CheckCircle } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations/Stagger";

type ExchangePayload = Prisma.ExchangeGetPayload<{
  include: {
    participant_a: true,
    participant_b: true,
    proposal: {
      include: {
        offered_skill: true,
        requested_skill: true,
      }
    },
    milestones: true,
  }
}>;

export default async function ExchangesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser) redirect("/");

  const exchanges = await prisma.exchange.findMany({
    where: {
      OR: [
        { participant_a_id: currentUser.id },
        { participant_b_id: currentUser.id },
      ]
    },
    include: {
      participant_a: true,
      participant_b: true,
      proposal: {
        include: {
          offered_skill: true,
          requested_skill: true,
        }
      },
      milestones: true,
    },
    orderBy: { created_at: 'desc' }
  });

  const activeExchanges = exchanges.filter((e: ExchangePayload) => e.status === "ONGOING");
  const completedExchanges = exchanges.filter((e: ExchangePayload) => e.status === "COMPLETED");

  const ExchangeCard = ({ exchange }: { exchange: ExchangePayload }) => {
    // Tentukan siapa partner dari pertukaran ini
    const isParticipantA = exchange.participant_a_id === currentUser.id;
    const partner = isParticipantA ? exchange.participant_b : exchange.participant_a;
    
    // Tentukan skill yang kita pelajari dan ajarkan (berdasarkan proposal awal)
    // Jika kita adalah sender (participant A), kita ingin requested_skill, menawarkan offered_skill
    // Jika kita adalah receiver (participant B), kita ingin offered_skill, menawarkan requested_skill
    const weLearn = isParticipantA ? exchange.proposal.requested_skill : exchange.proposal.offered_skill;
    const weTeach = isParticipantA ? exchange.proposal.offered_skill : exchange.proposal.requested_skill;

    return (
      <StaggerItem className="h-full">
        <Link href={`/exchanges/${exchange.id}`} className="block h-full">
          <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-6 shadow-[0_0_30px_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:border-[#D946EF]/30 hover:bg-white/[0.02] transition-all duration-300 flex flex-col gap-4 relative h-full overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full blur-2xl pointer-events-none group-hover:bg-[#D946EF]/5 transition-colors"></div>
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-[#D946EF]/30 transition-colors"></div>
          
          <div className="absolute top-4 right-4 z-10">
            {exchange.status === "ONGOING" ? (
              <span className="bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span> Berjalan
              </span>
            ) : (
              <span className="bg-[#D946EF]/10 text-[#D946EF] border border-[#D946EF]/30 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">
                Selesai
              </span>
            )}
          </div>
          
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1 font-mono">Partner Pertukaran:</p>
            <h3 className="font-bold text-xl text-white">{partner.name}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
              {partner.major} &bull; {partner.university}
            </p>
          </div>
          
          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-sm space-y-3 shadow-inner flex-1 mt-2 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Kamu Belajar:</span> 
              <span className="font-semibold text-[#D946EF] bg-[#D946EF]/10 px-4 py-2 rounded-xl inline-block border border-[#D946EF]/20 w-fit shadow-[0_0_10px_rgba(217,70,239,0.1)]">{weLearn.name}</span>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Kamu Mengajar:</span> 
              <span className="font-semibold text-indigo-300 bg-indigo-900/30 px-4 py-2 rounded-xl inline-block border border-indigo-500/20 w-fit shadow-[0_0_10px_rgba(99,102,241,0.1)]">{weTeach.name}</span>
            </div>
          </div>
          
          <div className="text-xs text-slate-400 mt-2 flex justify-between items-center px-1">
            <span>Dibuat: {new Date(exchange.created_at).toLocaleDateString('id-ID')}</span>
            <span className="font-semibold text-indigo-300">{exchange.milestones?.length || 0} Milestone</span>
          </div>
          </div>
        </Link>
      </StaggerItem>
    );
  };

  return (
    <AuthProvider>
      <main className="min-h-screen bg-[#0B061A] text-white p-6 md:p-12 relative overflow-hidden pb-20 selection:bg-indigo-500/30">
        <div className="absolute top-0 right-1/3 w-[30rem] h-[30rem] bg-[#D946EF]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-transparent backdrop-blur-3xl p-6 rounded-3xl border-t border-l border-white/10 border-b-0 border-r-0 gap-4 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden z-50">
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="relative z-10 flex-1">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Handshake size={28} className="text-[#D946EF]" /> <span className="text-[#D946EF]">Ruang Pertukaran</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm font-medium">Kelola sesi pertukaran skill yang sedang berjalan dengan partner Anda.</p>
            </div>
            <Link href="/" className="relative z-10 bg-white/5 hover:bg-white/10 text-white font-semibold px-5 py-2.5 min-h-[44px] rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 ease-in-out border border-white/10 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] flex items-center justify-center">
              &larr; Kembali ke Dasbor
            </Link>
          </div>

          <div className="space-y-12">
            {/* ACTIVE EXCHANGES */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold border-b border-white/10 pb-3 text-white flex items-center gap-2">
                <Flame size={20} className="text-orange-500" /> Pertukaran Aktif
              </h2>
              {activeExchanges.length === 0 ? (
                <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-8 text-center text-slate-400 font-medium shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
                  <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <span className="relative z-10">Tidak ada pertukaran yang sedang aktif saat ini.</span>
                </div>
              ) : (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeExchanges.map((ex: ExchangePayload) => <ExchangeCard key={ex.id} exchange={ex} />)}
                </StaggerContainer>
              )}
            </section>

            {/* COMPLETED EXCHANGES */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold border-b border-white/10 pb-3 text-white flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-500" /> Riwayat Pertukaran
              </h2>
              {completedExchanges.length === 0 ? (
                <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-8 text-center text-slate-400 font-medium shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
                  <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <span className="relative z-10">Belum ada riwayat pertukaran yang diselesaikan.</span>
                </div>
              ) : (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                  {completedExchanges.map((ex: ExchangePayload) => <ExchangeCard key={ex.id} exchange={ex} />)}
                </StaggerContainer>
              )}
            </section>
          </div>
        </div>
      </main>
    </AuthProvider>
  );
}
