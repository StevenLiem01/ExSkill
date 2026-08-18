import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const isValidUrl = (urlStr: string) => {
  try {
    new URL(urlStr);
    return true;
  } catch (err) {
    return false;
  }
};

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { bio, githubUrl, linkedinUrl, portfolioUrl, university, major } = body;

    // Reject updates to read-only fields
    if (university !== undefined || major !== undefined) {
      return NextResponse.json(
        { message: "Update to read-only fields (university, major) is not allowed." },
        { status: 400 }
      );
    }

    // Validations
    if (bio !== undefined && bio !== null && bio !== "") {
      if (bio.length < 10 || bio.length > 200) {
        return NextResponse.json(
          { message: "Bio harus antara 10 hingga 200 karakter." },
          { status: 400 }
        );
      }
    }

    if (githubUrl && !isValidUrl(githubUrl)) {
      return NextResponse.json({ message: "Format URL GitHub tidak valid." }, { status: 400 });
    }
    if (linkedinUrl && !isValidUrl(linkedinUrl)) {
      return NextResponse.json({ message: "Format URL LinkedIn tidak valid." }, { status: 400 });
    }
    if (portfolioUrl && !isValidUrl(portfolioUrl)) {
      return NextResponse.json({ message: "Format URL Portofolio tidak valid." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        bio: bio ?? currentUser.bio,
        githubUrl: githubUrl === "" ? null : githubUrl ?? currentUser.githubUrl,
        linkedinUrl: linkedinUrl === "" ? null : linkedinUrl ?? currentUser.linkedinUrl,
        portfolioUrl: portfolioUrl === "" ? null : portfolioUrl ?? currentUser.portfolioUrl,
      },
    });

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
