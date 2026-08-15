import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseResumeStructured } from "@/lib/resume-parser";
import mammoth from "mammoth";
import PDFParser from "pdf2json";

// Node-native PDF Parser (no DOMMatrix / browser dependency)
function extractTextFromPdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new (PDFParser as any)(null, 1);

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error("PDF parse error:", errData);
            reject(new Error("Failed to parse PDF data"));
        });

        pdfParser.on("pdfParser_dataReady", () => {
            try {
                const rawText = pdfParser.getRawTextContent();
                // Clean up decoded URI artifacts if any
                try {
                    resolve(decodeURIComponent(rawText));
                } catch {
                    resolve(rawText);
                }
            } catch (err) {
                reject(err);
            }
        });

        pdfParser.parseBuffer(buffer);
    });
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const fileName = file.name;
        const fileSize = file.size;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let rawText = "";

        if (fileName.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
            rawText = await extractTextFromPdf(buffer);
        } else if (
            fileName.toLowerCase().endsWith(".docx") ||
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            rawText = await extractTextFromDocx(buffer);
        } else if (fileName.toLowerCase().endsWith(".txt") || file.type === "text/plain") {
            rawText = buffer.toString("utf-8");
        } else {
            return NextResponse.json(
                { error: "Unsupported file format. Please upload a .pdf, .docx, or .txt resume." },
                { status: 400 }
            );
        }

        if (!rawText || rawText.trim().length < 30) {
            return NextResponse.json(
                { error: "Could not extract sufficient text from the resume. Please check the file." },
                { status: 400 }
            );
        }

        // Parse structured data using selected AI model (Gemini or Mistral based on env)
        const parsed = await parseResumeStructured(rawText);

        // Upsert into MongoDB UserResume
        const savedResume = await prisma.userResume.upsert({
            where: { userId },
            update: {
                fileName,
                fileSize,
                rawText: rawText.slice(0, 50000),
                parsedRole: parsed.parsedRole,
                techStack: parsed.techStack,
                experience: parsed.experience,
                skills: parsed.skills || [],
                summary: parsed.summary,
                projectsJson: JSON.stringify(parsed.projects || []),
            },
            create: {
                userId,
                fileName,
                fileSize,
                rawText: rawText.slice(0, 50000),
                parsedRole: parsed.parsedRole,
                techStack: parsed.techStack,
                experience: parsed.experience,
                skills: parsed.skills || [],
                summary: parsed.summary,
                projectsJson: JSON.stringify(parsed.projects || []),
            },
        });

        return NextResponse.json({
            success: true,
            resume: savedResume,
        });
    } catch (error) {
        console.error("Error parsing resume:", error);
        return NextResponse.json(
            { error: "Failed to parse resume. Please try again or upload another file." },
            { status: 500 }
        );
    }
}
