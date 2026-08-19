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
      include: { participant_a: true, participant_b: true }
    });

    if (!exchange) {
      return NextResponse.json({ message: "Exchange not found" }, { status: 404 });
    }

    const milestones = await prisma.milestone.findMany({
      where: { exchange_id: exchangeId },
      orderBy: { created_at: 'asc' }
    });

    return NextResponse.json(milestones, { status: 200 });

  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
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
      where: { id: exchangeId }
    });

    if (!exchange) {
      return NextResponse.json({ message: "Exchange not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json({ message: "Title and description are required" }, { status: 400 });
    }

    const newMilestone = await prisma.milestone.create({
      data: {
        exchange_id: exchangeId,
        title,
        description,
      }
    });

    return NextResponse.json(newMilestone, { status: 201 });

  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
