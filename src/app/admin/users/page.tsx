"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import Link from "next/link";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  is_banned: boolean;
  trust_score: number;
  created_at: string;
}

function UsersManagementDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Gagal mengambil data pengguna");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
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
      fetchUsers();
    }
  }, [status, session, router]);

  const handleToggleBan = async (id: string, name: string, isCurrentlyBanned: boolean) => {
    const actionText = isCurrentlyBanned ? "Membuka blokir" : "Memblokir";
    const confirm = window.confirm(`PERINGATAN!\n\nAnda akan ${actionText.toLowerCase()} pengguna "${name}". Lanjutkan?`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/admin/users/${id}/toggle-ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Gagal ${actionText.toLowerCase()} pengguna`);
      }
      
      // Refresh list
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00DF9A] mb-4"></div>
        <p className="text-slate-400 animate-pulse">Memuat Data Pengguna...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 relative overflow-hidden">
      {/* Dekorasi */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen Pengguna</h1>
              <p className="text-sm text-slate-400">Pantau populasi dan kontrol akses anggota ExSkill.</p>
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
                  <th className="p-4 font-semibold text-center border border-white/10">Terdaftar</th>
                  <th className="p-4 font-semibold text-center border border-white/10">Pengguna</th>
                  <th className="p-4 font-semibold text-center border border-white/10">Role</th>
                  <th className="p-4 font-semibold text-center border border-white/10">Trust Score</th>
                  <th className="p-4 font-semibold text-center border border-white/10">Status</th>
                  <th className="p-4 font-semibold text-center border border-white/10">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 border border-white/10">
                      Tidak ada pengguna yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="p-4 border border-white/10 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 border border-white/10">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img src={user.image} alt={user.name} width={32} height={32} className="rounded-full bg-slate-700" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold border border-indigo-500/50">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="text-sm">
                            <p className="font-semibold text-white">
                              {user.name}
                              {session?.user?.id === user.id && (
                                <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">ANDA</span>
                              )}
                            </p>
                            <p className="text-slate-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border border-white/10">
                        {user.role === "ADMIN" ? (
                          <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">ADMIN</span>
                        ) : (
                          <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">USER</span>
                        )}
                      </td>
                      <td className="p-4 border border-white/10 text-center font-mono text-[#00DF9A]">
                        {user.trust_score}
                      </td>
                      <td className="p-4 border border-white/10">
                        {user.is_banned ? (
                          <span className="text-xs font-bold text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">BANNED</span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">ACTIVE</span>
                        )}
                      </td>
                      <td className="p-4 border border-white/10 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {user.is_banned ? (
                            <button
                              onClick={() => handleToggleBan(user.id, user.name, user.is_banned)}
                              disabled={session?.user?.id === user.id}
                              className="px-4 py-1.5 text-xs font-bold text-emerald-100 bg-emerald-600/80 hover:bg-emerald-500 rounded-lg transition-colors border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Unban User
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleBan(user.id, user.name, user.is_banned)}
                              disabled={session?.user?.id === user.id}
                              className="px-4 py-1.5 text-xs font-bold text-red-100 bg-red-600/80 hover:bg-red-500 rounded-lg transition-colors border border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Ban User
                            </button>
                          )}
                        </div>
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

export default function UsersManagementPage() {
  return (
    <AuthProvider>
      <UsersManagementDashboard />
    </AuthProvider>
  );
}
