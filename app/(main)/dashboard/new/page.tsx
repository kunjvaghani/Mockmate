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
    PlusCircle,
    Target,
    FileUp,
    ChevronDown,
    ListOrdered,
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

    const [resumesList, setResumesList] = useState<SavedResume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
    const [showUploadDropzone, setShowUploadDropzone] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        jobRole: "",
        jobDesc: "",
        jobExperience: "1",
        questionCount: "5",
    });

    const activeResume = resumesList.find((r) => r.id === selectedResumeId) || resumesList[0] || null;

    // Check for query params & fetch existing resumes on load
    useEffect(() => {
        const role = searchParams.get("role");
        const desc = searchParams.get("desc");
        const exp = searchParams.get("exp");
        const mode = searchParams.get("mode");
        const paramResumeId = searchParams.get("resumeId");

        if (mode === "RESUME" || paramResumeId) {
            setInterviewMode("RESUME");
        }

        if (role || desc || exp) {
            setFormData((prev) => ({
                jobRole: role ?? prev.jobRole,
                jobDesc: desc ?? prev.jobDesc,
                jobExperience: exp ?? prev.jobExperience ?? "1",
            }));
        }

        // Fetch all saved resumes
        async function loadResumes() {
            try {
                const res = await fetch("/api/resume");
                if (res.ok) {
                    const data = await res.json();
                    const list: SavedResume[] = data.resumes || (data.resume ? [data.resume] : []);
                    setResumesList(list);

                    const targetResume = paramResumeId
                        ? list.find((r) => r.id === paramResumeId) || list[0]
                        : list[0];

                    if (targetResume) {
                        setSelectedResumeId(targetResume.id);
                        if (mode === "RESUME" || paramResumeId) {
                            setFormData((prev) => ({
                                ...prev,
                                jobRole: targetResume.parsedRole || role || prev.jobRole || "Software Engineer",
                                jobDesc:
                                    targetResume.summary ||
                                    targetResume.techStack ||
                                    desc ||
                                    prev.jobDesc ||
                                    "Technical interview grounded in candidate's resume projects and tech stack.",
                                jobExperience: targetResume.experience || exp || prev.jobExperience || "1",
                            }));
                        }
                    }
                }
            } catch (err) {
                console.error("Error loading resumes:", err);
            } finally {
                setFetchingResume(false);
            }
        }
        loadResumes();
    }, [searchParams]);

    // Handle resume selection change
    const handleSelectResume = (resume: SavedResume) => {
        setSelectedResumeId(resume.id);
        setShowUploadDropzone(false);
        setFormData((prev) => ({
            ...prev,
            jobRole: resume.parsedRole || prev.jobRole || "Software Engineer",
            jobDesc:
                resume.summary ||
                resume.techStack ||
                prev.jobDesc ||
                "Technical interview grounded in candidate's resume projects and tech stack.",
            jobExperience: resume.experience || prev.jobExperience || "1",
        }));
    };

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
                const updatedList = [data.resume, ...resumesList.filter((r) => r.id !== data.resume.id)];
                setResumesList(updatedList);
                setSelectedResumeId(data.resume.id);
                setShowUploadDropzone(false);

                // Auto-fill form fields with parsed resume data while preserving questionCount
                setFormData((prev) => ({
                    ...prev,
                    jobRole: data.resume.parsedRole || "Software Engineer",
                    jobDesc:
                        data.resume.summary ||
                        data.resume.techStack ||
                        "Technical interview grounded in candidate's resume projects and tech stack.",
                    jobExperience: data.resume.experience || "1",
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
        if (mode === "RESUME" && activeResume) {
            setFormData((prev) => ({
                jobRole: prev.jobRole || activeResume.parsedRole || "Software Engineer",
                jobDesc:
                    prev.jobDesc ||
                    activeResume.summary ||
                    activeResume.techStack ||
                    "Grounded in candidate's resume projects & skills.",
                jobExperience: prev.jobExperience || activeResume.experience || "1",
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
                    questionCount: parseInt(formData.questionCount) || 5,
                    interviewMode,
                    resumeId: interviewMode === "RESUME" && activeResume ? activeResume.id : null,
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

                {/* Resume Selection & Upload Section (When in RESUME mode) */}
                {interviewMode === "RESUME" && (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-purple-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                                <FileUp className="h-4 w-4 text-purple-600" />
                                Select Active Resume ({resumesList.length})
                            </span>
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/resume"
                                    className="text-xs text-purple-600 hover:text-purple-800 font-semibold hover:underline"
                                >
                                    Manage Resumes
                                </Link>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowUploadDropzone(!showUploadDropzone)}
                                    className="text-xs text-purple-700 hover:bg-purple-100/60 h-7 px-2"
                                >
                                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                                    Upload New
                                </Button>
                            </div>
                        </div>

                        {/* Multi-Resume Selector (When user has > 1 resume) */}
                        {resumesList.length > 1 && !showUploadDropzone && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-600">
                                    Choose which resume to use for this interview:
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {resumesList.map((resItem) => {
                                        const isCurrent = resItem.id === selectedResumeId;
                                        return (
                                            <div
                                                key={resItem.id}
                                                onClick={() => handleSelectResume(resItem)}
                                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                                    isCurrent
                                                        ? "border-purple-600 bg-white shadow-xs ring-1 ring-purple-600"
                                                        : "border-slate-200 bg-white/70 hover:border-slate-300"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div
                                                        className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold ${
                                                            isCurrent
                                                                ? "bg-purple-600 text-white"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-slate-900 truncate">
                                                            {resItem.fileName}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500">
                                                            {resItem.experience || "1"} YOE • {resItem.parsedRole || "General"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isCurrent && (
                                                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 ml-1.5" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* If user has an active resume and not showing upload dropzone */}
                        {activeResume && !showUploadDropzone ? (
                            <div className="p-5 rounded-xl bg-white border border-purple-200 shadow-2xs space-y-3.5 overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-base font-bold text-slate-900 truncate">
                                                {activeResume.fileName}
                                            </p>
                                            <p className="text-sm font-medium text-slate-600">
                                                {activeResume.experience || "1"} YOE • {activeResume.parsedRole || "Extracted Role"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs sm:text-sm font-semibold self-start sm:self-auto shrink-0 py-1 px-2.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active Resume
                                    </Badge>
                                </div>

                                {activeResume.skills && activeResume.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1 max-w-full">
                                        {activeResume.skills
                                            .flatMap((s) => s.split(/[,•|]/))
                                            .map((s) => s.trim().replace(/^[-*•\s]+/, ""))
                                            .filter((s) => s.length > 0)
                                            .slice(0, 8)
                                            .map((skill, idx) => (
                                                <span
                                                    key={`${skill}-${idx}`}
                                                    className="inline-block max-w-full whitespace-normal break-words bg-purple-50 text-purple-800 border border-purple-200/70 text-xs sm:text-sm font-medium py-1 px-3 rounded-lg leading-snug"
                                                >
                                                    {skill}
                                                </span>
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
                                            Parsing Resume with AI...
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
                                            Supports PDF, DOCX, and TXT (Max 10MB)
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

                    {/* Experience & Question Count Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

                        {/* Number of Questions */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <ListOrdered className="h-4 w-4 text-purple-600" />
                                    Number of Questions (1 - 10)
                                </label>
                                <span className="text-xs font-semibold text-purple-600">
                                    Max 10
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.questionCount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "") {
                                            setFormData({ ...formData, questionCount: "" });
                                            return;
                                        }
                                        const num = parseInt(val);
                                        if (!isNaN(num)) {
                                            const clamped = Math.min(10, Math.max(1, num));
                                            setFormData({ ...formData, questionCount: String(clamped) });
                                        }
                                    }}
                                    className="h-12 w-24 rounded-xl border-slate-200 focus:border-purple-400 focus:ring-purple-400 text-center text-lg font-semibold"
                                    required
                                />
                                {/* Quick Select Preset Pills */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {[3, 5, 7, 10].map((count) => {
                                        const isSelected = formData.questionCount === String(count);
                                        return (
                                            <button
                                                type="button"
                                                key={count}
                                                onClick={() => setFormData({ ...formData, questionCount: String(count) })}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-purple-600 text-white shadow-xs"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                            >
                                                {count} Qs
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Choose how many questions you want to answer (up to 10).
                            </p>
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
