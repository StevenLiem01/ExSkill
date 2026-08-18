"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications");
      }
    };

    // Polling setiap 30 detik
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id?: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { notificationId: id } : {})
      });

      setNotifications(prev => prev.map(n =>
        (id ? n.id === id : true) ? { ...n, is_read: true } : n
      ));

      if (!id) setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative min-h-[44px] min-w-[44px] p-2 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 ease-in-out text-slate-500 hover:text-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-sm border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all duration-200 ease-in-out">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-900">Notifikasi</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAsRead()} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Belum ada notifikasi.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`p-4 hover:bg-slate-50 transition-colors duration-200 flex gap-3 cursor-pointer ${notif.is_read ? 'bg-white opacity-75' : 'bg-blue-50/40'}`}
                    onClick={() => {
                      if (!notif.is_read) markAsRead(notif.id);
                    }}
                  >
                    <div className="mt-0.5 text-lg">
                      {notif.type.includes('PROPOSAL') ? '📩' : notif.type.includes('REVIEW') ? '⭐' : '🔔'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${notif.is_read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                        {new Date(notif.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0 shadow-sm"></div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}