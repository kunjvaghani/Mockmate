"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    BrainCircuit,
    Briefcase,
    FileText,
    Clock,
    ArrowLeft,
    Loader2,
    Sparkles,
    UploadCloud,
    FileCheck2,
    CheckCircle2,
    RefreshCw,
    X,
    Target,
    Layers,
    FileUp,
} from "lucide-react";
import Link from "next/link";

interface SavedResume {
    id: string;
    fileName: string;
    fileSize: number;
    parsedRole?: string;
    techStack?: string;
    experience?: string;
    skills?: string[];
    summary?: string;
    projectsJson?: string;
    updatedAt: string;
}

function NewInterviewForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Mode: "STANDARD" or "RESUME"
    const [interviewMode, setInterviewMode] = useState<"STANDARD" | "RESUME">("STANDARD");

    const [loading, setLoading] = useState(false);
    const [fetchingResume, setFetchingResume] = useState(true);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const [savedResume, setSavedResume] = useState<SavedResume | null>(null);
    const [showUploadDropzone, setShowUploadDropzone] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        jobRole: "",
        jobDesc: "",
        jobExperience: "1",
    });

    // Check for query params & fetch existing resume on load
    useEffect(() => {
        const role = searchParams.get("role");
        const desc = searchParams.get("desc");
        const exp = searchParams.get("exp");

        if (role || desc || exp) {
            setFormData((prev) => ({
                jobRole: role ?? prev.jobRole,
                jobDesc: desc ?? prev.jobDesc,
                jobExperience: exp ?? prev.jobExperience ?? "1",
            }));
        }

        // Fetch saved resume
        async function loadResume() {
            try {
                const res = await fetch("/api/resume");
                if (res.ok) {
                    const data = await res.json();
                    if (data.resume) {
                        setSavedResume(data.resume);
                    }
                }
            } catch (err) {
                console.error("Error loading resume:", err);
            } finally {
                setFetchingResume(false);
            }
        }
        loadResume();
    }, [searchParams]);

    // Handle resume file upload & parsing
    const handleFileUpload = async (file: File) => {
        setUploadingResume(true);
        setUploadError(null);

        const form = new FormData();
        form.append("file", file);

        try {
            const res = await fetch("/api/resume/upload", {
                method: "POST",
                body: form,
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSavedResume(data.resume);
                setShowUploadDropzone(false);

                // Auto-fill form fields with parsed resume data
                setFormData((prev) => ({
                    jobRole: data.resume.parsedRole || prev.jobRole || "Software Engineer",
                    jobDesc:
                        data.resume.summary ||
                        data.resume.techStack ||
                        prev.jobDesc ||
                        "Technical interview grounded in candidate's resume projects and tech stack.",
                    jobExperience: data.resume.experience || prev.jobExperience || "1",
                }));
            } else {
                setUploadError(data.error || "Failed to parse resume. Please check the file format.");
            }
        } catch (err) {
            console.error("Resume upload error:", err);
            setUploadError("Network error uploading resume. Please try again.");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleModeSwitch = (mode: "STANDARD" | "RESUME") => {
        setInterviewMode(mode);
        if (mode === "RESUME" && savedResume) {
            // Apply saved resume data if fields are blank
            setFormData((prev) => ({
                jobRole: prev.jobRole || savedResume.parsedRole || "Software Engineer",
                jobDesc:
                    prev.jobDesc ||
                    savedResume.summary ||
                    savedResume.techStack ||
                    "Grounded in candidate's resume projects & skills.",
                jobExperience: prev.jobExperience || savedResume.experience || "1",
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.jobRole.trim() || !formData.jobDesc.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/interview/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobRole: formData.jobRole,
                    jobDesc: formData.jobDesc,
                    jobExperience: formData.jobExperience,
                    interviewMode,
                    resumeId: interviewMode === "RESUME" && savedResume ? savedResume.id : null,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/interview/${data.interviewId}`);
            } else {
                console.error("Failed to create interview");
                setLoading(false);
            }
        } catch (err) {
            console.error("Error creating interview:", err);
            setLoading(false);
        }
    };

    return (
        <Card className="rounded-2xl shadow-xl shadow-slate-100 border-0 overflow-hidden bg-white">
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-8 py-8">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <BrainCircuit className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-white">
                            New Mock Interview
                        </CardTitle>
                        <p className="text-indigo-100 text-sm mt-1">
                            Choose your interview mode and configure your session
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-8 py-8 space-y-8">
                {/* Mode Selector Tabs */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Select Interview Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Standard Mode Card */}
                        <div
                            onClick={() => handleModeSwitch("STANDARD")}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                interviewMode === "STANDARD"
                                    ? "border-indigo-600 bg-indigo-50/60 shadow-sm"
                                    : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                        >
                            <div className="flex items-center gap-2.5 mb-1.5">
                                <div
                                    className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                                        interviewMode === "STANDARD"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    <Target className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-sm text-slate-900">
                                    Standard AI Mode
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                AI generates technical questions based on your target role, description, and YOE.
                            </p>
                        </div>

                        {/* Resume-Grounded Mode Card */}
                        <div
                            onClick={() => handleModeSwitch("RESUME")}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                interviewMode === "RESUME"
                                    ? "border-purple-600 bg-purple-50/60 shadow-sm"
                                    : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                        >
                            <div className="flex items-center gap-2.5 mb-1.5">
                                <div
                                    className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                                        interviewMode === "RESUME"
                                            ? "bg-purple-600 text-white"
                                            : "bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    <FileCheck2 className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                                    Resume-Grounded Mode
                                    <Badge className="bg-purple-600 text-white text-[10px] px-1.5 py-0 h-4 border-0">
                                        Personalized
                                    </Badge>
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                AI probes your actual resume projects, real past responsibilities, and declared tech stack.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resume Upload / Active Resume Section (When in RESUME mode or want to auto-fill) */}
                {interviewMode === "RESUME" && (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-purple-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                                <FileUp className="h-4 w-4 text-purple-600" />
                                Resume Grounding Source
                            </span>
                            {savedResume && !showUploadDropzone && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowUploadDropzone(true)}
                                    className="text-xs text-purple-700 hover:bg-purple-100/60 h-7 px-2"
                                >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Upload Different Resume
                                </Button>
                            )}
                        </div>

                        {/* If user has saved resume and not toggling new upload */}
                        {savedResume && !showUploadDropzone ? (
                            <div className="p-4 rounded-xl bg-white border border-purple-200 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{savedResume.fileName}</p>
                                            <p className="text-xs text-slate-500">
                                                {savedResume.experience || "1"} YOE • {savedResume.parsedRole || "Extracted Role"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Active Resume
                                    </Badge>
                                </div>

                                {savedResume.skills && savedResume.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {savedResume.skills.slice(0, 6).map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant="secondary"
                                                className="bg-purple-50 text-purple-700 border-0 text-[11px]"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Dropzone for uploading resume */
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white rounded-xl p-6 text-center cursor-pointer transition-all group"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,.txt"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFileUpload(e.target.files[0]);
                                        }
                                    }}
                                />

                                {uploadingResume ? (
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-2" />
                                        <p className="text-sm font-semibold text-slate-800">
                                            Parsing Resume with Gemini AI...
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Extracting your skills, past projects, and technical experience
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-3">
                                        <div className="h-11 w-11 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">
                                            Click or Drag & Drop your Resume
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Supports PDF and DOCX (Max 10MB)
                                        </p>
                                    </div>
                                )}

                                {uploadError && (
                                    <p className="text-xs font-semibold text-red-600 mt-2">{uploadError}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Job Role */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Briefcase className="h-4 w-4 text-indigo-500" />
                            Target Job Role / Position
                        </label>
                        <Input
                            placeholder="e.g. Senior Frontend Engineer, Backend Developer..."
                            value={formData.jobRole}
                            onChange={(e) =>
                                setFormData({ ...formData, jobRole: e.target.value })
                            }
                            className="h-12 rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 text-base"
                            required
                        />
                    </div>

                    {/* Job Description */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            {interviewMode === "RESUME"
                                ? "Target Job Context / Tech Stack"
                                : "Job Description & Required Tech Stack"}
                        </label>
                        <Textarea
                            placeholder={
                                interviewMode === "RESUME"
                                    ? "Describe the role or tech stack you are targeting. The AI will cross-examine your resume background against this description..."
                                    : "Paste the job description here. This helps the AI tailor questions to the specific role..."
                            }
                            value={formData.jobDesc}
                            onChange={(e) =>
                                setFormData({ ...formData, jobDesc: e.target.value })
                            }
                            className="min-h-[130px] rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 resize-none text-base leading-relaxed"
                            required
                        />
                    </div>

                    {/* Experience */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            Years of Experience
                        </label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                min="0"
                                max="30"
                                value={formData.jobExperience}
                                onChange={(e) =>
                                    setFormData({ ...formData, jobExperience: e.target.value })
                                }
                                className="h-12 w-24 rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 text-center text-lg font-semibold"
                            />
                            <span className="text-sm text-slate-500">year(s)</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={loading || !formData.jobRole.trim() || !formData.jobDesc.trim()}
                        className="w-full h-13 text-base rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-semibold"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Initializing {interviewMode === "RESUME" ? "Resume-Grounded" : "Standard"} Interview...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5 mr-2" />
                                Start {interviewMode === "RESUME" ? "Resume-Grounded" : "Mock"} Interview
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function NewInterviewPage() {
    return (
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
            {/* Back Button */}
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>

            <Suspense
                fallback={
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    </div>
                }
            >
                <NewInterviewForm />
            </Suspense>
        </div>
    );
}
