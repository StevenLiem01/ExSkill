import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import SkillManager from "@/components/SkillManager";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      owned_skills: { include: { skill: true } },
      wanted_skills: { include: { skill: true } },
    }
  });

  if (!user) redirect("/");

  const catalog = await prisma.skill.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <AuthProvider>
      <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12 relative overflow-hidden pb-20">
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-[#00DF9A]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Identity & Reputation Card */}
            <div className="w-full md:w-1/3 space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl flex flex-col items-center text-center relative">
                <div className="absolute top-4 right-4 bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  🌟 {user.trust_score} Trust Score
                </div>
                
                <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-[#00DF9A]/50 overflow-hidden mb-4 mt-4">
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">
                      {(user.name || "U")[0]}
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
                <p className="text-slate-400 font-medium text-sm mb-1">{user.university}</p>
                <p className="text-[#00DF9A] text-xs font-mono tracking-wider">{user.major}</p>
              </div>

              {/* Bio & Portofolio Client Component */}
              <ProfileClient user={user} />
            </div>

            {/* Skill Manager Area */}
            <div className="w-full md:w-2/3">
              <SkillManager 
                catalog={catalog} 
                initialOffered={user.owned_skills} 
                initialWanted={user.wanted_skills} 
              />
            </div>
          </div>

        </div>
      </main>
    </AuthProvider>
  );
}
