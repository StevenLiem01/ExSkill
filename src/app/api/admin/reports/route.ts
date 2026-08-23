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

    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true, image: true } },
        reported_user: { select: { id: true, name: true, email: true, image: true, is_banned: true } }
      },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("[ADMIN_REPORTS_GET]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
