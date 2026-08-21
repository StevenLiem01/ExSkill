import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { bio, githubUrl, linkedinUrl, portfolioUrl } = body;

    // Validation
    const isValidUrl = (urlStr: string) => {
      if (!urlStr) return true;
      try {
        new URL(urlStr);
        return true;
      } catch {
        return false;
      }
    };

    if (bio && (bio.length < 10 || bio.length > 200)) {
      return NextResponse.json({ message: "Bio harus antara 10 - 200 karakter" }, { status: 400 });
    }

    if (!isValidUrl(githubUrl) || !isValidUrl(linkedinUrl) || !isValidUrl(portfolioUrl)) {
      return NextResponse.json({ message: "Format URL tidak valid (harus menyertakan http:// atau https://)" }, { status: 400 });
    }

    // Update the database
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        bio: bio === "" ? null : bio ?? currentUser.bio,
        githubUrl: githubUrl === "" ? null : githubUrl ?? currentUser.githubUrl,
        linkedinUrl: linkedinUrl === "" ? null : linkedinUrl ?? currentUser.linkedinUrl,
        portfolioUrl: portfolioUrl === "" ? null : portfolioUrl ?? currentUser.portfolioUrl,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error: any) {
    console.error("[PROFILE_UPDATE_ERROR]", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}