import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import ReviewForm from "@/components/ReviewForm";
import SessionControl from "@/components/SessionControl";
import ExchangeTabs from "./ExchangeTabs";
import CompleteExchangeButton from "@/components/CompleteExchangeButton";

export default async function ExchangeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: exchangeId } = await params;

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser) redirect("/");

  const exchange = await prisma.exchange.findUnique({
    where: { id: exchangeId },
    include: {
      participant_a: true,
      participant_b: true,
      proposal: {
        include: {
          offered_skill: true,
          requested_skill: true,
        }
      },
      reviews: true
    }
  });

  if (!exchange) redirect("/exchanges");
  if (exchange.participant_a_id !== currentUser.id && exchange.participant_b_id !== currentUser.id) {
    redirect("/exchanges");
  }

  const isParticipantA = exchange.participant_a_id === currentUser.id;
  const partner = isParticipantA ? exchange.participant_b : exchange.participant_a;

  const weLearn = isParticipantA ? exchange.proposal.requested_skill : exchange.proposal.offered_skill;
  const weTeach = isParticipantA ? exchange.proposal.offered_skill : exchange.proposal.requested_skill;

  const existingReview = exchange.reviews.find((r: any) => r.reviewer_id === currentUser.id);

  return (
    <AuthProvider>
      <main className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 relative overflow-hidden pb-20">
        {/* Dekorasi Latar */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-100/50 rounded-full blur-3xl mix-blend-multiply pointer-events-none transition-all"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-100/50 rounded-full blur-3xl mix-blend-multiply pointer-events-none transition-all"></div>

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">

          <div className="flex justify-between items-center">
            <Link href="/exchanges" className="text-slate-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 text-sm font-semibold py-2 px-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              &larr; Kembali ke Daftar Pertukaran
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            
            {/* HEADER RUANG KERJA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-3xl font-bold text-slate-900">
                Ruang Kerja: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{partner.name}</span>
              </h1>
              <CompleteExchangeButton 
                exchangeId={exchange.id} 
                isCompleted={exchange.status === "COMPLETED"} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* KOLOM KIRI: Ruang Kerja Utama (Tabs: Chat & Milestone) */}
              <div className="lg:col-span-2 flex flex-col">
                <ExchangeTabs 
                  exchangeId={exchange.id} 
                  currentUserId={currentUser.id} 
                  sessionStatus={exchange.session_status} 
                />
              </div>

              {/* KOLOM KANAN: Kontrol Sesi & Info */}
              <div className="space-y-6 flex flex-col">
                <SessionControl exchange={exchange} currentUser={currentUser} />

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3">Kontak Partner</h3>
                  <div>
                    <a href={`mailto:${partner.email}`} className="text-blue-600 hover:text-blue-700 font-semibold break-all text-sm transition-colors focus:outline-none focus:underline">
                      {partner.email}
                    </a>
                    <p className="text-xs text-slate-500 mt-1.5 font-medium">{partner.major} di {partner.university}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3">Target Pertukaran</h3>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Anda Mengajarkan:</p>
                    <div className="bg-purple-50 border border-purple-200 text-purple-700 px-3.5 py-1.5 rounded-lg text-sm font-semibold inline-block shadow-sm">
                      {weTeach.name}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2 mt-4">Anda Mempelajari:</p>
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 rounded-lg text-sm font-semibold inline-block shadow-sm">
                      {weLearn.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {exchange.status === "COMPLETED" && (
              <div className="mt-10 border-t border-slate-100 pt-10">
                <ReviewForm exchangeId={exchange.id} existingReview={existingReview} />
              </div>
            )}
          </div>
        </div>
      </main>
    </AuthProvider>
  );
}