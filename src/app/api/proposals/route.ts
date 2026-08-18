import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const incoming = await prisma.exchangeProposal.findMany({
      where: { receiver_id: user.id },
      include: {
        sender: { select: { name: true, university: true, major: true, trust_score: true } },
        offered_skill: true,
        requested_skill: true,
      },
      orderBy: { created_at: 'desc' }
    });

    const outgoing = await prisma.exchangeProposal.findMany({
      where: { sender_id: user.id },
      include: {
        receiver: { select: { name: true, university: true, major: true, trust_score: true } },
        offered_skill: true,
        requested_skill: true,
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ incoming, outgoing }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const { receiver_id, offered_skill_id, requested_skill_id, message } = await req.json();

    if (!receiver_id || !offered_skill_id || !requested_skill_id) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 2. Buat proposal baru
    const newProposal = await prisma.exchangeProposal.create({
      data: {
        sender_id: user.id,
        receiver_id,
        offered_skill_id,
        requested_skill_id,
        message,
      }
    });

    // 3. Buat Notifikasi untuk Penerima
    await prisma.notification.create({
      data: {
        user_id: receiver_id,
        type: 'PROPOSAL_RECEIVED',
        message: `${user.name} mengajukan proposal pertukaran skill denganmu!`
      }
    });

    return NextResponse.json(newProposal, { status: 201 });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
