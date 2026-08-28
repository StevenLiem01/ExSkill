import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LogCategory, LogLevel } from "@prisma/client";

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
      take: 200,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
