"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

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
    <div className="relative z-50 bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.1)] flex flex-col md:flex-row gap-4 items-center">
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

      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <div className="flex flex-col gap-1 w-full md:w-48 relative z-30">
          <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Min. Reputasi</label>
          <CustomSelect
            value={minScore}
            onChange={(val) => setMinScore(val)}
            options={[
              { value: "0", label: "Semua" },
              { value: "10", label: "> 10 Pts" },
              { value: "50", label: "> 50 Pts" },
              { value: "100", label: "> 100 Pts" }
            ]}
            glowVariant="primary"
          />
        </div>

        <div className="flex flex-col gap-1 w-full md:w-56 relative z-20">
          <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Urutkan Berdasarkan</label>
          <CustomSelect
            value={sort}
            onChange={(val) => setSort(val)}
            options={[
              { value: "newest", label: "Terbaru" },
              { value: "score_desc", label: "Trust Score (Tertinggi)" }
            ]}
            glowVariant="secondary"
          />
        </div>
      </div>
    </div>
  );
}
