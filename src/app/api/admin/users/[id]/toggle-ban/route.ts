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

    // Cegah admin memblokir dirinya sendiri
    if (session.user.id === id) {
      return NextResponse.json({ message: "Anda tidak dapat memblokir akun Anda sendiri." }, { status: 400 });
    }

    const userToToggle = await prisma.user.findUnique({ where: { id } });
    if (!userToToggle) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { is_banned: !userToToggle.is_banned }
    });

    return NextResponse.json({
      message: updatedUser.is_banned ? "Pengguna diblokir." : "Blokir dibuka.",
      user: updatedUser
    });
  } catch (error) {
    console.error("[ADMIN_TOGGLE_BAN_PATCH]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
