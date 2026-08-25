import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sessionAuth = await getServerSession(authOptions);

    if (!sessionAuth || sessionAuth.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const skills = await prisma.skill.findMany({
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json(skills, { status: 200 });

  } catch (error) {
    console.error("[ADMIN_SKILLS_GET_ERROR]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionAuth = await getServerSession(authOptions);

    if (!sessionAuth || sessionAuth.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, category } = body;

    if (!name || !category) {
      return NextResponse.json({ message: "Name and category are required" }, { status: 400 });
    }

    // Check if skill exists
    const existing = await prisma.skill.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return NextResponse.json({ message: "Skill already exists" }, { status: 400 });
    }

    const newSkill = await prisma.skill.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        is_active: true
      }
    });

    return NextResponse.json(newSkill, { status: 201 });

  } catch (error) {
    console.error("[ADMIN_SKILLS_POST_ERROR]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
