"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import Link from "next/link";
import { Crown, Users, RefreshCw, Flag, Shield, Scale } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalExchanges: number;
  pendingReports: number;
  openDisputes: number;
}

function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetch("/api/admin/stats")
        .then(res => {
          if (!res.ok) throw new Error("Gagal mengambil data statistik");
          return res.json();
        })
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D946EF] mb-4"></div>
        <p className="text-slate-400 animate-pulse">Memuat Pusat Kendali...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 relative overflow-hidden">
      {/* Dekorasi Latar */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-[#D946EF]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Crown size={24} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Pusat Kendali Admin</h1>
              <p className="text-sm text-slate-400">Selamat datang, {session?.user?.name || "Admin"}</p>
            </div>
          </div>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-sm font-semibold transition-colors border border-white/10">
            Kembali ke Beranda
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-[#D946EF]/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">Total Pengguna</p>
              <Users size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-4xl font-black text-white">{stats?.totalUsers || 0}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">Sesi Pertukaran</p>
              <RefreshCw size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-4xl font-black text-white">{stats?.totalExchanges || 0}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-red-500/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">Laporan & Sengketa</p>
              <Flag size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-white">{stats ? stats.pendingReports + stats.openDisputes : 0}</p>
              {stats && (stats.pendingReports > 0 || stats.openDisputes > 0) ? (
                <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-md mb-1">Perlu Aksi</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-white/10 mt-10">
          <h2 className="text-lg font-bold text-white mb-6">Menu Moderasi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users" className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:bg-slate-700/50 transition-all text-left">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                <Shield size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">Pengguna</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">Blokir atau pantau aktivitas pengguna</p>
              </div>
            </Link>
            
            <Link href="/admin/reports" className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:bg-slate-700/50 transition-all text-left">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 flex-shrink-0">
                <Scale size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">Laporan</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">Tinjau keluhan dan tindak pelanggaran</p>
              </div>
            </Link>

            <Link href="/admin/disputes" className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:bg-slate-700/50 transition-all text-left">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
                <Flag size={24} className="text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">Sengketa</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">Mediasi konflik antar partisipan</p>
              </div>
            </Link>

            <Link href="/admin/skills" className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:bg-slate-700/50 transition-all text-left">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                <Crown size={24} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">Master Keahlian</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">Kelola referensi nama keahlian</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminDashboard />
    </AuthProvider>
  );
}
