import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const existingMilestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { exchange: true }
    });

    if (!existingMilestone) {
      return NextResponse.json({ message: "Milestone not found" }, { status: 404 });
    }

    const body = await req.json();
    const { is_completed } = body;

    if (typeof is_completed !== "boolean") {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { is_completed }
    });

    return NextResponse.json(updatedMilestone, { status: 200 });

  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
