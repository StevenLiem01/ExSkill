import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matching";

export async function GET(req: NextRequest) {
  try {
    const sessionAuth = await getServerSession(authOptions);

    if (!sessionAuth || !sessionAuth.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: sessionAuth.user.email },
      include: {
        owned_skills: { include: { skill: true } },
        wanted_skills: { include: { skill: true } }
      }
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const wantedSkillIds = currentUser.wanted_skills.map(ws => ws.skill_id);

    if (wantedSkillIds.length === 0) {
      // If user hasn't specified wanted skills, return empty
      return NextResponse.json([], { status: 200 });
    }

    // Find users who have at least one of the wanted skills in their owned_skills
    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { not: currentUser.id },
        owned_skills: {
          some: {
            skill_id: { in: wantedSkillIds }
          }
        }
      },
      include: {
        owned_skills: { include: { skill: true } },
        wanted_skills: { include: { skill: true } }
      }
    });

    // Score and sort matches
    const scoredMatches = potentialMatches.map(user => {
      // Calculate intersection count (kept for UI if needed)
      const matchedSkills = user.owned_skills.filter(os => wantedSkillIds.includes(os.skill_id));
      const matchCount = matchedSkills.length;
      const matchScore = calculateMatchScore(currentUser, user);

      return {
        ...user,
        matchCount,
        matchedSkills,
        matchScore
      };
    });

    // Sort by matchScore (desc), then by trust_score (desc)
    scoredMatches.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return b.trust_score - a.trust_score;
    });

    // Take top 10 recommendations
    const topRecommendations = scoredMatches.slice(0, 10);

    return NextResponse.json(topRecommendations, { status: 200 });

  } catch (error) {
    console.error("[RECOMMENDATIONS_GET_ERROR]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
