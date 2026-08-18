import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const exchanges = await prisma.exchange.findMany({
      where: {
        OR: [
          { participant_a_id: user.id },
          { participant_b_id: user.id },
        ]
      },
      include: {
        participant_a: true,
        participant_b: true,
        proposal: {
          include: {
            offered_skill: true,
            requested_skill: true,
          }
        },
        milestones: true, // Untuk melihat jumlah milestone di dashboard
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(exchanges, { status: 200 });
  } catch (error) {
    console.error("Error fetching exchanges:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
