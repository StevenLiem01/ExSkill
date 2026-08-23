import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    const { milestoneId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const existingMilestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { exchange: true }
    });

    if (!existingMilestone) {
      return NextResponse.json({ message: "Milestone not found" }, { status: 404 });
    }

    const exchange = existingMilestone.exchange;
    if (exchange.participant_a_id !== currentUser.id && exchange.participant_b_id !== currentUser.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    
    // We can update title, description, target_date, is_completed
    const updateData: Record<string, string | Date | boolean | null> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.target_date !== undefined) updateData.target_date = body.target_date ? new Date(body.target_date) : null;
    if (body.is_completed !== undefined) updateData.is_completed = body.is_completed;

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData
    });

    return NextResponse.json(updatedMilestone, { status: 200 });

  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    const { milestoneId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const existingMilestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { exchange: true }
    });

    if (!existingMilestone) {
      return NextResponse.json({ message: "Milestone not found" }, { status: 404 });
    }

    const exchange = existingMilestone.exchange;
    if (exchange.participant_a_id !== currentUser.id && exchange.participant_b_id !== currentUser.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.milestone.delete({
      where: { id: milestoneId }
    });

    return NextResponse.json({ message: "Milestone deleted" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
