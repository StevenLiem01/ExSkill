import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const sessionAuth = await getServerSession(authOptions);

    if (!sessionAuth || sessionAuth.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { is_active } = body;

    if (typeof is_active !== "boolean") {
      return NextResponse.json({ message: "is_active boolean flag is required" }, { status: 400 });
    }

    const updatedSkill = await prisma.skill.update({
      where: { id: params.id },
      data: { is_active }
    });

    return NextResponse.json(updatedSkill, { status: 200 });

  } catch (error) {
    console.error("[ADMIN_SKILLS_PATCH_ERROR]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
