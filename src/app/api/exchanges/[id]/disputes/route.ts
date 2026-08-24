import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const currentUser = await prisma.user.findUnique({
      where: { email: sessionAuth.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
    });

    if (!exchange) {
      return NextResponse.json({ message: "Exchange not found" }, { status: 404 });
    }

    // Hanya partisipan dari Exchange ini yang bisa membuka sengketa
    if (exchange.participant_a_id !== currentUser.id && exchange.participant_b_id !== currentUser.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { reason, description } = body;

    if (!reason || !description) {
      return NextResponse.json({ message: "Reason and description are required" }, { status: 400 });
    }

    const newDispute = await prisma.dispute.create({
      data: {
        exchange_id: exchangeId,
        opened_by: currentUser.id,
        reason,
        description,
        status: "OPEN"
      },
    });

    return NextResponse.json(newDispute, { status: 201 });

  } catch (error: unknown) {
    console.error("[DISPUTE_CREATE_ERROR]", error);
    return NextResponse.json({ message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
