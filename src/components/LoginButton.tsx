"use client";

import { signIn, signOut, useSession } from "next-auth/react";

import NotificationBell from "./NotificationBell";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  if (session && session.user) {
    return (
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="text-sm hidden sm:block">
          <p className="font-medium text-white">{session.user.name}</p>
          <p className="text-slate-400 text-xs">{session.user.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="rounded-xl bg-red-500/20 border border-red-500/50 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500 hover:text-white transition-colors shadow-md"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
    >
      Login / Masuk
    </button>
  );
}
