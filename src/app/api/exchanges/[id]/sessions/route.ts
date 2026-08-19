import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exchangeId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
    });

    if (!exchange) {
      return NextResponse.json({ message: "Exchange not found" }, { status: 404 });
    }

    // Get all meeting sessions associated with milestones of this exchange
    const meetingSessions = await prisma.meetingSession.findMany({
      where: {
        milestone: {
          exchange_id: exchangeId
        }
      },
      include: {
        milestone: {
          select: { title: true }
        }
      },
      orderBy: { scheduled_at: 'asc' }
    });

    return NextResponse.json(meetingSessions, { status: 200 });

  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exchangeId } = await params;
    const sessionAuth = await getServerSession(authOptions);

    if (!sessionAuth || !sessionAuth.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { milestoneId, title, scheduledAt, meetingLink } = body;

    if (!milestoneId || !title || !scheduledAt) {
      return NextResponse.json({ message: "milestoneId, title, and scheduledAt are required" }, { status: 400 });
    }

    // Verify milestone belongs to the exchange
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId }
    });

    if (!milestone || milestone.exchange_id !== exchangeId) {
      return NextResponse.json({ message: "Invalid milestone" }, { status: 400 });
    }

    const newSession = await prisma.meetingSession.create({
      data: {
        milestone_id: milestoneId,
        title,
        scheduled_at: new Date(scheduledAt),
        meeting_link: meetingLink || null,
        duration_minutes: 60, // default
        status: "SCHEDULED"
      },
      include: {
        milestone: {
          select: { title: true }
        }
      }
    });

    return NextResponse.json(newSession, { status: 201 });

  } catch (error) {
    console.error("[SESSION_CREATE_ERROR]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
