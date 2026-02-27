import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
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

        // Mark as ended
        await prisma.mockInterview.update({
            where: { id: interviewId },
            data: { ended: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error ending interview:", error);
        return NextResponse.json(
            { error: "Failed to end interview" },
            { status: 500 }
        );
    }
}
