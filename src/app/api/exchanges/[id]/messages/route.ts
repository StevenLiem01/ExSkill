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
    
    if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const exchange = await prisma.exchange.findUnique({ where: { id: exchangeId } });
    if (!exchange) return NextResponse.json({ message: "Exchange not found" }, { status: 404 });

    if (exchange.participant_a_id !== user.id && exchange.participant_b_id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { exchange_id: exchangeId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { created_at: 'asc' }
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
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
    
    if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const exchange = await prisma.exchange.findUnique({ where: { id: exchangeId } });
    if (!exchange) return NextResponse.json({ message: "Exchange not found" }, { status: 404 });

    if (exchange.participant_a_id !== user.id && exchange.participant_b_id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { content, file_url, file_name } = await req.json();
    if ((!content || typeof content !== "string") && !file_url) {
      return NextResponse.json({ message: "Content or file is required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        exchange_id: exchangeId,
        sender_id: user.id,
        content: content || "",
        file_url,
        file_name
      },
      include: { sender: { select: { id: true, name: true } } }
    });

    // 2. Buat Notifikasi untuk partner
    const receiverId = exchange.participant_a_id === user.id ? exchange.participant_b_id : exchange.participant_a_id;
    await prisma.notification.create({
      data: {
        user_id: receiverId,
        title: "Pesan Baru",
        type: "CHAT_MESSAGE",
        link: `/exchanges/${exchangeId}`,
        message: `Pesan dari ${user.name}: ${content ? (content.length > 30 ? content.substring(0, 30) + '...' : content) : 'Mengirimkan sebuah lampiran.'}`
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
