import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface Message {
    role: "user" | "model";
    parts: { text: string }[];
}

export async function generateNextQuestion(
    systemPrompt: string,
    chatHistory: Message[],
    newUserAnswer: string
): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL!,
        generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
        },
    });

    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            {
                role: "model",
                parts: [
                    {
                        text: "Understood. I am ready to conduct the mock interview. I will follow all the rules strictly. Let me begin with the first question.",
                    },
                ],
            },
            ...chatHistory,
        ],
    });

    const result = await chat.sendMessage(newUserAnswer);
    const response = result.response;
    return response.text();
}

export async function generateFeedback(feedbackPrompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL!,
        generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.3,
            responseMimeType: "application/json",
        },
    });

    const result = await model.generateContent(feedbackPrompt);
    const response = result.response;
    return response.text();
}
