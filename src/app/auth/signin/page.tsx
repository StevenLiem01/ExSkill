"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingDummy, setIsLoadingDummy] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const handleDummySignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoadingDummy(true);
    await signIn("credentials", { 
      email, 
      callbackUrl: "/" 
    });
  };

  return (
    <div className="min-h-screen bg-[#0B061A] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Card */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.1)]">
        
        {/* Branding */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-4xl font-extrabold text-white tracking-tight drop-shadow-md mb-3">
            Ex<span className="text-purple-500 text-shadow-glow drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Skill</span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed">
            Welcome back.<br/>Tingkatkan Trust Score dan kembangkan potensimu hari ini.
          </p>
        </div>

        {/* Google Sign In */}
        <button 
          onClick={handleGoogleSignIn}
          disabled={isLoadingGoogle || isLoadingDummy}
          className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white p-3.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-medium">{isLoadingGoogle ? "Memproses..." : "Lanjutkan dengan Google"}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">ATAU (TESTING)</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Dummy Login */}
        <form onSubmit={handleDummySignIn} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-400 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="budi@dummy.com"
              required
              disabled={isLoadingGoogle || isLoadingDummy}
              className="w-full bg-[#0B061A]/50 border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-slate-600 disabled:opacity-50"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoadingGoogle || isLoadingDummy || !email}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium p-3 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] disabled:opacity-50 disabled:hover:bg-purple-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoadingDummy ? "Masuk..." : "Sign in (Dummy)"}
            {!isLoadingDummy && <ArrowRight size={18} />}
          </button>
        </form>

      </div>
    </div>
  );
}
