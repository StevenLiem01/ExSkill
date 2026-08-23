"use client";
import toast from "react-hot-toast";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import Link from "next/link";
import { Scale } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  is_banned?: boolean;
}

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  details: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  created_at: string;
  reporter: User;
  reported_user: User;
}

function ModerationDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      if (!res.ok) throw new Error("Gagal mengambil data laporan");
      const data = await res.json();
      setReports(data);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchReports();
    }
  }, [status, session, router]);

  const handleAction = async (id: string, action: "RESOLVE" | "DISMISS", userName: string) => {
    if (action === "RESOLVE") {
      const confirm = window.confirm(`PERINGATAN!\n\nAnda akan memblokir pengguna "${userName}". Aksi ini akan melarang mereka mengakses fitur aplikasi. Lanjutkan?`);
      if (!confirm) return;
    } else {
      const confirm = window.confirm(`Abaikan laporan terhadap "${userName}"?`);
      if (!confirm) return;
    }

    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (!res.ok) throw new Error("Gagal memproses aksi laporan");
      
      // Refresh list
      fetchReports();
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : "Unknown error"));
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D946EF] mb-4"></div>
        <p className="text-slate-400 animate-pulse">Memuat Data Moderasi...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 relative overflow-hidden">
      {/* Dekorasi */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
              <Scale size={24} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Moderasi Laporan</h1>
              <p className="text-sm text-slate-400">Tinjau laporan masuk dan blokir pengguna pelanggar.</p>
            </div>
          </div>
          <Link href="/admin" className="px-5 py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-sm font-semibold transition-colors border border-white/10">
            Kembali ke Dasbor Admin
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-white/10">
                  <th className="p-4 font-semibold text-center border border-white/10">Waktu</th>
                  <th className="p-4 font-semibold text-center border border-white/10">Pelapor</th>
                  <th className="p-4 font-semibold text-center border border-white/10">Terlapor</th>
                  <th className="p-4 font-semibold text-center border border-white/10">Alasan</th>
                  <th className="p-4 font-semibold text-center border border-white/10">Detail</th>
                  <th className="p-4 font-semibold text-center border border-white/10">Status</th>
                  <th className="p-4 font-semibold text-center border border-white/10">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 border border-white/10">
                      Tidak ada laporan yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="p-4 border border-white/10 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(report.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 border border-white/10">
                        <div className="flex items-center gap-3">
                          {report.reporter.image ? (
                            <img src={report.reporter.image} alt={report.reporter.name} width={32} height={32} className="rounded-full bg-slate-700" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold border border-indigo-500/50">
                              {report.reporter.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="text-sm">
                            <p className="font-semibold text-white">{report.reporter.name}</p>
                            <p className="text-slate-500 text-xs">{report.reporter.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border border-white/10">
                        <div className="flex items-center gap-3">
                          {report.reported_user.image ? (
                            <img src={report.reported_user.image} alt={report.reported_user.name} width={32} height={32} className="rounded-full bg-slate-700" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold border border-red-500/50">
                              {report.reported_user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="text-sm">
                            <p className="font-semibold text-white">
                              {report.reported_user.name}
                              {report.reported_user.is_banned && (
                                <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">BANNED</span>
                              )}
                            </p>
                            <p className="text-slate-500 text-xs">{report.reported_user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border border-white/10 text-sm text-slate-300 font-medium">
                        {report.reason}
                      </td>
                      <td className="p-4 border border-white/10 text-sm text-slate-400 max-w-xs truncate">
                        {report.details || "-"}
                      </td>
                      <td className="p-4 border border-white/10">
                        {report.status === "PENDING" && (
                          <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">PENDING</span>
                        )}
                        {report.status === "RESOLVED" && (
                          <span className="text-xs font-bold text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">RESOLVED</span>
                        )}
                        {report.status === "DISMISSED" && (
                          <span className="text-xs font-bold text-slate-400 bg-slate-400/10 px-3 py-1 rounded-full border border-slate-400/20">DISMISSED</span>
                        )}
                      </td>
                      <td className="p-4 border border-white/10 text-right">
                        {report.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(report.id, "DISMISS", report.reported_user.name)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors"
                            >
                              Abaikan
                            </button>
                            <button
                              onClick={() => handleAction(report.id, "RESOLVE", report.reported_user.name)}
                              className="px-3 py-1.5 text-xs font-semibold text-red-100 bg-red-600/80 hover:bg-red-500 rounded-lg transition-colors border border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                            >
                              Blokir Pengguna
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Sudah ditindak</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ReportsModerationPage() {
  return (
    <AuthProvider>
      <ModerationDashboard />
    </AuthProvider>
  );
}
