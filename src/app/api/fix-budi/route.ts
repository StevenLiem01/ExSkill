import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const budi = await prisma.user.findUnique({ where: { email: 'budi@dummy.com' } });
    
    if (!budi) {
      return NextResponse.json({ message: "Budi tidak ditemukan!" }, { status: 404 });
    }

    // Hapus relasi lama
    await prisma.userSkill.deleteMany({ where: { user_id: budi.id } });
    await prisma.wantedSkill.deleteMany({ where: { user_id: budi.id } });

    // Cari Machine Learning dan Arduino
    const ml = await prisma.skill.findFirst({ where: { name: { contains: 'Machine Learning' } } });
    const arduino = await prisma.skill.findFirst({ where: { name: { contains: 'Arduino' } } });

    if (!ml || !arduino) {
      return NextResponse.json({ message: "Skill ML atau Arduino tidak ditemukan!" }, { status: 404 });
    }

    // Budi MENAWARKAN Arduino (Karena User MENCARI Arduino)
    await prisma.userSkill.create({
      data: {
        user_id: budi.id,
        skill_id: arduino.id,
        proficiency: 'INTERMEDIATE'
      }
    });

    // Budi MENCARI Machine Learning (Karena User MENAWARKAN Machine Learning)
    await prisma.wantedSkill.create({
      data: {
        user_id: budi.id,
        skill_id: ml.id
      }
    });

    return NextResponse.json({ message: "Selesai! Budi sekarang menawarkan Arduino dan mencari Machine Learning. Silakan cari partner lagi!" }, { status: 200 });
  } catch (error) {
    console.error("Fix Budi error:", error);
    return NextResponse.json({ message: "Gagal memperbaiki Budi", error }, { status: 500 });
  }
}
