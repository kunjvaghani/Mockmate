import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNextQuestion } from "@/lib/gemini";
import { buildSystemPrompt } from "@/lib/prompts";

const INTERVIEW_COMPLETE_TOKEN = "[INTERVIEW_COMPLETE]";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { interviewId, userAnswer } = await req.json();

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

        // Build system prompt
        const systemPrompt = buildSystemPrompt(
            interview.jobRole,
            interview.jobExperience,
            interview.jobDesc
        );

        // Reconstruct chat history for Gemini
        const chatHistory = interview.messages.flatMap((msg) => {
            const parts = [];
            // AI asked a question
            parts.push({
                role: "model" as const,
                parts: [{ text: msg.question }],
            });
            // User answered
            if (msg.userAnswer) {
                parts.push({
                    role: "user" as const,
                    parts: [{ text: msg.userAnswer }],
                });
            }
            return parts;
        });

        // Determine user message
        const userMessage = userAnswer || "Please start the interview with the first question.";

        // Call Gemini
        const aiResponse = await generateNextQuestion(
            systemPrompt,
            chatHistory,
            userMessage
        );

        const isComplete = aiResponse.includes(INTERVIEW_COMPLETE_TOKEN);
        const cleanedQuestion = aiResponse
            .replace(INTERVIEW_COMPLETE_TOKEN, "")
            .trim();

        // Save the Q&A pair
        if (userAnswer) {
            // Update the last message with the user's answer if it exists
            const lastMessage = interview.messages[interview.messages.length - 1];
            if (lastMessage && !lastMessage.userAnswer) {
                await prisma.userAnswer.update({
                    where: { id: lastMessage.id },
                    data: { userAnswer: userAnswer },
                });
            }
        }

        // Create new message with the AI's question (if not complete)
        if (!isComplete && cleanedQuestion) {
            await prisma.userAnswer.create({
                data: {
                    mockInterviewId: interviewId,
                    question: cleanedQuestion,
                },
            });
        }

        return NextResponse.json({
            question: cleanedQuestion || null,
            isComplete,
            questionNumber: interview.messages.length + 1,
        });
    } catch (error) {
        console.error("Error generating question:", error);
        return NextResponse.json(
            { error: "Failed to generate question" },
            { status: 500 }
        );
    }
}
