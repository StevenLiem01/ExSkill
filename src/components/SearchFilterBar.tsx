"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params if present
  const initialQ = searchParams.get("q") || "";
  const initialMinScore = searchParams.get("min_score") || "0";
  const initialSort = searchParams.get("sort") || "newest";

  const [q, setQ] = useState(initialQ);
  const [minScore, setMinScore] = useState(initialMinScore);
  const [sort, setSort] = useState(initialSort);

  // Debounce search input changes slightly
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function applyFilters() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (minScore !== "0") params.set("min_score", minScore);
    if (sort !== "newest") params.set("sort", sort);

    const queryString = params.toString();
    const url = queryString ? `/explore?${queryString}` : "/explore";
    
    // Only push if different from current
    if (searchParams.toString() !== queryString) {
      router.push(url, { scroll: false });
    }
  }

  const handleMinScoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinScore(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
  };

  // Trigger applyFilters when dropdowns change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minScore, sort]);

  return (
    <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.1)] flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full group">
        <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-purple-400 transition-colors">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama partner atau keahlian (misal: Python)..."
          className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
        />
      </div>

      <div className="flex gap-4 w-full md:w-auto">
        <div className="flex flex-col gap-1 w-full md:w-40">
          <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Min. Reputasi</label>
          <select
            value={minScore}
            onChange={handleMinScoreChange}
            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 appearance-none cursor-pointer shadow-inner transition-all"
          >
            <option value="0">Semua</option>
            <option value="10">&gt; 10 Pts</option>
            <option value="50">&gt; 50 Pts</option>
            <option value="100">&gt; 100 Pts</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full md:w-48">
          <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Urutkan Berdasarkan</label>
          <select
            value={sort}
            onChange={handleSortChange}
            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 appearance-none cursor-pointer shadow-inner transition-all"
          >
            <option value="newest">Terbaru</option>
            <option value="score_desc">Trust Score (Tertinggi)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
