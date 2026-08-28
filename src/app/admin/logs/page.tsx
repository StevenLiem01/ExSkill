"use client";

import React, { useState, useEffect } from "react";
import { Download, AlertTriangle, Info, AlertCircle, RefreshCw, FileText, User } from "lucide-react";
import toast from "react-hot-toast";

type LogLevel = "INFO" | "WARN" | "ERROR";
type LogCategory = "SYSTEM" | "AUTH" | "USER_ACTION" | "ADMIN_ACTION";

interface SystemLog {
  id: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  details: string | null;
  user_id: string | null;
  created_at: string;
  user?: {
    name: string;
    email: string;
  } | null;
}

const CATEGORIES: { id: LogCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "Semua Log" },
  { id: "SYSTEM", label: "System" },
  { id: "AUTH", label: "Auth" },
  { id: "USER_ACTION", label: "User Activity" },
  { id: "ADMIN_ACTION", label: "Admin Actions" },
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<LogCategory | "ALL">("ALL");
  const [searchUserId, setSearchUserId] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "ALL") params.append("category", activeCategory);
      if (searchUserId) params.append("userId", searchUserId);

      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil log");
      
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      toast.error("Gagal memuat log sistem.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeCategory]); // Re-fetch on tab change

  const handleExport = () => {
    const params = new URLSearchParams();
    if (activeCategory !== "ALL") params.append("category", activeCategory);
    if (searchUserId) params.append("userId", searchUserId);
    
    // Trigger download via anchor tag
    const url = `/api/admin/logs/export?${params.toString()}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "exskill-logs.txt"; // This is a fallback; Content-Disposition from server takes precedence
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Mengekspor file .txt...");
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case "ERROR": return <AlertCircle size={16} className="text-red-500" />;
      case "WARN": return <AlertTriangle size={16} className="text-amber-500" />;
      case "INFO": return <Info size={16} className="text-blue-500" />;
    }
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case "ERROR": return "bg-red-500/10 text-red-500 border-red-500/30";
      case "WARN": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "INFO": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="text-indigo-500" />
            System Logs
          </h1>
          <p className="text-slate-400">Pemantauan aktivitas pengguna dan *error* sistem.</p>
        </div>
        
        <button
          onClick={handleExport}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all whitespace-nowrap"
        >
          <Download size={18} /> Export (.txt)
        </button>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 mb-6 shadow-xl flex flex-col md:flex-row justify-between gap-4">
        <div className="flex overflow-x-auto custom-scrollbar pb-2 md:pb-0 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.id 
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/50" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-transparent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={16} className="text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Filter by User ID..."
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>
          <button 
            onClick={fetchLogs}
            className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-white/10"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-xs uppercase border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Timestamp</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Level</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Category</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Action</th>
                <th className="px-6 py-4 font-semibold tracking-wider">User</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-indigo-500/50" />
                    Memuat logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada log ditemukan untuk filter ini.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {new Date(log.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${getLevelBadge(log.level)}`}>
                        {getLevelIcon(log.level)}
                        <span className="font-bold text-[10px]">{log.level}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-400">
                      {log.category}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div className="flex flex-col">
                          <span className="text-indigo-400 font-bold truncate max-w-[150px]">{log.user.name}</span>
                          <span className="text-slate-500 text-[10px] truncate max-w-[150px]">{log.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">SYSTEM</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.details ? (
                        <div className="max-w-xs truncate text-slate-400" title={log.details}>
                          {log.details}
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
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
  );
}
