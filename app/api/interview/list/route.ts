import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const interviews = await prisma.mockInterview.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                jobRole: true,
                jobExperience: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ interviews });
    } catch (error) {
        console.error("Error listing interviews:", error);
        return NextResponse.json(
            { error: "Failed to list interviews" },
            { status: 500 }
        );
    }
}
