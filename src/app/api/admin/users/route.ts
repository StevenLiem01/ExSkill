import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        is_banned: true,
        trust_score: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
