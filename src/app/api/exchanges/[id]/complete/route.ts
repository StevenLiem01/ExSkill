import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
      where: { email: sessionAuth.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: { participant_a: true, participant_b: true }
    });

    if (!exchange) {
      return NextResponse.json({ message: "Exchange not found" }, { status: 404 });
    }

    if (exchange.status === "COMPLETED") {
      return NextResponse.json({ message: "Exchange is already completed" }, { status: 400 });
    }

    // Determine reviewee
    const isParticipantA = exchange.participant_a_id === currentUser.id;
    const isParticipantB = exchange.participant_b_id === currentUser.id;

    if (!isParticipantA && !isParticipantB) {
      return NextResponse.json({ message: "You are not a participant of this exchange" }, { status: 403 });
    }

    const revieweeId = isParticipantA ? exchange.participant_b_id : exchange.participant_a_id;

    // Verify if already reviewed (just in case status wasn't updated but review exists)
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewer_id_exchange_id: {
          reviewer_id: currentUser.id,
          exchange_id: exchangeId
        }
      }
    });

    if (existingReview) {
      return NextResponse.json({ message: "You have already reviewed this exchange" }, { status: 400 });
    }

    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Invalid rating" }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
      return NextResponse.json({ message: "Comment is required" }, { status: 400 });
    }

    // Execute transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create Review
      await tx.review.create({
        data: {
          exchange_id: exchangeId,
          reviewer_id: currentUser.id,
          reviewee_id: revieweeId,
          rating: rating,
          comment: comment.trim()
        }
      });

      // 2. Update Exchange Status to COMPLETED
      // (Depending on business logic, maybe wait for BOTH to review. But for now, one is enough to complete it)
      await tx.exchange.update({
        where: { id: exchangeId },
        data: { status: "COMPLETED" }
      });

      // 3. Add Trust Score to the reviewee
      // Formula: let's add (rating * 5) points to trust_score
      const scoreToAdd = rating * 5;
      await tx.user.update({
        where: { id: revieweeId },
        data: { trust_score: { increment: scoreToAdd } }
      });
    });

    return NextResponse.json({ message: "Exchange completed and review submitted successfully" }, { status: 200 });

  } catch (error) {
    console.error("[EXCHANGE_COMPLETE_ERROR]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
