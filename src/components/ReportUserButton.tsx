"use client";

import React, { useState } from "react";
import ReportModal from "./ReportModal";
import { Flag } from "lucide-react";

export default function ReportUserButton({ reportedId, className = "" }: { reportedId: string, className?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors shadow-sm ${className}`}
        title="Laporkan Pengguna"
      >
        <Flag size={14} className="mr-1 inline" /> Laporkan
      </button>

      <ReportModal 
        reportedId={reportedId} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
