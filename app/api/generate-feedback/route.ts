import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateFeedback } from "@/lib/gemini";
import { buildFeedbackPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { interviewId } = await req.json();

        if (!interviewId) {
            return NextResponse.json(
                { error: "Missing interviewId" },
                { status: 400 }
            );
        }

        // Fetch interview with all messages
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

        // If feedback already exists, return it immediately
        if (interview.feedbackJson) {
            console.log("FeedBack already foounded")
            try {
                const parsedFeedback = JSON.parse(interview.feedbackJson);
                return NextResponse.json({ feedback: parsedFeedback });
            } catch (err) {
                console.error("Failed to parse cached feedback JSON:", err);
                // Fallback to generating new feedback if parsing fails
            }
        }

        // Build transcript for evaluation
        const transcript = interview.messages.map((msg) => ({
            question: msg.question,
            userAnswer: msg.userAnswer || "",
        }));

        if (transcript.length === 0) {
            return NextResponse.json(
                { error: "No interview data to evaluate" },
                { status: 400 }
            );
        }

        // Build feedback prompt
        const feedbackPrompt = buildFeedbackPrompt(
            interview.jobRole,
            interview.jobExperience,
            transcript
        );

        // Call Gemini for feedback
        const rawFeedback = await generateFeedback(feedbackPrompt);

        // Parse JSON from response (handle markdown code blocks)
        let feedbackJson;
        try {
            const jsonMatch = rawFeedback.match(/```(?:json)?\s*([\s\S]*?)```/);
            const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawFeedback.trim();
            feedbackJson = JSON.parse(jsonStr);
        } catch {
            // Retry: try to find JSON object in the response
            const jsonStart = rawFeedback.indexOf("{");
            const jsonEnd = rawFeedback.lastIndexOf("}");
            if (jsonStart !== -1 && jsonEnd !== -1) {
                try {
                    feedbackJson = JSON.parse(
                        rawFeedback.substring(jsonStart, jsonEnd + 1)
                    );
                } catch {
                    console.error("Failed to parse feedback JSON:", rawFeedback);
                    return NextResponse.json(
                        { error: "Failed to parse AI feedback" },
                        { status: 500 }
                    );
                }
            } else {
                return NextResponse.json(
                    { error: "Failed to parse AI feedback" },
                    { status: 500 }
                );
            }
        }

        // Update each message with AI feedback and rating
        if (feedbackJson.questionFeedback) {
            for (let i = 0; i < feedbackJson.questionFeedback.length; i++) {
                const qFeedback = feedbackJson.questionFeedback[i];
                const message = interview.messages[i];
                if (message) {
                    await prisma.userAnswer.update({
                        where: { id: message.id },
                        data: {
                            aiFeedback: qFeedback.feedback,
                            aiRating: qFeedback.rating,
                        },
                    });
                }
            }
        }

        // Store generated feedback in database
        await prisma.mockInterview.update({
            where: { id: interviewId },
            data: {
                feedbackJson: JSON.stringify(feedbackJson)
            }
        });

        return NextResponse.json({ feedback: feedbackJson });
    } catch (error) {
        console.error("Error generating feedback:", error);
        return NextResponse.json(
            { error: "Failed to generate feedback" },
            { status: 500 }
        );
    }
}
