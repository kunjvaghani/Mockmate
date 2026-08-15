import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobRole, jobDesc, jobExperience, interviewMode = "STANDARD", resumeId } = await req.json();

        if (!jobRole || !jobDesc || !jobExperience) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const interview = await prisma.mockInterview.create({
            data: {
                userId,
                jobRole: jobRole.trim(),
                jobDesc: jobDesc.trim().slice(0, 5000), // Limit to prevent prompt injection
                jobExperience: String(jobExperience),
                interviewMode: interviewMode === "RESUME" ? "RESUME" : "STANDARD",
                resumeId: resumeId || null,
            },
        });

        return NextResponse.json({ interviewId: interview.id });
    } catch (error) {
        console.error("Error creating interview:", error);
        return NextResponse.json(
            { error: "Failed to create interview" },
            { status: 500 }
        );
    }
}
