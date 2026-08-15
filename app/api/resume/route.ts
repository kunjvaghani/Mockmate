import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const resumeId = searchParams.get("id");

        if (resumeId) {
            const resume = await prisma.userResume.findFirst({
                where: { id: resumeId, userId },
            });
            return NextResponse.json({ resume });
        }

        // Fetch all resumes for this user, newest first
        const resumes = await prisma.userResume.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            resumes,
            resume: resumes[0] || null, // latest active resume as default
        });
    } catch (error) {
        console.error("Error fetching user resumes:", error);
        return NextResponse.json(
            { error: "Failed to fetch resumes" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const resumeId = searchParams.get("id");

        if (resumeId) {
            await prisma.userResume.deleteMany({
                where: { id: resumeId, userId },
            });
        } else {
            await prisma.userResume.deleteMany({
                where: { userId },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting resume:", error);
        return NextResponse.json(
            { error: "Failed to delete resume" },
            { status: 500 }
        );
    }
}
