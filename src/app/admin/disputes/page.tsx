"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import Link from "next/link";
import { Flag, ArrowLeft, CheckCircle, XCircle, AlertTriangle, ShieldAlert } from "lucide-react";

type Participant = { id: string; name: string; email: string };

interface Dispute {
  id: string;
  exchange_id: string;
  opened_by: string;
  reason: string;
  description: string;
  status: "OPEN" | "RESOLVED" | "REJECTED";
  created_at: string;
  reporter: Participant;
  exchange: {
    participant_a: Participant;
    participant_b: Participant;
  };
}

function AdminDisputes() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchDisputes();
    }
  }, [status, session, router]);

  const fetchDisputes = () => {
    setLoading(true);
    fetch("/api/admin/disputes")
      .then(res => {
        if (!res.ok) throw new Error("Gagal mengambil data sengketa");
        return res.json();
      })
      .then(data => {
        setDisputes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleAction = async (dispute: Dispute, action: "RESOLVED" | "REJECTED") => {
    if (!confirm(`Tindakan ini akan menetapkan status sengketa menjadi ${action}. Lanjutkan?`)) return;

    setProcessingId(dispute.id);
    let penalizedUserId = null;

    if (action === "RESOLVED") {
      // Tentukan siapa lawannya untuk dipenalti
      const isA = dispute.reporter.id === dispute.exchange.participant_a.id;
      const reportedUser = isA ? dispute.exchange.participant_b : dispute.exchange.participant_a;
      
      const applyPenalty = confirm(`Apakah Anda ingin menjatuhkan penalti Trust Score (-15 poin) kepada terlapor (${reportedUser.name})?`);
      if (applyPenalty) {
        penalizedUserId = reportedUser.id;
      }
    }

    try {
      const res = await fetch(`/api/admin/disputes/${dispute.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          resolution: action === "RESOLVED" ? "Dispute resolved by Admin" : "Dispute rejected by Admin",
          penalizedUserId
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal memperbarui sengketa");
      }

      alert(`Sengketa berhasil ditutup dengan status ${action}.`);
      fetchDisputes(); // Refresh data
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0B061A] text-white p-6 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-slate-400">Memuat Sengketa...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B061A] text-white p-6 md:p-12 relative overflow-hidden selection:bg-orange-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 p-6 rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
              <ArrowLeft size={20} className="text-slate-300" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <ShieldAlert size={28} className="text-orange-400" /> Manajemen Sengketa
              </h1>
              <p className="text-sm text-slate-400 mt-1">Tinjau dan mediasi konflik yang terjadi saat pertukaran skill.</p>
            </div>
          </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-12 text-center flex flex-col items-center shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden">
              <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center">
                <Flag size={48} className="opacity-20 text-slate-300 mb-4" />
                <p className="text-slate-300 font-bold text-lg">Tidak ada sengketa</p>
                <p className="text-slate-500 text-sm">Saat ini tidak ada sengketa yang perlu dimediasi.</p>
              </div>
            </div>
          ) : (
            disputes.map(dispute => {
              const isA = dispute.reporter.id === dispute.exchange.participant_a.id;
              const reportedUser = isA ? dispute.exchange.participant_b : dispute.exchange.participant_a;

              return (
                <div key={dispute.id} className="bg-transparent backdrop-blur-3xl border-t border-l border-white/10 border-b-0 border-r-0 rounded-3xl p-6 transition-all shadow-[0_0_30px_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:border-orange-500/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-orange-500/50 transition-colors"></div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          dispute.status === "OPEN" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                          dispute.status === "RESOLVED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                          "bg-slate-700/50 text-slate-400 border-slate-600"
                        }`}>
                          {dispute.status}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(dispute.created_at).toLocaleDateString("id-ID", {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{dispute.reason}</h3>
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-sm text-slate-300">
                          "{dispute.description}"
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Pelapor</p>
                          <p className="text-sm font-medium text-white">{dispute.reporter.name}</p>
                          <p className="text-xs text-slate-400">{dispute.reporter.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-orange-500/80 uppercase font-bold tracking-wider mb-1">Terlapor</p>
                          <p className="text-sm font-medium text-white">{reportedUser?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-400">{reportedUser?.email || "-"}</p>
                        </div>
                      </div>
                    </div>

                    {dispute.status === "OPEN" && (
                      <div className="flex flex-col gap-3 min-w-[200px] border-l border-white/10 pl-6 justify-center">
                        <button
                          onClick={() => handleAction(dispute, "RESOLVED")}
                          disabled={processingId === dispute.id}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={18} /> Resolusi
                        </button>
                        <button
                          onClick={() => handleAction(dispute, "REJECTED")}
                          disabled={processingId === dispute.id}
                          className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <XCircle size={18} /> Tolak Sengketa
                        </button>
                        <p className="text-[10px] text-slate-500 text-center mt-2 leading-relaxed">
                          Anda dapat memilih untuk menjatuhkan penalti *Trust Score* saat melakukan Resolusi.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

export default function AdminDisputesPage() {
  return (
    <AuthProvider>
      <AdminDisputes />
    </AuthProvider>
  );
}
