import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const resume = await prisma.resumeHistory.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        fileName: true,
        uploadedAt: true,
        resumeData: true,
      },
    });

    if (!resume) {
      return NextResponse.json(
        { message: "Resume not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Fetch resume error:", error);
    return NextResponse.json(
      { message: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingResume = await prisma.resumeHistory.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingResume) {
      return NextResponse.json(
        { message: "Resume not found" },
        { status: 404 }
      );
    }

    await prisma.resumeHistory.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json(
      { message: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
