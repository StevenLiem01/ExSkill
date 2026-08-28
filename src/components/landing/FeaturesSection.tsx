"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

const featureVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <motion.div 
            variants={featureVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="bg-transparent backdrop-blur-3xl border-t border-l border-purple-500/30 border-b-0 border-r-0 rounded-3xl p-8 hover:bg-white/[0.02] hover:border-purple-400/60 transition-all duration-300 group shadow-[0_0_30px_rgba(168,85,247,0.05)] relative overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl mb-6 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-shadow duration-300 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Koneksi Tepat</h3>
            <p className="text-slate-400 leading-relaxed text-sm flex-1">
              Sistem pencarian kami mempertemukan keahlian yang Anda butuhkan dengan pengguna yang siap berkolaborasi secara akurat.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            variants={featureVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2 }}
            className="bg-transparent backdrop-blur-3xl border-t border-l border-indigo-500/30 border-b-0 border-r-0 rounded-3xl p-8 hover:bg-white/[0.02] hover:border-indigo-400/60 transition-all duration-300 group shadow-[0_0_30px_rgba(99,102,241,0.05)] relative overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl mb-6 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-shadow duration-300 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Exchange Room</h3>
            <p className="text-slate-400 leading-relaxed text-sm flex-1">
              Miliki ruang kolaborasi eksklusif. Atur jadwal pertemuan, buat *milestone*, dan pantau progres belajar bersama partner.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            variants={featureVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.4 }}
            className="bg-transparent backdrop-blur-3xl border-t border-l border-emerald-500/30 border-b-0 border-r-0 rounded-3xl p-8 hover:bg-white/[0.02] hover:border-emerald-400/60 transition-all duration-300 group shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl mb-6 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-shadow duration-300 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Trust Score</h3>
            <p className="text-slate-400 leading-relaxed text-sm flex-1">
              Bangun portofolio dan tingkatkan kredibilitasmu melalui ulasan dan sistem poin berdasar kualitas sesi pertukaran.
            </p>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
