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
