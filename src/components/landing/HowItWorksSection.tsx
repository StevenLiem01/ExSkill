"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { UserPlus, Sparkles, Rocket } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      title: "Buat Profil",
      description: "Lengkapi data diri dan ceritakan keahlian apa yang Anda miliki serta apa yang ingin Anda pelajari.",
      icon: <UserPlus className="w-8 h-8 text-purple-400" />,
      color: "from-purple-500/20 to-purple-600/5",
      border: "group-hover:border-purple-500/50"
    },
    {
      id: 2,
      title: "Temukan Partner",
      description: "Sistem cerdas kami akan mencocokkan Anda dengan partner yang saling melengkapi kebutuhan belajar Anda.",
      icon: <Sparkles className="w-8 h-8 text-indigo-400" />,
      color: "from-indigo-500/20 to-indigo-600/5",
      border: "group-hover:border-indigo-500/50"
    },
    {
      id: 3,
      title: "Mulai Kolaborasi",
      description: "Bertukar ilmu, kerjakan project nyata bersama, dan tingkatkan portofolio Anda ke level selanjutnya!",
      icon: <Rocket className="w-8 h-8 text-[#D946EF]" />,
      color: "from-[#D946EF]/20 to-[#D946EF]/5",
      border: "group-hover:border-[#D946EF]/50"
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <section className="relative py-24 px-6 z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Cara Kerja <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#D946EF]">ExSkill</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Hanya butuh 3 langkah sederhana untuk mulai menemukan partner ideal dan meningkatkan kemampuanmu.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-purple-500/0 via-white/10 to-[#D946EF]/0 -z-10"></div>

          {steps.map((step) => (
            <motion.div 
              key={step.id} 
              variants={itemVariants}
              className="relative group h-full"
            >
              <div className={`h-full bg-slate-900/40 backdrop-blur-md border border-white/10 ${step.border} rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col items-center text-center overflow-hidden`}>
                
                {/* Background Glow on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-white/5 flex items-center justify-center mb-6 shadow-xl mx-auto group-hover:scale-110 transition-transform duration-500">
                    {step.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                    <span className="text-sm font-black text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">0{step.id}</span>
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
