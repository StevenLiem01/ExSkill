import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const sessionAuth = await getServerSession(authOptions);

    if (!sessionAuth || sessionAuth.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const adminEmail = sessionAuth.user.email!;
    const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!adminUser) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action, resolution, penalizedUserId } = body; 
    // action: "RESOLVED" or "REJECTED"
    // resolution: text from admin
    // penalizedUserId: ID of the user who gets trust penalty (optional)

    if (!action || !["RESOLVED", "REJECTED"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const disputeId = params.id;

    // Run within a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Update dispute status
      await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: action,
          admin_id: adminUser.id,
          resolution: resolution || (action === "RESOLVED" ? "Dispute resolved by Admin" : "Dispute rejected by Admin"),
          resolved_at: new Date()
        }
      });

      // 2. Apply Trust Penalty if applicable
      if (penalizedUserId && action === "RESOLVED") {
        await tx.user.update({
          where: { id: penalizedUserId },
          data: {
            trust_score: {
              decrement: 15 // Penalty defined in PRD plan
            }
          }
        });
        
        // Ensure trust_score doesn't go below 0 (Prisma doesn't have max/min functions in update natively)
        const updatedUser = await tx.user.findUnique({ where: { id: penalizedUserId } });
        if (updatedUser && updatedUser.trust_score < 0) {
          await tx.user.update({
            where: { id: penalizedUserId },
            data: { trust_score: 0 }
          });
        }
      }
    });

    return NextResponse.json({ message: `Dispute has been ${action}` }, { status: 200 });

  } catch (error) {
    console.error("[ADMIN_DISPUTES_UPDATE_ERROR]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
