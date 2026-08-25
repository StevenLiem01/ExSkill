import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sessionAuth = await getServerSession(authOptions);

    if (!sessionAuth || sessionAuth.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const disputes = await prisma.dispute.findMany({
      orderBy: { created_at: "desc" },
      include: {
        exchange: {
          select: {
            participant_a: { select: { id: true, name: true, email: true } },
            participant_b: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    // Manually fetch opened_by user details for each dispute since opened_by is just a string ID without relation in schema
    // Ideally we should have a relation, but given the current schema we fetch manually
    const userIds = [...new Set(disputes.map(d => d.opened_by))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    });
    
    const userMap = new Map(users.map(u => [u.id, u]));

    const enrichedDisputes = disputes.map(d => ({
      ...d,
      reporter: userMap.get(d.opened_by) || { name: "Unknown User" }
    }));

    return NextResponse.json(enrichedDisputes, { status: 200 });

  } catch (error) {
    console.error("[ADMIN_DISPUTES_GET_ERROR]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
