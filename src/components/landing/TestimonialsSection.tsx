"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Budi Santoso",
      university: "Universitas Indonesia",
      major: "Ilmu Komputer",
      quote: "Saya awalnya cuma jago desain UI/UX. Berkat ExSkill, saya dapat partner anak ITB yang ngajarin saya React. Sekarang saya bisa bikin website sendiri dari nol!",
      avatar: "https://i.pravatar.cc/150?u=budi",
      rating: 5
    },
    {
      id: 2,
      name: "Siti Rahma",
      university: "Institut Teknologi Bandung",
      major: "Teknik Informatika",
      quote: "Platform ini penyelamat banget pas ngerjain tugas akhir. Saya tukeran skill backend Node.js dengan mahasiswa DKV yang bantuin bikin aset ilustrasi aplikasi saya.",
      avatar: "https://i.pravatar.cc/150?u=siti",
      rating: 5
    },
    {
      id: 3,
      name: "Kevin Pratama",
      university: "Universitas Gadjah Mada",
      major: "Manajemen Bisnis",
      quote: "ExSkill beneran mind-blowing! Saya butuh banget insight soal Data Analysis buat skripsi, akhirnya barter ilmu dengan anak Statistika. Recommended banget!",
      avatar: "https://i.pravatar.cc/150?u=kevin",
      rating: 5
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60 } }
  };

  return (
    <section className="relative py-24 px-6 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Kisah Sukses <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] to-indigo-400">Mahasiswa</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Mereka telah membuktikan bahwa kolaborasi dan barter ilmu jauh lebih berharga daripada belajar sendirian.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((testi) => (
            <motion.div 
              key={testi.id} 
              variants={itemVariants}
              className="group h-full"
            >
              <div className="relative h-full bg-[#0B061A]/60 backdrop-blur-md border border-white/5 hover:border-purple-500/30 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-[#0B061A]/80 shadow-lg flex flex-col">
                
                {/* Decorative Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote size={40} className="text-purple-400" />
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testi.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-slate-300 leading-relaxed mb-8 flex-grow text-sm md:text-base italic">
                  &quot;{testi.quote}&quot;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={testi.avatar} 
                      alt={testi.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{testi.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{testi.university}</p>
                    <p className="text-[10px] text-purple-400 uppercase tracking-wider mt-0.5">{testi.major}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
