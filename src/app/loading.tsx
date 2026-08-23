export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] bg-[#0B061A]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-pulse"></div>
      </div>
      <p className="mt-6 text-purple-400 font-mono tracking-widest text-sm animate-pulse">MEMUAT...</p>
    </div>
  );
}
