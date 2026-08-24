import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
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

    if (currentUser.id === targetUserId) {
      return NextResponse.json({ message: "Cannot block yourself" }, { status: 400 });
    }

    // Check if the user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if already blocked
    const existingBlock = await prisma.block.findFirst({
      where: {
        blocker_id: currentUser.id,
        blocked_id: targetUserId
      }
    });

    if (existingBlock) {
      // Unblock
      await prisma.block.delete({
        where: { id: existingBlock.id }
      });
      return NextResponse.json({ message: "Unblocked successfully", blocked: false }, { status: 200 });
    } else {
      // Block
      await prisma.block.create({
        data: {
          blocker_id: currentUser.id,
          blocked_id: targetUserId
        }
      });
      return NextResponse.json({ message: "Blocked successfully", blocked: true }, { status: 200 });
    }

  } catch (error: unknown) {
    console.error("[BLOCK_TOGGLE_ERROR]", error);
    return NextResponse.json({ message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
