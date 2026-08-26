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
      <div className="flex gap-2 border-b-2 border-purple-500/30 pb-1 font-mono uppercase tracking-widest">
        <button
          onClick={() => setActiveTab("CHAT")}
          className={`px-5 py-2.5 text-sm font-bold transition-all rounded-none border-2 border-b-0 ${
            activeTab === "CHAT"
              ? "text-[#D946EF] border-[#D946EF] bg-[#D946EF]/10 shadow-[0_0_15px_rgba(217,70,239,0.2)]"
              : "text-slate-500 border-transparent hover:text-[#D946EF]/70 hover:bg-[#D946EF]/5"
          }`}
        >
          <span className={activeTab === "CHAT" ? "animate-pulse" : ""}>_</span>CHAT_LOG
        </button>
        <button
          onClick={() => setActiveTab("MILESTONE")}
          className={`px-5 py-2.5 text-sm font-bold transition-all rounded-none border-2 border-b-0 ${
            activeTab === "MILESTONE"
              ? "text-cyan-400 border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              : "text-slate-500 border-transparent hover:text-cyan-400/70 hover:bg-cyan-400/5"
          }`}
        >
          <span className={activeTab === "MILESTONE" ? "animate-pulse" : ""}>_</span>MILESTONES
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
