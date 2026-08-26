import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import ProposalActions from "@/components/ProposalActions";
import { Prisma } from "@prisma/client";
import { Inbox, Send, Calendar } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations/Stagger";

export default async function ProposalsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser) redirect("/");

  // Determine active tab
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab === 'outgoing' ? 'outgoing' : 'incoming';

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
      <main className="min-h-screen bg-[#0B061A] text-slate-50 p-6 md:p-12 relative overflow-hidden pb-20 selection:bg-[#D946EF]/30">
        {/* Dekorasi Latar */}
        <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none transition-all"></div>
        <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-[#D946EF]/10 rounded-full blur-[120px] pointer-events-none transition-all"></div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-transparent backdrop-blur-3xl p-6 rounded-3xl border-t border-l border-white/10 border-b-0 border-r-0 gap-6 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden z-50">
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="relative z-10 flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <Inbox size={28} className="text-[#D946EF]" /> <span className="text-[#D946EF]">Kotak Masuk Proposal</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm font-medium">Kelola permintaan pertukaran skill yang masuk dan keluar.</p>
            </div>
            <Link href="/" className="relative z-10 bg-white/5 hover:bg-white/10 text-white font-semibold px-5 py-2.5 min-h-[44px] rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 ease-in-out border border-white/10 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] flex items-center justify-center">
              &larr; Kembali
            </Link>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex border-b border-white/10 w-full mb-6 relative z-50">
            <Link 
              href="?tab=incoming" 
              className={`flex-1 text-center py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'incoming' ? 'text-[#D946EF] border-[#D946EF]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
            >
              <Inbox size={18} className="inline mr-2 mb-0.5" /> Proposal Masuk ({incoming.length})
            </Link>
            <Link 
              href="?tab=outgoing" 
              className={`flex-1 text-center py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'outgoing' ? 'text-[#D946EF] border-[#D946EF]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
            >
              <Send size={18} className="inline mr-2 mb-0.5" /> Proposal Terkirim ({outgoing.length})
            </Link>
          </div>

          <div>
            {/* INCOMING PROPOSALS */}
            {activeTab === 'incoming' && (
              <StaggerContainer className="space-y-6">
                {incoming.length === 0 ? (
                  <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-12 text-center text-slate-400 font-medium shadow-[0_0_30px_rgba(255,255,255,0.02)] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <Inbox size={48} className="opacity-50 text-slate-300 relative z-10" />
                    <p className="relative z-10">Belum ada proposal pertukaran yang masuk.</p>
                  </div>
                ) : incoming.map((p: Prisma.ExchangeProposalGetPayload<{ include: { sender: true, offered_skill: true, requested_skill: true } }>) => (
                  <StaggerItem key={p.id}>
                    <div className="bg-transparent backdrop-blur-3xl border-t border-l border-[#D946EF]/20 border-b-0 border-r-0 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(217,70,239,0.02)] hover:shadow-[0_0_20px_rgba(217,70,239,0.1)] hover:border-[#D946EF]/50 transition-all duration-300 flex flex-col gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D946EF]/5 rounded-bl-full blur-2xl pointer-events-none group-hover:bg-[#D946EF]/10 transition-colors"></div>
                    <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#D946EF]/30 to-transparent"></div>
                    
                    <div className="absolute top-6 right-6 z-10">
                      <StatusBadge status={p.status} />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-indigo-500/50 overflow-hidden shadow-sm flex-shrink-0">
                        {p.sender.image ? (
                          <img src={p.sender.image} alt={p.sender.name || "Sender"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-400">
                            {(p.sender.name || "U")[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1 font-mono">Dari:</p>
                        <h3 className="font-bold text-xl text-white">{p.sender.name}</h3>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          {p.sender.major} &bull; {p.sender.university}
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5 text-sm space-y-4 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Dia Ingin Belajar:</span>
                        <span className="font-semibold text-indigo-300 bg-indigo-900/30 px-4 py-2 rounded-xl border border-indigo-500/30 w-fit shadow-[0_0_10px_rgba(99,102,241,0.1)]">{p.requested_skill.name}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Sebagai Gantinya Menawarkan:</span>
                        <span className="font-semibold text-[#D946EF] bg-[#D946EF]/10 px-4 py-2 rounded-xl border border-[#D946EF]/30 w-fit shadow-[0_0_10px_rgba(217,70,239,0.1)]">{p.offered_skill.name}</span>
                      </div>
                    </div>

                    {p.message && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Pesan Perkenalan:</p>
                        <div className="text-sm font-medium italic text-slate-300 bg-indigo-900/20 p-5 rounded-xl border border-indigo-500/20 leading-relaxed relative">
                          <span className="absolute -top-1 left-3 text-3xl text-indigo-500/30 font-serif">"</span>
                          <span className="relative z-10 block pt-1">{p.message}</span>
                        </div>
                      </div>
                    )}

                    {p.status === "PENDING" && (
                      <div className="pt-2 border-t border-white/10 mt-2">
                        <ProposalActions proposalId={p.id} />
                      </div>
                    )}
                  </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            {/* OUTGOING PROPOSALS */}
            {activeTab === 'outgoing' && (
              <StaggerContainer className="space-y-6">
                {outgoing.length === 0 ? (
                  <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-12 text-center text-slate-400 font-medium shadow-[0_0_30px_rgba(255,255,255,0.02)] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <Send size={48} className="opacity-50 text-slate-300 relative z-10" />
                    <p className="relative z-10">Kamu belum pernah mengajukan proposal pertukaran ke siapa pun.</p>
                  </div>
                ) : outgoing.map((p: Prisma.ExchangeProposalGetPayload<{ include: { receiver: true, offered_skill: true, requested_skill: true } }>) => (
                  <StaggerItem key={p.id}>
                    <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:border-white/30 transition-all duration-300 flex flex-col gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    <div className="absolute top-6 right-6 z-10">
                      <StatusBadge status={p.status} />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-emerald-500/50 overflow-hidden shadow-sm flex-shrink-0">
                        {p.receiver.image ? (
                          <img src={p.receiver.image} alt={p.receiver.name || "Receiver"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-400">
                            {(p.receiver.name || "U")[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1 font-mono">Dikirim ke:</p>
                        <Link href={`/users/${p.receiver.id}`} className="font-bold text-xl text-white hover:text-[#D946EF] transition-colors">{p.receiver.name}</Link>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          {p.receiver.major} &bull; {p.receiver.university}
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5 text-sm space-y-4 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Kamu Ingin Belajar:</span>
                        <span className="font-semibold text-[#D946EF] bg-[#D946EF]/10 px-4 py-2 rounded-xl border border-[#D946EF]/30 w-fit shadow-[0_0_10px_rgba(217,70,239,0.1)]">{p.requested_skill.name}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Kamu Menawarkan:</span>
                        <span className="font-semibold text-indigo-300 bg-indigo-900/30 px-4 py-2 rounded-xl border border-indigo-500/30 w-fit shadow-[0_0_10px_rgba(99,102,241,0.1)]">{p.offered_skill.name}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-medium mt-2 pt-4 border-t border-white/5 flex items-center">
                      <Calendar size={12} className="mr-1" /> Dikirim pada: {new Date(p.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </div>
      </main>
    </AuthProvider>
  );
}