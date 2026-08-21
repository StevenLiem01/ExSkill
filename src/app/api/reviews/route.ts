import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reviewer = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!reviewer) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const body = await req.json();
    const { exchange_id, rating, comment } = body;

    if (!exchange_id || !rating || !comment) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Pastikan nilai rating antara 1 dan 5
    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ message: "Invalid rating value" }, { status: 400 });
    }

    // Ambil detail exchange untuk validasi
    const exchange = await prisma.exchange.findUnique({
      where: { id: exchange_id }
    });

    if (!exchange) {
      return NextResponse.json({ message: "Exchange not found" }, { status: 404 });
    }

    if (exchange.status !== "COMPLETED") {
      return NextResponse.json({ message: "Hanya pertukaran yang sudah selesai yang bisa diulas" }, { status: 400 });
    }

    // Validasi apakah user adalah partisipan dalam exchange ini
    if (exchange.participant_a_id !== reviewer.id && exchange.participant_b_id !== reviewer.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Tentukan reviewee (pihak yang di-review)
    const reviewee_id = exchange.participant_a_id === reviewer.id ? exchange.participant_b_id : exchange.participant_a_id;

    // Cek apakah reviewer sudah memberikan ulasan untuk exchange ini (berdasarkan constraint unique)
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewer_id_exchange_id: {
          reviewer_id: reviewer.id,
          exchange_id: exchange.id
        }
      }
    });

    if (existingReview) {
      return NextResponse.json({ message: "Anda sudah memberikan ulasan untuk pertukaran ini" }, { status: 400 });
    }

    // Simpan ulasan ke database
    const newReview = await prisma.review.create({
      data: {
        exchange_id,
        reviewer_id: reviewer.id,
        reviewee_id,
        rating: parsedRating,
        comment
      }
    });

    // Kirim notifikasi ke orang yang di-review
    await prisma.notification.create({
      data: {
        user_id: reviewee_id,
        title: 'Ulasan Baru',
        link: '/profile',
        message: `${reviewer.name} baru saja memberikan ulasan ${parsedRating} Bintang untuk Anda!`
      }
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
