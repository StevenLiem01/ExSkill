"use client";

import { signIn, useSession } from "next-auth/react";


export default function LoginButton({ text }: { text?: string }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  if (session && session.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm hidden sm:block text-right">
          <p className="font-medium text-white">{session.user.name}</p>
          <p className="text-slate-400 text-[10px]">{session.user.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-[#D946EF] font-bold border border-[#D946EF]/50">
          {(session.user.name || "U")[0].toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
    >
      {text || "Login / Masuk"}
    </button>
  );
}
