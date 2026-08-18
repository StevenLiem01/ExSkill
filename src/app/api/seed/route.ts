import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.skill.createMany({
      data: [
        { name: 'Python', category: 'Programming' },
        { name: 'Arduino', category: 'IoT & Hardware' },
        { name: 'Unity 3D', category: 'Game Development' },
        { name: 'Machine Learning', category: 'Data Science' },
        { name: 'Cisco Networking', category: 'Networking' },
      ],
      skipDuplicates: true,
    });

    return NextResponse.json({ message: "Seeding berhasil!" }, { status: 200 });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ message: "Seeding gagal", error }, { status: 500 });
  }
}
