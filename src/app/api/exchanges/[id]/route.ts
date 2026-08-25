import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exchangeId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        participant_a: true,
        participant_b: true,
        proposal: {
          include: {
            offered_skill: true,
            requested_skill: true,
          }
        },
        milestones: {
          include: { sessions: true },
          orderBy: { created_at: 'asc' }
        }
      }
    });

    if (!exchange) return NextResponse.json({ message: "Exchange not found" }, { status: 404 });

    if (exchange.participant_a_id !== user.id && exchange.participant_b_id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(exchange, { status: 200 });
  } catch (error) {
    console.error("Error fetching exchange:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exchangeId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const { status } = await req.json();
    
    const exchange = await prisma.exchange.findUnique({ where: { id: exchangeId } });
    if (!exchange) return NextResponse.json({ message: "Exchange not found" }, { status: 404 });

    if (exchange.participant_a_id !== user.id && exchange.participant_b_id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (status === "COMPLETED" && exchange.status !== "COMPLETED") {
      // Selesaikan exchange dan tambahkan trust_score secara atomik dengan transaction
      const updatedExchange = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Update status exchange
        const ex = await tx.exchange.update({
          where: { id: exchangeId },
          data: { status: "COMPLETED" }
        });

        // 2. Tambah trust score ke participant A
        await tx.user.update({
          where: { id: exchange.participant_a_id },
          data: { trust_score: { increment: 10 } }
        });

        // 3. Tambah trust score ke participant B
        await tx.user.update({
          where: { id: exchange.participant_b_id },
          data: { trust_score: { increment: 10 } }
        });

        return ex;
      });

      return NextResponse.json(updatedExchange, { status: 200 });
    }

    if (status === "CANCELLED" && exchange.status !== "CANCELLED") {
      // Pembatalan sepihak: berikan penalti Trust Score -5 poin kepada pemohon pembatalan (user.id)
      const updatedExchange = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const ex = await tx.exchange.update({
          where: { id: exchangeId },
          data: { status: "CANCELLED" }
        });

        // Kurangi Trust Score pemohon (penalti pembatalan)
        await tx.user.update({
          where: { id: user.id },
          data: { trust_score: { decrement: 5 } }
        });

        // Ensure trust score tak kurang dari 0
        const updatedUser = await tx.user.findUnique({ where: { id: user.id } });
        if (updatedUser && updatedUser.trust_score < 0) {
          await tx.user.update({
            where: { id: user.id },
            data: { trust_score: 0 }
          });
        }

        return ex;
      });
      return NextResponse.json(updatedExchange, { status: 200 });
    }

    // Jika bukan diselesaikan atau dibatalkan sepihak (mungkin status lain di masa depan)
    const updated = await prisma.exchange.update({
      where: { id: exchangeId },
      data: { status }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating exchange:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
