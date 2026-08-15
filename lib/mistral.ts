export async function parseResumeWithMistral(rawResumeText: string): Promise<{
    parsedRole: string;
    techStack: string;
    experience: string;
    skills: string[];
    summary: string;
    projects: Array<{ name: string; tech?: string; description?: string }>;
}> {
    const apiKey =
        process.env.MISTRAL_API_KEY ||
        process.env.MISTRAL_KEY ||
        process.env.MISTRAL_AI_KEY;

    if (!apiKey) {
        throw new Error("Mistral API key is not configured in environment variables.");
    }

    const modelName = process.env.MISTRAL_MODEL || "ministral-8b-2512";

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
        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    {
                        role: "system",
                        content: "You are a professional resume parser. Always respond with pure valid JSON only.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
                max_tokens: 4096,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Mistral API error response:", errText);
            throw new Error(`Mistral API returned status ${response.status}`);
        }

        const data = await response.json();
        let text = data.choices?.[0]?.message?.content?.trim() || "{}";

        // Clean JSON boundaries & markdown fences
        if (text.startsWith("```json")) {
            text = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
        } else if (text.startsWith("```")) {
            text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

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
        console.error("Mistral parsing failed:", parseErr);
        throw parseErr;
    }
}
