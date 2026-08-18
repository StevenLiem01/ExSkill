import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const exchange = await prisma.exchange.findUnique({ where: { id: exchangeId } });
    if (!exchange) return NextResponse.json({ message: "Exchange not found" }, { status: 404 });

    if (exchange.participant_a_id !== user.id && exchange.participant_b_id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { action } = await req.json();

    if (action === "START") {
      if (exchange.session_status !== "NOT_STARTED") {
        return NextResponse.json({ message: "Sesi sudah berjalan atau selesai" }, { status: 400 });
      }

      let agreedToStart = [...exchange.agreed_to_start];
      if (!agreedToStart.includes(user.id)) {
        agreedToStart.push(user.id);
      }

      const isBothAgreed = agreedToStart.length === 2;
      const newStatus = isBothAgreed ? "IN_PROGRESS" : exchange.session_status;

      const updatedExchange = await prisma.exchange.update({
        where: { id: exchangeId },
        data: {
          agreed_to_start: agreedToStart,
          session_status: newStatus
        }
      });

      return NextResponse.json(updatedExchange, { status: 200 });

    } else if (action === "END") {
      if (exchange.session_status !== "IN_PROGRESS") {
        return NextResponse.json({ message: "Sesi belum berjalan atau sudah selesai" }, { status: 400 });
      }

      let agreedToEnd = [...exchange.agreed_to_end];
      if (!agreedToEnd.includes(user.id)) {
        agreedToEnd.push(user.id);
      }

      const isBothAgreed = agreedToEnd.length === 2;
      const newStatus = isBothAgreed ? "COMPLETED" : exchange.session_status;

      const updatedExchange = await prisma.exchange.update({
        where: { id: exchangeId },
        data: {
          agreed_to_end: agreedToEnd,
          session_status: newStatus,
          // Secara otomatis menyelesaikan status utama juga jika COMPLETED
          status: isBothAgreed ? "COMPLETED" : exchange.status
        }
      });

      // Jika kedua pihak setuju mengakhiri, otomatiskan trust score juga
      if (isBothAgreed) {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: exchange.participant_a_id },
            data: { trust_score: { increment: 10 } }
          }),
          prisma.user.update({
            where: { id: exchange.participant_b_id },
            data: { trust_score: { increment: 10 } }
          })
        ]).catch(err => console.error("Error updating trust scores:", err));
      }

      return NextResponse.json(updatedExchange, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating session status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
