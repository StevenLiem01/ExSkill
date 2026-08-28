"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="relative py-24 px-6 z-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Glowing Background Core */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-indigo-600/20"></div>
          
          {/* Noise/Texture Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          
          {/* Glass Card Container */}
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 px-8 py-16 md:py-20 md:px-16 flex flex-col items-center text-center">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-300 text-sm font-medium mb-8">
              <Sparkles size={16} className="text-[#D946EF]" />
              <span>Mulai Petualanganmu Sekarang</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Siap Meningkatkan Nilaimu <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] to-purple-400">Semester Ini?</span>
            </h2>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Bergabunglah dengan ribuan mahasiswa lainnya. Temukan partner belajarmu, bangun portofolio yang memukau, dan jadilah yang terbaik di kelasmu.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/auth/signin" 
                className="group relative inline-flex items-center justify-center gap-3 bg-white text-[#0B061A] px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
              >
                <span className="relative z-10">Daftar Gratis Sekarang</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                
                {/* Shine effect inside button */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent z-0"></div>
              </Link>
            </motion.div>
            
            <p className="mt-6 text-sm text-slate-400">
              *100% Gratis untuk seluruh Mahasiswa Indonesia.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
