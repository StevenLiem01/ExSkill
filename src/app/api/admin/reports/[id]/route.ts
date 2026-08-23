import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["RESOLVE", "DISMISS"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    if (action === "DISMISS") {
      const updatedReport = await prisma.report.update({
        where: { id },
        data: { status: "DISMISSED" }
      });
      return NextResponse.json(updatedReport);
    } 
    
    if (action === "RESOLVE") {
      // Menggunakan transaction untuk update report dan ban user sekaligus
      const [updatedReport, bannedUser] = await prisma.$transaction([
        prisma.report.update({
          where: { id },
          data: { status: "RESOLVED" }
        }),
        prisma.user.update({
          where: { id: report.reported_user_id },
          data: { is_banned: true }
        })
      ]);
      
      return NextResponse.json({ report: updatedReport, user: bannedUser });
    }

    return NextResponse.json({ message: "Unknown error" }, { status: 500 });
  } catch (error) {
    console.error("[ADMIN_REPORT_PATCH]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
