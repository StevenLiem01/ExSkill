import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const existingSession = await prisma.meetingSession.findUnique({
      where: { id: sessionId },
      include: {
        milestone: {
          include: { exchange: true }
        }
      }
    });

    if (!existingSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    const exchange = existingSession.milestone.exchange;
    if (exchange.participant_a_id !== currentUser.id && exchange.participant_b_id !== currentUser.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.scheduled_at !== undefined) updateData.scheduled_at = new Date(body.scheduled_at);
    if (body.duration_minutes !== undefined) updateData.duration_minutes = body.duration_minutes;
    if (body.meeting_link !== undefined) updateData.meeting_link = body.meeting_link;
    if (body.status !== undefined) updateData.status = body.status;

    const updatedSession = await prisma.meetingSession.update({
      where: { id: sessionId },
      data: updateData
    });

    return NextResponse.json(updatedSession, { status: 200 });

  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const sessionAuth = await getServerSession(authOptions);

    if (!sessionAuth || !sessionAuth.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: sessionAuth.user.email }
    });
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const existingSession = await prisma.meetingSession.findUnique({
      where: { id: sessionId },
      include: {
        milestone: {
          include: { exchange: true }
        }
      }
    });

    if (!existingSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    const exchange = existingSession.milestone.exchange;
    if (exchange.participant_a_id !== currentUser.id && exchange.participant_b_id !== currentUser.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.meetingSession.delete({
      where: { id: sessionId }
    });

    return NextResponse.json({ message: "Session deleted" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
