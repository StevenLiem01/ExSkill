import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";

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

  const activeExchanges = exchanges.filter((e: any) => e.status === "ONGOING");
  const completedExchanges = exchanges.filter((e: any) => e.status === "COMPLETED");

  const ExchangeCard = ({ exchange }: { exchange: any }) => {
    // Tentukan siapa partner dari pertukaran ini
    const isParticipantA = exchange.participant_a_id === currentUser.id;
    const partner = isParticipantA ? exchange.participant_b : exchange.participant_a;
    
    // Tentukan skill yang kita pelajari dan ajarkan (berdasarkan proposal awal)
    // Jika kita adalah sender (participant A), kita ingin requested_skill, menawarkan offered_skill
    // Jika kita adalah receiver (participant B), kita ingin offered_skill, menawarkan requested_skill
    const weLearn = isParticipantA ? exchange.proposal.requested_skill : exchange.proposal.offered_skill;
    const weTeach = isParticipantA ? exchange.proposal.offered_skill : exchange.proposal.requested_skill;

    return (
      <Link href={`/exchanges/${exchange.id}`} className="block">
        <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:border-[#00DF9A]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 relative h-full">
          <div className="absolute top-4 right-4">
            {exchange.status === "ONGOING" ? (
              <span className="bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span> Berjalan
              </span>
            ) : (
              <span className="bg-[#00DF9A]/10 text-[#00DF9A] border border-[#00DF9A]/30 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">
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
          
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-sm space-y-3 shadow-inner flex-1 mt-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Kamu Belajar:</span> 
              <span className="font-medium text-[#00DF9A] bg-[#00DF9A]/10 px-3 py-1.5 rounded-lg inline-block border border-[#00DF9A]/20 w-fit">{weLearn.name}</span>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Kamu Mengajar:</span> 
              <span className="font-medium text-indigo-300 bg-indigo-900/30 px-3 py-1.5 rounded-lg inline-block border border-indigo-500/20 w-fit">{weTeach.name}</span>
            </div>
          </div>
          
          <div className="text-xs text-slate-400 mt-2 flex justify-between items-center px-1">
            <span>Dibuat: {new Date(exchange.created_at).toLocaleDateString('id-ID')}</span>
            <span className="font-semibold text-indigo-300">{exchange.milestones?.length || 0} Milestone</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <AuthProvider>
      <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 relative overflow-hidden pb-20">
        <div className="absolute top-0 right-1/3 w-[30rem] h-[30rem] bg-[#00DF9A]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/50 p-6 rounded-2xl border border-white/10 backdrop-blur-md gap-4 shadow-xl relative z-50">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                🤝 <span className="text-[#00DF9A]">Ruang Pertukaran</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm font-medium">Kelola sesi pertukaran skill yang sedang berjalan dengan partner Anda.</p>
            </div>
            <Link href="/" className="bg-slate-700 hover:bg-slate-600 px-5 py-2.5 rounded-xl text-sm text-white font-semibold border border-white/10 transition-colors shadow-sm">
              &larr; Kembali ke Dasbor
            </Link>
          </div>

          <div className="space-y-12">
            {/* ACTIVE EXCHANGES */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold border-b border-white/10 pb-3 text-white flex items-center gap-2">
                <span>🔥</span> Pertukaran Aktif
              </h2>
              {activeExchanges.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center text-slate-400 font-medium">
                  Tidak ada pertukaran yang sedang aktif saat ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeExchanges.map((ex: any) => <ExchangeCard key={ex.id} exchange={ex} />)}
                </div>
              )}
            </section>

            {/* COMPLETED EXCHANGES */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold border-b border-white/10 pb-3 text-white flex items-center gap-2">
                <span>✅</span> Riwayat Pertukaran
              </h2>
              {completedExchanges.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center text-slate-400 font-medium">
                  Belum ada riwayat pertukaran yang diselesaikan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                  {completedExchanges.map((ex: any) => <ExchangeCard key={ex.id} exchange={ex} />)}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </AuthProvider>
  );
}
