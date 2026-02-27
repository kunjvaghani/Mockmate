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
        model: "gemini-2.5-flash",
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
        model: "gemini-2.0-flash",
        generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.3,
        },
    });

    const result = await model.generateContent(feedbackPrompt);
    const response = result.response;
    return response.text();
}
