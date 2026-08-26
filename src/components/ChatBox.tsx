"use client";
import toast from "react-hot-toast";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MessageSquare, FileText, Paperclip, X } from "lucide-react";
import { useSFX } from "@/hooks/useSFX";

interface ChatMessage {
  id: string;
  exchange_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  sender: {
    name: string;
  };
}

export default function ChatBox({ exchangeId, currentUserId, sessionStatus }: { exchangeId: string, currentUserId: string, sessionStatus: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const { playType, playClick } = useSFX();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // To avoid scrolling down unnecessarily if not near bottom, but for now we just scroll smoothly within the container
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/messages`);
      if (res.ok) {
        const data = await res.json();
        // Cek jika pesan baru benar-benar bertambah agar tidak memicu re-render / auto-scroll terus menerus
        setMessages((prev) => {
          if (prev.length === data.length) return prev;
          return data;
        });
      }
    } catch (e) {
      console.error("Failed to fetch messages");
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [exchangeId]);

  // Perbaikan Auto-scroll Bug: Hanya scroll kontainer chat, bukan seluruh halaman
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: isFirstLoad ? "auto" : "smooth"
      });
      if (isFirstLoad && messages.length > 0) {
        setIsFirstLoad(false);
      }
    }
  }, [messages, isFirstLoad]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    playClick();
    setLoading(true);
    try {
      let file_url = null;
      let file_name = null;

      if (file) {
        const filePath = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');

        const { data: publicUrlData, error } = await supabase.storage
          .from("chat_files")
          .upload(filePath, file);

        if (error) {
          throw new Error("Gagal mengunggah file: " + (error instanceof Error ? error.message : "Unknown error"));
        }

        const { data: getUrlData } = supabase.storage
          .from("chat_files")
          .getPublicUrl(filePath);

        file_url = getUrlData.publicUrl;
        file_name = file.name;
      }

      const res = await fetch(`/api/exchanges/${exchangeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, file_url, file_name })
      });

      if (res.ok) {
        setContent("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchMessages();
      }
    } catch (e: unknown) {
      console.error("Failed to send message/file", e);
      toast.error((e instanceof Error ? e.message : "Unknown error") || "Gagal mengirim pesan/file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border-2 border-purple-500/50 rounded-none flex flex-col h-[550px] shadow-[4px_4px_0_rgba(168,85,247,0.3)] overflow-hidden flex-1 relative font-mono">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-1 bg-purple-500/30"></div>

      {/* Header */}
      <div className="bg-purple-900/20 p-4 border-b-2 border-purple-500/50 flex items-center justify-between relative z-10">
        <h3 className="font-bold text-purple-400 flex items-center gap-2 uppercase tracking-widest">
          <span className="text-purple-500">[{">"}]</span> SYS_COMM_LINK
        </h3>
        <div className="flex items-center gap-2 bg-black border-2 border-purple-500/30 px-3 py-1 rounded-none">
          <span className={`w-2 h-2 rounded-none ${sessionStatus === "IN_PROGRESS" ? "bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" : "bg-slate-500"}`}></span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            {sessionStatus === "IN_PROGRESS" ? "ONLINE" : sessionStatus === "COMPLETED" ? "CLOSED" : "STANDBY"}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-transparent relative z-10">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 font-medium italic h-full flex items-center justify-center">
            Belum ada pesan. Sapa partner Anda!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUserId;
            const isImage = msg.file_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;

            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-bold text-slate-500 mb-1 px-1 uppercase tracking-wider">{isMe ? "USER_LOCAL" : `USER_${msg.sender.name.substring(0,4).toUpperCase()}`}</span>
                <div className={`max-w-[85%] p-3.5 text-sm border-2 ${isMe
                  ? 'bg-purple-900/30 text-purple-100 border-purple-500/50 rounded-none shadow-[2px_2px_0_rgba(168,85,247,0.3)]'
                  : 'bg-black text-slate-300 border-slate-700 rounded-none shadow-[2px_2px_0_rgba(51,65,85,0.8)]'
                  }`}>
                  {msg.file_url && (
                    <div className="mb-2">
                      {isImage ? (
                          <img
                          src={msg.file_url}
                          alt="Attachment"
                          className="max-w-full rounded-none max-h-56 object-cover cursor-zoom-in hover:opacity-90 transition-opacity border-2 border-purple-500/30"
                          onClick={() => setZoomedImage(msg.file_url)}
                        />
                      ) : (
                        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2.5 rounded-none transition-colors border-2 ${isMe ? 'bg-purple-900/40 hover:bg-purple-900/60 border-purple-500/50' : 'bg-black hover:bg-slate-900 border-slate-700'}`}>
                          <FileText size={18} className={isMe ? "text-purple-400" : "text-slate-400"} />
                          <span className="truncate max-w-[180px] font-bold text-xs">{msg.file_name}</span>
                        </a>
                      )}
                    </div>
                  )}
                  {msg.content && (
                    <div className="break-words whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-slate-500 mt-1.5 px-1">
                  {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-purple-900/10 border-t-2 border-purple-500/50 flex flex-col gap-3 relative z-10">
        {file && (
          <div className="flex items-center justify-between bg-black border-2 border-purple-500/30 p-2 text-xs shadow-inner rounded-none">
            <span className="truncate flex-1 font-bold text-purple-300 flex items-center uppercase">
              <span className="mr-2 text-purple-500">[{">"}]</span> {file.name}
            </span>
            <button
              onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              className="text-purple-400 hover:text-red-400 ml-3 font-bold p-1 rounded-none hover:bg-purple-500/20 transition-colors focus:outline-none"
              disabled={loading}
              aria-label="Hapus lampiran"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <form onSubmit={sendMessage} className="flex gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading || sessionStatus !== "IN_PROGRESS"}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || sessionStatus !== "IN_PROGRESS"}
            className="h-11 w-11 bg-black border-2 border-purple-500/50 hover:bg-purple-900/40 text-purple-400 rounded-none flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            aria-label="Tambah Lampiran"
          >
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') playType();
            }}
            placeholder={sessionStatus === "NOT_STARTED" ? 'SYS_STANDBY...' : sessionStatus === "COMPLETED" ? 'SYS_CLOSED.' : 'INPUT_DATA...'}
            className="flex-1 h-11 bg-black border-2 border-purple-500/50 rounded-none px-4 text-sm text-purple-100 focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all placeholder:text-purple-500/50 font-mono tracking-wider"
            disabled={loading || sessionStatus !== "IN_PROGRESS"}
          />
          <button
            type="submit"
            disabled={loading || (!content.trim() && !file) || sessionStatus !== "IN_PROGRESS"}
            className="h-11 px-5 bg-purple-500/20 border-2 border-purple-500 hover:bg-purple-500/40 text-purple-300 font-bold tracking-widest uppercase rounded-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          >
            EXEC
          </button>
        </form>
      </div>

      {/* Lightbox Modal (Full Screen Image) */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out transition-opacity"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full flex flex-col items-end">
            <button
              onClick={() => setZoomedImage(null)}
              className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center mb-3 transition-colors focus:outline-none"
            >
              <X size={20} />
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] cursor-default border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}