"use client";
import toast from "react-hot-toast";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MessageSquare, FileText, Paperclip } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
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

  useEffect(() => {
    // Scroll ke bawah saat pesan baru masuk
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    setLoading(true);
    try {
      let file_url = null;
      let file_name = null;

      // 1. Jika ada file, unggah ke Supabase Storage
      if (file) {
        // Buat path unik yang dipastikan valid (tanpa slash di depan)
        const filePath = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');

        console.log('Mencoba upload ke path:', filePath);

        const { data: publicUrlData, error } = await supabase.storage
          .from("chat_files")
          .upload(filePath, file);

        if (error) {
          throw new Error("Gagal mengunggah file ke Supabase: " + (error instanceof Error ? error.message : "Unknown error"));
        }

        const { data: getUrlData } = supabase.storage
          .from("chat_files")
          .getPublicUrl(filePath);

        file_url = getUrlData.publicUrl;
        file_name = file.name;
      }

      // 2. Kirim pesan beserta URL file
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
    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[550px] shadow-sm overflow-hidden flex-1">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquare size={16} /> Live Chat</h3>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${sessionStatus === "IN_PROGRESS" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {sessionStatus === "IN_PROGRESS" ? "Aktif" : sessionStatus === "COMPLETED" ? "Selesai" : "Menunggu"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 font-medium italic h-full flex items-center justify-center">
            Belum ada pesan. Sapa partner Anda!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUserId;
            const isImage = msg.file_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;

            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-bold text-slate-400 mb-1 px-1 uppercase tracking-wider">{isMe ? "Anda" : msg.sender.name}</span>
                <div className={`max-w-[85%] p-3.5 text-sm shadow-sm border ${isMe
                  ? 'bg-blue-600 text-white border-blue-600 rounded-2xl rounded-tr-sm'
                  : 'bg-white text-slate-800 border-slate-200 rounded-2xl rounded-tl-sm'
                  }`}>
                  {msg.file_url && (
                    <div className="mb-2">
                      {isImage ? (
                        <img
                          src={msg.file_url}
                          alt="Attachment"
                          className="max-w-full rounded-xl max-h-56 object-cover cursor-zoom-in hover:opacity-95 transition-opacity border border-black/10"
                          onClick={() => setZoomedImage(msg.file_url)}
                        />
                      ) : (
                        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors border ${isMe ? 'bg-blue-700/50 hover:bg-blue-700 border-blue-500/50' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                          <FileText size={18} />
                          <span className="truncate max-w-[180px] font-medium text-xs">{msg.file_name}</span>
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
                <span className="text-[10px] font-medium text-slate-400 mt-1.5 px-1">
                  {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-3">
        {file && (
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs shadow-sm">
            <span className="truncate flex-1 font-medium text-slate-700 flex items-center"><Paperclip size={14} className="mr-1" /> {file.name}</span>
            <button
              onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              className="text-slate-400 hover:text-red-500 ml-3 font-bold p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={loading}
              aria-label="Hapus lampiran"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
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
            className="h-11 w-11 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Tambah Lampiran"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={sessionStatus === "NOT_STARTED" ? 'Menunggu sesi dimulai...' : sessionStatus === "COMPLETED" ? 'Sesi telah berakhir.' : 'Ketik pesan...'}
            className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner transition-all"
            disabled={loading || sessionStatus !== "IN_PROGRESS"}
          />
          <button
            type="submit"
            disabled={loading || (!content.trim() && !file) || sessionStatus !== "IN_PROGRESS"}
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Kirim
          </button>
        </form>
      </div>

      {/* Lightbox Modal - Dipertahankan gelap agar fokus ke gambar */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 cursor-zoom-out transition-opacity"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full flex flex-col items-end">
            <button
              onClick={() => setZoomedImage(null)}
              className="text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-10 h-10 flex items-center justify-center mb-3 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl cursor-default border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}