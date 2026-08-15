import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resume = await prisma.userResume.findUnique({
            where: { userId },
        });

        return NextResponse.json({ resume });
    } catch (error) {
        console.error("Error fetching user resume:", error);
        return NextResponse.json(
            { error: "Failed to fetch resume" },
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

        await prisma.userResume.deleteMany({
            where: { userId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user resume:", error);
        return NextResponse.json(
            { error: "Failed to delete resume" },
            { status: 500 }
        );
    }
}
