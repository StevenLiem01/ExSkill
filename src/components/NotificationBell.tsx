"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, MailOpen } from "lucide-react";
import { useSFX } from "@/hooks/useSFX";

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell({ direction = "down" }: { direction?: "up" | "down" | "right" }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { playClick, playSuccess } = useSFX();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string, link: string | null) => {
    try {
      playClick();
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      
      if (link) {
        setIsOpen(false);
        router.push(link);
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      playSuccess();
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        className="relative p-2 text-slate-300 hover:text-[#D946EF] transition-colors focus:outline-none"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-slate-900"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute ${
          direction === "up" ? "bottom-full mb-4 left-1/2 -translate-x-1/2" : 
          direction === "right" ? "left-full ml-4 top-0" : 
          "right-0 mt-2"
        } w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50`}>
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
            <h3 className="font-bold text-white">Notifikasi</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-[#D946EF] hover:text-white transition-colors"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                <MailOpen size={32} className="mb-2 opacity-50 text-slate-300" />
                <p className="text-sm">Belum ada notifikasi.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleMarkAsRead(notif.id, notif.link)}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!notif.is_read ? 'bg-[#D946EF]/5' : ''}`}
                  >
                    {!notif.is_read && (
                      <div className="mt-1.5 flex-shrink-0">
                        <div className="h-2 w-2 bg-[#D946EF] rounded-full shadow-[0_0_5px_rgba(0,223,154,0.8)]"></div>
                      </div>
                    )}
                    <div className={`${notif.is_read ? 'ml-5' : ''} flex-1`}>
                      <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-slate-500 mt-2 font-mono">
                        {new Date(notif.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}