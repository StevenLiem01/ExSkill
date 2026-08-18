import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const { status } = await req.json();
    const validStatuses = ["ACCEPTED", "REJECTED", "CANCELLED", "PENDING"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }
    const proposal = await prisma.exchangeProposal.findUnique({ where: { id: proposalId } });

    if (!proposal) return NextResponse.json({ message: "Proposal not found" }, { status: 404 });
    if (proposal.receiver_id !== user.id && proposal.sender_id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Update status
    const updated = await prisma.exchangeProposal.update({
      where: { id: proposalId },
      data: { status }
    });

    // Jika proposal diterima (ACCEPTED), otomatis buat Exchange session
    if (status === "ACCEPTED") {
      // Cek apakah sudah ada exchange untuk proposal ini untuk mencegah duplikasi
      const existingExchange = await prisma.exchange.findUnique({ where: { proposal_id: proposal.id } });
      if (!existingExchange) {
        await prisma.exchange.create({
          data: {
            proposal_id: proposal.id,
            participant_a_id: proposal.sender_id,
            participant_b_id: proposal.receiver_id,
          }
        });
      }

      // Notifikasi untuk pengirim bahwa proposal diterima
      await prisma.notification.create({
        data: {
          user_id: proposal.sender_id,
          type: 'PROPOSAL_ACCEPTED',
          message: `${user.name} menerima proposal pertukaranmu! Ruang Pertukaran telah dibuat.`
        }
      });
    } else if (status === "REJECTED") {
      // Notifikasi untuk pengirim bahwa proposal ditolak
      await prisma.notification.create({
        data: {
          user_id: proposal.sender_id,
          type: 'PROPOSAL_REJECTED',
          message: `${user.name} menolak proposal pertukaranmu.`
        }
      });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
