import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Cache this endpoint for 60 seconds so it doesn't hammer the database
export const revalidate = 60;

export async function GET() {
  try {
    const totalUsers = await prisma.user.count({
      where: { is_banned: false }
    });

    const totalExchanges = await prisma.exchange.count({
      where: { status: "COMPLETED" }
    });

    const totalSkills = await prisma.skill.count({
      where: { is_active: true }
    });

    return NextResponse.json({
      totalUsers,
      totalExchanges,
      totalSkills
    });
  } catch (error) {
    console.error("Failed to fetch public stats:", error);
    // Return graceful fallbacks if db fails
    return NextResponse.json({
      totalUsers: 0,
      totalExchanges: 0,
      totalSkills: 0
    });
  }
}
