import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B061A] p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-[0_0_30px_rgba(168,85,247,0.15)] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600"></div>
        <h2 className="text-6xl font-black text-white mb-2 drop-shadow-md">
          <span className="text-purple-500 text-shadow-glow">404</span>
        </h2>
        <h3 className="text-xl font-bold text-slate-200 mb-4 uppercase tracking-widest">
          Sektor Tidak Ditemukan
        </h3>
        <p className="text-slate-400 mb-8 font-mono text-sm leading-relaxed">
          Koordinat yang Anda tuju berada di luar jangkauan radar ExSkill. 
          Kemungkinan halaman telah dipindahkan atau dihapus.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
        >
          Kembali ke Base
        </Link>
      </div>
    </div>
  );
}
