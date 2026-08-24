import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExSkill | Platform Pertukaran Keahlian Mahasiswa",
  description: "Platform pertukaran keahlian peer-to-peer bernuansa Cyber-Neon. Temukan partner belajar, berkolaborasi, dan tingkatkan Trust Score kamu.",
};

import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#0B061A] text-white`}
    >
      <body className="min-h-full flex flex-col bg-[#0B061A]">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: 'bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-xl',
              style: {
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#D946EF',
                  secondary: '#0B061A',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#0B061A',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}