"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Apakah ExSkill 100% Gratis?",
      answer: "Tentu saja! ExSkill dibangun khusus untuk membantu mahasiswa. Semua fitur dasar seperti pembuatan profil, pencarian partner (AI Matchmaking), dan ruang chat kolaborasi sepenuhnya gratis tanpa biaya tersembunyi."
    },
    {
      question: "Bagaimana jika saya masih pemula dan belum punya skill dewa?",
      answer: "Tidak masalah sama sekali! ExSkill adalah tempat untuk belajar bersama. Banyak pengguna yang mencari teman diskusi tingkat dasar. Cukup tuliskan tingkat kemahiran Anda sejujurnya di profil agar sistem bisa mencarikan partner yang sefrekuensi."
    },
    {
      question: "Apakah data kampus dan profil saya aman?",
      answer: "Sangat aman. Kami menggunakan enkripsi standar industri dan data Anda tidak akan pernah dijual ke pihak ketiga. Platform ini didesain sebagai ekosistem tertutup yang aman bagi mahasiswa."
    },
    {
      question: "Bagaimana cara melakukan barter skill secara praktis?",
      answer: "Setelah Anda menemukan partner yang cocok (*match*), Anda berdua dapat berdiskusi melalui fitur Chat bawaan kami. Anda bebas menentukan jadwal belajar via Zoom/Google Meet atau mengerjakan project bersama secara asinkron (misal: berbagi repo GitHub)."
    }
  ];

  return (
    <section className="relative py-24 px-6 z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-500/10 rounded-full border border-purple-500/20">
              <MessageCircleQuestion className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Masih ragu? Berikut adalah jawaban dari beberapa pertanyaan yang paling sering ditanyakan oleh mahasiswa.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'bg-[#0B061A]/80 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'bg-[#0B061A]/40 border-white/10 hover:border-white/20'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`font-semibold text-base md:text-lg transition-colors ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 ml-4 p-1 rounded-full ${isOpen ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400'}`}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-0 text-slate-400 leading-relaxed border-t border-white/5 mt-2">
                        <div className="pt-4">
                          {faq.answer}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
