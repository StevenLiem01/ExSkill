"use client";

import React, { useState } from "react";
import { MessageSquare, Calendar } from "lucide-react";
import ChatBox from "@/components/ChatBox";
import MilestoneManager from "@/components/MilestoneManager";

interface ExchangeTabsProps {
  exchangeId: string;
  currentUserId: string;
  sessionStatus: string;
}

export default function ExchangeTabs({ exchangeId, currentUserId, sessionStatus }: ExchangeTabsProps) {
  const [activeTab, setActiveTab] = useState<"CHAT" | "MILESTONE">("CHAT");

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab("CHAT")}
          className={`px-5 py-2.5 text-sm font-bold transition-all rounded-t-xl ${
            activeTab === "CHAT"
              ? "text-[#D946EF] border-b-2 border-[#D946EF] bg-[#D946EF]/5"
              : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
          }`}
        >
          <MessageSquare size={16} className="inline mr-1 mb-0.5" /> Obrolan
        </button>
        <button
          onClick={() => setActiveTab("MILESTONE")}
          className={`px-5 py-2.5 text-sm font-bold transition-all rounded-t-xl ${
            activeTab === "MILESTONE"
              ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5"
              : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
          }`}
        >
          <Calendar size={16} className="inline mr-1 mb-0.5" /> Milestone & Jadwal
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-[500px]">
        {activeTab === "CHAT" && (
          <ChatBox 
            exchangeId={exchangeId} 
            currentUserId={currentUserId} 
            sessionStatus={sessionStatus} 
          />
        )}
        
        {activeTab === "MILESTONE" && (
          <MilestoneManager exchangeId={exchangeId} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
