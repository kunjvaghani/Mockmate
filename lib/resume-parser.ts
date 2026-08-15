import { parseResumeWithGemini } from "@/lib/gemini";
import { parseResumeWithMistral } from "@/lib/mistral";

export async function parseResumeStructured(rawResumeText: string): Promise<{
    parsedRole: string;
    techStack: string;
    experience: string;
    skills: string[];
    summary: string;
    projects: Array<{ name: string; tech?: string; description?: string }>;
}> {
    // Check environment variable for model selection
    const selectedModel = (
        process.env["structure_o/p_model"] ||
        process.env.STRUCTURE_OUTPUT_MODEL ||
        process.env.STRUCTURE_OP_MODEL ||
        process.env.structure_output_model ||
        process.env.STRUCTURE_MODEL ||
        "gemini"
    ).toLowerCase();

    if (selectedModel.includes("mistral")) {
        console.log("Parsing resume with Mistral AI (ministral-8b-2512)...");
        try {
            return await parseResumeWithMistral(rawResumeText);
        } catch (mistralError) {
            console.error("Mistral parsing failed, falling back to Gemini:", mistralError);
            return await parseResumeWithGemini(rawResumeText);
        }
    } else {
        console.log("Parsing resume with Google Gemini AI...");
        return await parseResumeWithGemini(rawResumeText);
    }
}
