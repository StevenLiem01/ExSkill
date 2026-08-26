"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  glowVariant?: "primary" | "secondary" | "accent";
  required?: boolean;
}

const GLOW_MAP = {
  primary: "from-[#D946EF] via-purple-500 to-indigo-500", // Fuchsia -> Indigo
  secondary: "from-cyan-400 via-purple-500 to-[#D946EF]", // Cyan -> Fuchsia
  accent: "from-amber-400 via-orange-500 to-red-500", // Orange glow
};

// ExSkill uses dark theme, so we'll cycle through these colors for checkboxes to make them pop
const CHECKBOX_COLORS = [
  "bg-[#D946EF]", // Fuchsia
  "bg-indigo-500", // Indigo
  "bg-purple-500", // Purple
  "bg-cyan-500", // Cyan
  "bg-emerald-500", // Emerald
];

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "w-full",
  glowVariant = "primary",
  required = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, options, value]);

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      const element = document.getElementById(`select-${instanceId}-option-${highlightedIndex}`);
      if (element) {
        element.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen, instanceId]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
    }
  };

  return (
    <div className={`relative font-sans ${className}`} ref={containerRef}>
      {/* TRIGGER BUTTON AREA */}
      <div 
        className="relative group cursor-pointer w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-2xl" 
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Animated Glow Shadow (Behind the button) */}
        <div 
          className={`absolute -inset-1 bg-gradient-to-r ${GLOW_MAP[glowVariant]} rounded-2xl blur-md opacity-30 group-hover:opacity-80 transition duration-500 translate-y-1 z-0`}
        ></div>
        
        {/* Actual Button */}
        <div className="relative z-10 flex items-center justify-between bg-[#090212] text-white px-4 py-2.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10 group-hover:border-white/20 transition-colors w-full h-full min-h-[44px]">
          <div className="flex items-center gap-3 truncate pr-4">
            {/* Soft indicator dot */}
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] flex-shrink-0 ${value ? 'text-[#D946EF] bg-[#D946EF]' : 'text-slate-600 bg-slate-600'}`}></div>
            <span className={`text-sm md:text-sm font-bold truncate ${!value && 'text-slate-400'}`}>
              {displayLabel}
            </span>
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex-shrink-0 text-slate-400 group-hover:text-white transition-colors"
          >
            <ChevronDown size={18} strokeWidth={2.5} />
          </motion.div>
        </div>
      </div>

      {/* DROPDOWN MENU (DARK GLASSMORPHISM) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute left-0 min-w-full w-max z-[100] mt-1"
          >
            {/* Glow di balik menu kaca */}
            <div className={`absolute -inset-2 bg-gradient-to-br ${GLOW_MAP[glowVariant]} rounded-3xl blur-xl opacity-10 z-0`}></div>

            {/* Panel Kaca (Glass Panel) */}
            <div className="relative z-10 bg-[#0B061A]/80 backdrop-blur-xl border border-white/20 rounded-3xl p-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)] max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
              
              {options.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-sm">Tidak ada opsi.</div>
              ) : (
                options.map((opt, index) => {
                  const isSelected = value === opt.value;
                  const colorClass = CHECKBOX_COLORS[index % CHECKBOX_COLORS.length];

                  return (
                    <div 
                      key={opt.value}
                      id={`select-${instanceId}-option-${index}`}
                      onClick={() => { 
                        onChange(opt.value); 
                        setIsOpen(false); 
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors border-b border-white/5 last:border-0 group/item ${highlightedIndex === index ? 'bg-white/10' : 'hover:bg-white/10'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shadow-sm flex-shrink-0 transition-colors ${isSelected ? colorClass : 'bg-white/10 border border-white/20 group-hover/item:border-white/40'}`}>
                          {isSelected && <Check size={14} strokeWidth={4} className="text-white" />}
                        </div>
                        <span className={`font-semibold text-sm whitespace-nowrap pr-4 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {opt.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden native select for form integration if required */}
      {required && (
         <select 
           value={value} 
           onChange={(e) => onChange(e.target.value)} 
           required={required}
           className="absolute opacity-0 w-0 h-0 pointer-events-none"
         >
           <option value="" disabled>{placeholder}</option>
           {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
         </select>
      )}
    </div>
  );
}
