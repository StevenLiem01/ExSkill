"use client";

import React from "react";

export default function HeroLanding() {
    return (
        <div className="min-h-screen bg-[#070b14] text-white font-sans overflow-hidden relative selection:bg-blue-500/30">
            {/* --- BACKGROUND GLOW EFFECTS --- */}
            {/* Top Left subtle blue glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
            {/* Center huge purple glow behind laptop */}
            <div className="absolute top-[30%] right-[10%] w-[800px] h-[600px] bg-purple-700/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
            {/* Bottom left purple streak */}
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[300px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

            {/* Horizontal glowing line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.5)]"></div>

            {/* --- NAVBAR --- */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-[1600px] mx-auto 2xl:px-0">
                <div className="flex items-center gap-3">
                    {/* Logo Icon */}
                    <div className="w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center bg-white/5 backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold tracking-tight">SchoolFlow</span>
                            <span className="bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded text-white tracking-wider">PRO</span>
                        </div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Smart School Management Platform</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                    <a href="#" className="text-white">Features</a>
                    <a href="#" className="hover:text-white transition-colors">Modules</a>
                    <a href="#" className="hover:text-white transition-colors">Benefits</a>
                    <a href="#" className="hover:text-white transition-colors">Firebase</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>

                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
                    Get Started
                </button>
            </nav>

            {/* --- HERO SECTION --- */}
            <main className="relative z-10 max-w-[1600px] mx-auto px-6 2xl:px-0 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-center">

                {/* LEFT COLUMN: Typography & CTA */}
                <div className="space-y-10">
                    {/* Badge */}
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold tracking-wider uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                        ALL-IN-ONE SOLUTION
                    </div>

                    {/* Headline */}
                    <div className="space-y-2">
                        <h1 className="text-6xl md:text-[5.5rem] font-extrabold tracking-tight leading-[1.1]">
                            Smart School.
                        </h1>
                        <h1 className="text-6xl md:text-[5.5rem] font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                            Smarter Future.
                        </h1>
                    </div>

                    {/* Description */}
                    <p className="text-lg text-slate-400 max-w-xl leading-relaxed font-medium">
                        Manage students, teachers, classes, attendance, exams, fees, library, transport and more — all in one powerful platform.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all hover:-translate-y-1 shadow-[0_0_30px_rgba(79,70,229,0.3)] group border border-white/10">
                            Explore Dashboard
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                        <button className="bg-transparent hover:bg-white/5 border border-slate-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 transition-all hover:-translate-y-1 backdrop-blur-sm">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Watch Demo
                        </button>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/10 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/[0.04] transition-all hover:-translate-y-1 cursor-pointer group">
                                <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                                    {feature.icon}
                                </div>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white leading-tight">
                                    {feature.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: Laptop Mockup & Badges */}
                <div className="relative w-full flex flex-col items-center">

                    {/* Top Floating Badge Strip */}
                    <div className="bg-[#0b1120]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between w-[90%] mb-6 shadow-2xl relative z-20">
                        <div className="flex items-center gap-3 px-4 border-r border-white/10">
                            <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M11.644 1.635a.5.5 0 0 1 .712 0l9.317 9.317a.5.5 0 0 1-.353.854H2.68a.5.5 0 0 1-.353-.854l9.317-9.317zM2.81 12.81h18.38a.5.5 0 0 1 .4.8l-9.19 12.253a.5.5 0 0 1-.8 0L2.41 13.61a.5.5 0 0 1 .4-.8z" /></svg>
                            <div className="text-left">
                                <p className="text-[10px] text-slate-400 font-bold tracking-widest leading-none">FIREBASE</p>
                                <p className="text-sm font-bold text-white leading-tight">READY</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 border-r border-white/10">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                            <span className="text-xs font-medium text-slate-300">Easy<br />Setup</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 border-r border-white/10">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                            <span className="text-xs font-medium text-slate-300">Secure<br />Database</span>
                        </div>
                        <div className="flex items-center gap-2 px-4">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                            <span className="text-xs font-medium text-slate-300">Realtime<br />Sync</span>
                        </div>
                    </div>

                    {/* LAPTOP MOCKUP */}
                    <div className="relative w-full max-w-[950px] aspect-[16/10] z-10 group perspective-[2000px]">
                        {/* Screen Frame */}
                        <div className="w-full h-full bg-[#111] rounded-2xl md:rounded-[2rem] p-3 md:p-4 border border-slate-700 shadow-2xl relative overflow-hidden flex flex-col">
                            {/* Webcam */}
                            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-800 border border-slate-600"></div>

                            {/* Inner Screen Area (Dashboard UI) */}
                            <div className="w-full h-full bg-[#0b0e14] rounded-lg md:rounded-xl overflow-hidden flex border border-white/5 relative">

                                {/* Dashboard Sidebar */}
                                <div className="w-[15%] min-w-[120px] bg-[#0d121c] border-r border-white/5 flex flex-col py-4 px-2">
                                    <div className="flex items-center gap-2 px-2 mb-6 text-white text-xs font-bold">
                                        <div className="w-5 h-5 rounded-md border border-slate-600 flex items-center justify-center">🎓</div>
                                        SchoolFlow
                                    </div>
                                    <div className="space-y-1">
                                        {['Dashboard', 'Students', 'Teachers', 'Classes', 'Attendance', 'Exams', 'Fees', 'Library', 'Transport', 'Settings'].map((item, i) => (
                                            <div key={item} className={`text-[9px] py-1.5 px-3 rounded-md flex items-center gap-2 ${i === 0 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                                                <div className="w-3 h-3 bg-white/20 rounded-sm"></div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dashboard Main Content */}
                                <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 overflow-hidden">

                                    {/* Top Header */}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-sm md:text-base font-bold text-white">Welcome back, Super Admin! 👋</h2>
                                            <p className="text-[10px] text-slate-400">Here's what's happening in your school today.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-slate-800 rounded-full"></div>
                                            <div className="w-4 h-4 bg-slate-800 rounded-full"></div>
                                            <div className="flex items-center gap-2 bg-[#121826] px-2 py-1 rounded-md border border-white/5 text-[9px] text-white">
                                                <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                                                Super Admin <span className="text-slate-500">▼</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stat Cards */}
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { title: "Total Students", val: "3,000", change: "+12%", color: "text-blue-400" },
                                            { title: "Total Teachers", val: "250", change: "+8%", color: "text-emerald-400" },
                                            { title: "Total Classes", val: "120", change: "+5%", color: "text-purple-400" },
                                            { title: "Today's Attendance", val: "92.5%", change: "+3%", color: "text-amber-400" },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-[#121826] border border-white/5 rounded-lg p-3">
                                                <p className="text-[9px] text-slate-400">{stat.title}</p>
                                                <div className="flex justify-between items-end mt-1">
                                                    <p className={`text-lg font-bold ${stat.color}`}>{stat.val}</p>
                                                    <p className="text-[8px] text-emerald-500 bg-emerald-500/10 px-1 rounded">{stat.change}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Charts Area */}
                                    <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
                                        <div className="col-span-2 bg-[#121826] border border-white/5 rounded-lg p-3 flex flex-col">
                                            <p className="text-[10px] font-bold text-slate-300 mb-2">Attendance & Fee Overview</p>
                                            {/* Fake Chart Graphic */}
                                            <div className="flex-1 flex items-end gap-2 mt-auto">
                                                {[40, 70, 50, 90, 60, 80, 100].map((h, i) => (
                                                    <div key={i} className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-span-1 bg-[#121826] border border-white/5 rounded-lg p-3 flex flex-col items-center justify-center relative">
                                            <p className="text-[10px] font-bold text-slate-300 absolute top-3 left-3">Fee Collection</p>
                                            {/* Fake Donut Chart */}
                                            <div className="w-20 h-20 rounded-full border-4 border-indigo-500 border-r-emerald-500 border-b-amber-500 flex items-center justify-center mt-4">
                                                <span className="text-[10px] font-bold text-white">$125K</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Laptop Base Stand */}
                        <div className="absolute -bottom-3 left-[5%] right-[5%] h-3 bg-slate-500 rounded-b-xl shadow-2xl z-0">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-400 rounded-b-md"></div>
                        </div>
                        <div className="absolute -bottom-6 left-0 right-0 h-3 bg-gradient-to-b from-slate-800 to-transparent rounded-[100%] blur-sm opacity-50 z-[-1]"></div>
                    </div>

                    {/* Bottom Trust Badge */}
                    <div className="mt-12 bg-white/5 border border-white/10 backdrop-blur-md rounded-full px-6 py-2.5 flex items-center gap-4 shadow-lg z-20">
                        <span className="text-sm font-medium text-slate-300">Trusted by Schools & Educators</span>
                        <div className="flex gap-1 text-amber-500 text-sm">
                            ★ ★ ★ ★ ★
                        </div>
                        <span className="text-sm font-bold text-white border-l border-white/20 pl-4">4.9/5 Rating</span>
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- DATA ---
const features = [
    {
        title: "All in One Platform",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    },
    {
        title: "Powerful Analytics",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    },
    {
        title: "Smart Automation",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
        title: "Secure & Reliable",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    },
    {
        title: "Cloud Powered",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v6m0 0l-3-3m3 3l3-3" /></svg>
    },
    {
        title: "Easy to Use Interface",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    }
];