import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LogCategory } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const userIdParam = searchParams.get("userId");

    const where: any = {};
    
    if (categoryParam && Object.values(LogCategory).includes(categoryParam as LogCategory)) {
      where.category = categoryParam;
    }
    
    if (userIdParam) {
      where.user_id = userIdParam;
    }

    const logs = await prisma.systemLog.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    let txtContent = "=== EXSKILL SYSTEM LOGS ===\n";
    txtContent += `Generated at: ${new Date().toISOString()}\n`;
    txtContent += `Filters: Category=${categoryParam || "ALL"}, UserID=${userIdParam || "ALL"}\n`;
    txtContent += "===========================\n\n";

    logs.forEach((log: any) => {
      const timestamp = new Date(log.created_at).toISOString();
      const user = log.user ? `${log.user.name} (${log.user.email})` : "SYSTEM/ANONYMOUS";
      
      txtContent += `[${timestamp}] [${log.level}] [${log.category}]\n`;
      txtContent += `Action : ${log.action}\n`;
      txtContent += `User   : ${user}\n`;
      if (log.details) {
        txtContent += `Details: ${log.details}\n`;
      }
      txtContent += `--------------------------------------------------\n`;
    });

    // Create a plain text response with attachment headers
    return new NextResponse(txtContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="exskill-logs-${Date.now()}.txt"`,
      },
    });

  } catch (error) {
    console.error("Failed to export logs:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
