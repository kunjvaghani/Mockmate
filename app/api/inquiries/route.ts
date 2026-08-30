import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/inquiries — Fetch the current authenticated user's own inquiries
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const inquiries = await prisma.userInquiry.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ inquiries });
    } catch (error) {
        console.error("Error fetching user inquiries:", error);
        return NextResponse.json(
            { error: "Failed to fetch inquiries" },
            { status: 500 }
        );
    }
}

// POST /api/inquiries — Submit a new user inquiry / feedback
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await currentUser();
        const body = await req.json();
        const { subject, message, category, mockInterviewId } = body;

        if (!subject?.trim() || !message?.trim()) {
            return NextResponse.json(
                { error: "Subject and message are required" },
                { status: 400 }
            );
        }

        const userEmail = user?.primaryEmailAddress?.emailAddress || null;
        const userName =
            user?.fullName ||
            [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
            "Candidate";

        const inquiry = await prisma.userInquiry.create({
            data: {
                userId,
                userEmail,
                userName,
                mockInterviewId: mockInterviewId || null,
                category: category || "GENERAL_QUESTION",
                subject: subject.trim(),
                message: message.trim(),
                status: "PENDING",
            },
        });

        return NextResponse.json({ success: true, inquiry }, { status: 201 });
    } catch (error) {
        console.error("Error submitting inquiry:", error);
        return NextResponse.json(
            { error: "Failed to submit inquiry" },
            { status: 500 }
        );
    }
}
