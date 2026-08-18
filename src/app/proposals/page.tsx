import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import ProposalActions from "@/components/ProposalActions";

export default async function ProposalsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser) redirect("/");

  // Ambil proposal masuk
  const incoming = await prisma.exchangeProposal.findMany({
    where: { receiver_id: currentUser.id },
    include: {
      sender: true,
      offered_skill: true,
      requested_skill: true,
    },
    orderBy: { created_at: 'desc' }
  });

  // Ambil proposal keluar (terkirim)
  const outgoing = await prisma.exchangeProposal.findMany({
    where: { sender_id: currentUser.id },
    include: {
      receiver: true,
      offered_skill: true,
      requested_skill: true,
    },
    orderBy: { created_at: 'desc' }
  });

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "ACCEPTED") return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider shadow-sm">Diterima</span>;
    if (status === "REJECTED") return <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider shadow-sm">Ditolak</span>;
    if (status === "CANCELLED") return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider shadow-sm">Dibatalkan</span>;
    return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider shadow-sm animate-pulse">Menunggu</span>;
  };

  return (
    <AuthProvider>
      <main className="min-h-screen bg-slate-900 text-slate-50 p-6 md:p-12 relative overflow-hidden pb-20">
        {/* Dekorasi Latar */}
        <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-all"></div>
        <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-[#00DF9A]/10 rounded-full blur-3xl pointer-events-none transition-all"></div>

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 gap-6 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out relative z-50">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                📥 <span className="text-[#00DF9A]">Kotak Masuk Proposal</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm font-medium">Kelola permintaan pertukaran skill yang masuk dan keluar.</p>
            </div>
            <Link href="/" className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 min-h-[44px] rounded-xl shadow-sm transition-all duration-200 ease-in-out border border-white/10 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 flex items-center justify-center">
              &larr; Kembali ke Dasbor
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* INCOMING PROPOSALS */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-white/10 pb-3 text-white flex items-center gap-2">
                <span>📩</span> Proposal Masuk
              </h2>
              {incoming.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center text-slate-400 font-medium shadow-sm">
                  Belum ada proposal pertukaran yang masuk.
                </div>
              ) : incoming.map((p: any) => (
                <div key={p.id} className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-sm hover:border-[#00DF9A]/50 transition-all duration-300 ease-in-out flex flex-col gap-5 relative">
                  <div className="absolute top-6 right-6">
                    <StatusBadge status={p.status} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1 font-mono">Dari:</p>
                    <h3 className="font-bold text-xl text-white">{p.sender.name}</h3>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      {p.sender.major} &bull; {p.sender.university}
                    </p>
                  </div>

                  <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 text-sm space-y-4 shadow-inner">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Dia Ingin Belajar:</span>
                      <span className="font-semibold text-indigo-300 bg-indigo-900/30 px-3 py-1.5 rounded-lg inline-block border border-indigo-500/30 w-fit shadow-sm">{p.requested_skill.name}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Sebagai Gantinya Menawarkan:</span>
                      <span className="font-semibold text-[#00DF9A] bg-[#00DF9A]/10 px-3 py-1.5 rounded-lg inline-block border border-[#00DF9A]/30 w-fit shadow-sm">{p.offered_skill.name}</span>
                    </div>
                  </div>

                  {p.message && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Pesan Perkenalan:</p>
                      <div className="text-sm font-medium italic text-slate-300 bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/20 leading-relaxed relative">
                        <span className="absolute -top-1 left-3 text-3xl text-indigo-500/30 font-serif">"</span>
                        <span className="relative z-10">{p.message}</span>
                      </div>
                    </div>
                  )}

                  {p.status === "PENDING" && <ProposalActions proposalId={p.id} />}
                </div>
              ))}
            </div>

            {/* OUTGOING PROPOSALS */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-white/10 pb-3 text-white flex items-center gap-2">
                <span>📤</span> Proposal Terkirim
              </h2>
              {outgoing.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center text-slate-400 font-medium shadow-sm">
                  Kamu belum pernah mengajukan proposal pertukaran.
                </div>
              ) : outgoing.map((p: any) => (
                <div key={p.id} className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-sm hover:border-[#00DF9A]/50 transition-all duration-300 ease-in-out flex flex-col gap-5 relative opacity-90 hover:opacity-100">
                  <div className="absolute top-6 right-6">
                    <StatusBadge status={p.status} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1 font-mono">Dikirim ke:</p>
                    <h3 className="font-bold text-lg text-white">{p.receiver.name}</h3>
                  </div>

                  <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 text-sm space-y-4 shadow-inner">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Kamu Ingin Belajar:</span>
                      <span className="font-semibold text-[#00DF9A] bg-[#00DF9A]/10 px-3 py-1.5 rounded-lg inline-block border border-[#00DF9A]/30 w-fit shadow-sm">{p.requested_skill.name}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Kamu Menawarkan:</span>
                      <span className="font-semibold text-indigo-300 bg-indigo-900/30 px-3 py-1.5 rounded-lg inline-block border border-indigo-500/30 w-fit shadow-sm">{p.offered_skill.name}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-medium mt-2">
                    Dikirim pada: {new Date(p.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AuthProvider>
  );
}