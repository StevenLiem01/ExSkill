"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface StatsData {
  totalUsers: number;
  totalExchanges: number;
  totalSkills: number;
}

function Counter({ from = 0, to }: { from?: number; to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  
  const spring = useSpring(from, { 
    bounce: 0, 
    duration: 2500 
  });
  
  const displayValue = useTransform(spring, (current) => Math.round(current).toLocaleString("id-ID"));

  useEffect(() => {
    if (inView) {
      spring.set(to);
    }
  }, [inView, spring, to]);

  return <motion.span ref={ref}>{displayValue}</motion.span>;
}

export default function LiveStats() {
  const [stats, setStats] = useState<StatsData>({ totalUsers: 0, totalExchanges: 0, totalSkills: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/public/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch live stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="py-12 relative z-20 border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center p-4"
          >
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-2">
              {loading ? "..." : <Counter to={stats.totalUsers} />}
            </div>
            <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Pengguna Terdaftar</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center p-4"
          >
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#D946EF] mb-2">
              {loading ? "..." : <Counter to={stats.totalExchanges} />}+
            </div>
            <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Pertukaran Sukses</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center justify-center p-4"
          >
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
              {loading ? "..." : <Counter to={stats.totalSkills} />}
            </div>
            <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Keahlian Tersedia</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
