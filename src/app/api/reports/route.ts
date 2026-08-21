import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reporter = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!reporter) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reported_id, reason, details } = body;

    if (!reported_id || !reason) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (reporter.id === reported_id) {
      return NextResponse.json({ message: "You cannot report yourself" }, { status: 400 });
    }

    const reportedUser = await prisma.user.findUnique({
      where: { id: reported_id }
    });

    if (!reportedUser) {
      return NextResponse.json({ message: "Reported user not found" }, { status: 404 });
    }

    const newReport = await prisma.report.create({
      data: {
        reporter_id: reporter.id,
        reported_user_id: reported_id,
        reason,
        details: details || null,
        status: "PENDING"
      }
    });

    return NextResponse.json(newReport, { status: 201 });

  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
