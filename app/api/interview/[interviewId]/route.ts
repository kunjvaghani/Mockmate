import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ interviewId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { interviewId } = await params;

        const interview = await prisma.mockInterview.findUnique({
            where: { id: interviewId },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!interview || interview.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ interview });
    } catch (error) {
        console.error("Error fetching interview:", error);
        return NextResponse.json(
            { error: "Failed to fetch interview" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ interviewId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { interviewId } = await params;

        // Verify ownership
        const interview = await prisma.mockInterview.findUnique({
            where: { id: interviewId },
        });

        if (!interview || interview.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete all answers associated with this mock interview
        await prisma.userAnswer.deleteMany({
            where: { mockInterviewId: interviewId },
        });

        // Delete the mock interview itself
        await prisma.mockInterview.delete({
            where: { id: interviewId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting interview:", error);
        return NextResponse.json(
            { error: "Failed to delete interview" },
            { status: 500 }
        );
    }
}
