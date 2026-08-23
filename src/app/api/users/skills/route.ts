import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Proficiency } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const body = await req.json();
    const { skill_id, type, proficiency } = body;

    if (!skill_id || !type) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (type === "OFFERED") {
      if (!proficiency) {
        return NextResponse.json({ message: "Proficiency required for offered skills" }, { status: 400 });
      }
      const newSkill = await prisma.userSkill.create({
        data: {
          user_id: user.id,
          skill_id,
          proficiency: proficiency as Proficiency,
        },
        include: { skill: true }
      });
      return NextResponse.json(newSkill, { status: 201 });

    } else if (type === "WANTED") {
      const newSkill = await prisma.wantedSkill.create({
        data: {
          user_id: user.id,
          skill_id,
        },
        include: { skill: true }
      });
      return NextResponse.json(newSkill, { status: 201 });

    } else {
      return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }
  } catch (error: unknown) {
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ message: "Skill already added to your profile" }, { status: 409 });
    }
    console.error("Error adding skill:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const searchParams = req.nextUrl.searchParams;
    const skill_id = searchParams.get('skill_id');
    const type = searchParams.get('type');

    if (!skill_id || !type) {
      return NextResponse.json({ message: "Missing required query parameters" }, { status: 400 });
    }

    if (type === "OFFERED") {
      await prisma.userSkill.delete({
        where: { user_id_skill_id: { user_id: user.id, skill_id } }
      });
      return NextResponse.json({ message: "Deleted" }, { status: 200 });

    } else if (type === "WANTED") {
      await prisma.wantedSkill.delete({
        where: { user_id_skill_id: { user_id: user.id, skill_id } }
      });
      return NextResponse.json({ message: "Deleted" }, { status: 200 });

    } else {
      return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error removing skill:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
