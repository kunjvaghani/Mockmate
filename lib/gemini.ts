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

export async function parseResumeWithGemini(rawResumeText: string): Promise<{
    parsedRole: string;
    techStack: string;
    experience: string;
    skills: string[];
    summary: string;
    projects: Array<{ name: string; tech?: string; description?: string }>;
}> {
    const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.1,
            responseMimeType: "application/json",
        },
    });

    const sanitizedRawText = rawResumeText
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
        .slice(0, 15000);

    const prompt = `You are an expert technical recruiter and resume parser.
Analyze the following resume text and extract key structured information in valid JSON.

SCHEMA:
{
  "parsedRole": "Primary job title / domain (e.g. Full Stack Developer, Frontend Engineer, Backend Developer)",
  "techStack": "Comma-separated list of core technologies (e.g. React, Node.js, TypeScript, PostgreSQL)",
  "experience": "Estimated total years of professional experience as a single number string (e.g. '2')",
  "skills": ["Short atomic skill name (e.g. React, Python, MongoDB, LangChain - NO sentences)"],
  "summary": "2-3 sentence executive summary of the candidate's technical profile",
  "projects": [
    {
      "name": "Project or role title",
      "tech": "Technologies used",
      "description": "Brief description of achievements"
    }
  ]
}

RESUME TEXT:
${sanitizedRawText}`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        // Strip markdown fences if present
        if (text.startsWith("```json")) {
            text = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
        } else if (text.startsWith("```")) {
            text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        // Extract JSON between first { and last }
        const firstBrace = text.indexOf("{");
        const lastBrace = text.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(text);

        return {
            parsedRole: parsed.parsedRole || "Software Engineer",
            techStack: parsed.techStack || "JavaScript, TypeScript, React, Node.js",
            experience: String(parsed.experience || "1").replace(/[^0-9]/g, "") || "1",
            skills: Array.isArray(parsed.skills) ? parsed.skills : ["React", "TypeScript", "Node.js"],
            summary: parsed.summary || "Software developer with experience across modern web technologies.",
            projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        };
    } catch (parseErr) {
        console.error("Gemini JSON parse failed, utilizing fallback structure:", parseErr);
        return {
            parsedRole: "Software Engineer",
            techStack: "JavaScript, TypeScript, React, Node.js, Databases",
            experience: "1",
            skills: ["JavaScript", "TypeScript", "React", "Node.js"],
            summary: "Experienced technical candidate specializing in software engineering.",
            projects: [],
        };
    }
}


