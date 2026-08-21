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

    const [totalUsers, totalExchanges, pendingReports] = await Promise.all([
      prisma.user.count(),
      prisma.exchange.count(),
      prisma.report.count({ where: { status: "PENDING" } })
    ]);

    return NextResponse.json({
      totalUsers,
      totalExchanges,
      pendingReports
    });
  } catch (error) {
    console.error("[ADMIN_STATS_ERROR]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
