import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/exchanges/[id]/milestones/[milestoneId]/sessions
// Membuat sesi meeting baru di dalam suatu milestone
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: exchangeId, milestoneId } = await params;
    const body = await req.json();
    const { title, scheduled_at, duration, meeting_link } = body;

    if (!title || !scheduled_at || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validasi exchange
    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
    });

    if (!exchange) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 });
    }

    // Pastikan user adalah partisipan
    if (exchange.participant_a_id !== dbUser.id && exchange.participant_b_id !== dbUser.id) {
      return NextResponse.json({ error: "Unauthorized to add session to this exchange" }, { status: 403 });
    }

    // Validasi milestone
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId, exchange_id: exchangeId },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Buat session
    const newSession = await prisma.meetingSession.create({
      data: {
        milestone_id: milestoneId,
        title,
        scheduled_at: new Date(scheduled_at),
        duration: parseInt(duration),
        meeting_link: meeting_link || null,
        status: "SCHEDULED",
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/exchanges/[id]/milestones/[milestoneId]/sessions
// Konfirmasi session
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: exchangeId, milestoneId } = await params;
    const body = await req.json();
    const { session_id, action } = body;

    if (!session_id || !action || action !== "CONFIRM") {
      return NextResponse.json({ error: "Invalid action or missing session_id" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validasi session
    const meetingSession = await prisma.meetingSession.findUnique({
      where: { id: session_id, milestone_id: milestoneId },
      include: {
        milestone: {
          include: {
            exchange: true
          }
        },
        confirmations: true
      }
    });

    if (!meetingSession || meetingSession.milestone.exchange_id !== exchangeId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const exchange = meetingSession.milestone.exchange;
    
    // Pastikan user adalah partisipan
    if (exchange.participant_a_id !== dbUser.id && exchange.participant_b_id !== dbUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Cek apakah user sudah confirm
    const alreadyConfirmed = meetingSession.confirmations.some(c => c.user_id === dbUser.id);
    if (alreadyConfirmed) {
      return NextResponse.json({ message: "Already confirmed" }, { status: 200 });
    }

    // Lakukan konfirmasi
    await prisma.$transaction(async (tx) => {
      // 1. Buat record SessionConfirmation
      await tx.sessionConfirmation.create({
        data: {
          session_id: session_id,
          user_id: dbUser.id,
        }
      });

      // 2. Cek apakah dengan ini kedua belah pihak sudah confirm
      // Kita hitung jumlah total confirmation di DB untuk session ini (termasuk yang baru diinsert di transaksi ini, tapi karena masih di tx, kita perlu hitung manual atau via query tx)
      const confirmationsCount = await tx.sessionConfirmation.count({
        where: { session_id: session_id }
      });

      // Partisipan selalu 2 orang. Jika count = 2, berarti keduanya sudah konfirmasi
      if (confirmationsCount >= 2) {
        await tx.meetingSession.update({
          where: { id: session_id },
          data: { status: "COMPLETED" }
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error confirming session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
