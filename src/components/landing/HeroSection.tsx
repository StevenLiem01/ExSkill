"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import LoginButton from "@/components/LoginButton";

interface HeroSectionProps {
  isLoggedIn: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-40 relative z-10">
      <motion.div
        className="max-w-5xl space-y-10 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Platform Kolaborasi Mahasiswa
          </div>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-white drop-shadow-2xl leading-tight"
        >
          Cari Partner Belajar. <br className="hidden md:block"/> Tukar Keahlian.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-[#D946EF] animate-gradient-x">
            Selesaikan Project Bareng.
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
        >
          Temukan partner belajar, jadwalkan sesi kolaborasi, dan kembangkan portofolio Anda secara nyata.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto sm:max-w-none"
        >
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-full font-bold text-white bg-purple-600 hover:bg-purple-500 hover:-translate-y-1 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 w-full sm:w-auto text-lg text-center"
            >
              Buka Dashboard &rarr;
            </Link>
          ) : (
            <div className="w-full sm:w-auto [&>button]:w-full [&>button]:px-8 [&>button]:py-4 [&>button]:text-lg [&>button]:bg-purple-600 [&>button]:hover:bg-purple-500 [&>button]:text-white [&>button]:hover:-translate-y-1 [&>button]:shadow-lg [&>button]:shadow-purple-500/50 [&>button]:hover:shadow-purple-500/80 [&>button]:font-bold [&>button]:rounded-full [&>button]:border-0 [&>button]:transition-all [&>button]:duration-300">
              <LoginButton text="Mulai Sekarang" />
            </div>
          )}

          <Link
            href="/explore"
            className="px-8 py-4 rounded-full font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md transition-all duration-300 w-full sm:w-auto text-lg text-center"
          >
            Jelajahi Keahlian
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
