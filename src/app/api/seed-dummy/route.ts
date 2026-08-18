import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Proficiency } from "@prisma/client";

export async function GET() {
  try {
    // 1. Ambil 2 Skill dari database
    const skills = await prisma.skill.findMany({
      take: 2,
    });

    if (skills.length < 2) {
      return NextResponse.json(
        { message: "Minimal harus ada 2 skill di database sebelum membuat dummy." },
        { status: 400 }
      );
    }

    // Periksa apakah user dummy sudah ada agar tidak error duplikat email
    const existingUser = await prisma.user.findUnique({
      where: { email: 'budi@dummy.com' }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Dummy user sudah ada di database!" }, { status: 200 });
    }

    // 2, 3, & 4. Buat user dummy beserta relasi skill-nya
    await prisma.user.create({
      data: {
        name: 'Budi Santoso',
        email: 'budi@dummy.com',
        university: 'Universitas Indonesia',
        major: 'Sistem Informasi',
        bio: 'Senang berbagi ilmu!',
        trust_score: 95,
        owned_skills: {
          create: {
            proficiency: Proficiency.INTERMEDIATE,
            skill: { connect: { id: skills[0].id } }
          }
        },
        wanted_skills: {
          create: {
            skill: { connect: { id: skills[1].id } }
          }
        }
      }
    });

    // 5. Kembalikan respons berhasil
    return NextResponse.json({ message: "Dummy user berhasil dibuat!" }, { status: 200 });
  } catch (error) {
    console.error("Seeding dummy error:", error);
    return NextResponse.json({ message: "Pembuatan dummy gagal", error }, { status: 500 });
  }
}
