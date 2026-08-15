"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    UploadCloud,
    Loader2,
    Sparkles,
    Briefcase,
    Clock,
    Code2,
    FolderGit2,
    Trash2,
    ArrowRight,
    CheckCircle2,
    FileUp,
    RefreshCw,
    Layers,
    Cpu,
    PlusCircle,
} from "lucide-react";

interface ProjectItem {
    name: string;
    tech?: string;
    description?: string;
}

interface ResumeData {
    id: string;
    fileName: string;
    fileSize: number;
    parsedRole?: string;
    techStack?: string;
    experience?: string;
    skills?: string[];
    summary?: string;
    projectsJson?: string;
    createdAt: string;
    updatedAt: string;
}

export default function ResumePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [resumes, setResumes] = useState<ResumeData[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Fetch user's resumes on mount
    const fetchResumes = async () => {
        try {
            const res = await fetch("/api/resume");
            if (res.ok) {
                const data = await res.json();
                const list = data.resumes || (data.resume ? [data.resume] : []);
                setResumes(list);
                if (list.length > 0 && !selectedResumeId) {
                    setSelectedResumeId(list[0].id);
                }
            }
        } catch (err) {
            console.error("Error fetching resumes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    // Handle resume upload
    const handleFileUpload = async (file: File) => {
        setUploading(true);
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
                // Refresh list and select the newly uploaded resume
                await fetchResumes();
                if (data.resume?.id) {
                    setSelectedResumeId(data.resume.id);
                }
            } else {
                setUploadError(data.error || "Failed to parse resume. Please check the file.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setUploadError("Network error uploading resume. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    // Handle resume deletion
    const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this parsed resume?")) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/resume?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                const updatedList = resumes.filter((r) => r.id !== id);
                setResumes(updatedList);
                if (selectedResumeId === id) {
                    setSelectedResumeId(updatedList[0]?.id || null);
                }
            }
        } catch (err) {
            console.error("Error deleting resume:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const activeResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0] || null;

    let parsedProjects: ProjectItem[] = [];
    if (activeResume?.projectsJson) {
        try {
            parsedProjects = JSON.parse(activeResume.projectsJson);
        } catch {
            parsedProjects = [];
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-semibold mb-2">
                        <Cpu className="h-3.5 w-3.5" />
                        <span>AI Resume Extraction & Grounding</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Resume Parser & Analyzer
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Extract technical skills, key projects, and experience to power personalized mock interviews.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md shadow-indigo-200 cursor-pointer"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Parsing Resume...
                            </>
                        ) : (
                            <>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Upload New Resume
                            </>
                        )}
                    </Button>
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
                </div>
            </div>

            {/* If loading initial data */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-3" />
                    <p className="text-base font-semibold text-slate-700">Loading your resumes...</p>
                </div>
            ) : resumes.length === 0 ? (
                /* Empty state / Initial Upload Card */
                <Card className="rounded-3xl border-2 border-dashed border-purple-200/80 bg-white/80 backdrop-blur shadow-sm p-8 sm:p-14 text-center">
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer max-w-xl mx-auto flex flex-col items-center group"
                    >
                        <div className="h-16 w-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                            <UploadCloud className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            Upload Your Technical Resume
                        </h3>
                        <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                            Drag and drop your resume file (.PDF, .DOCX, or .TXT). Our AI extracts your core tech stack, experience level, and key projects in seconds.
                        </p>
                        <Button
                            type="button"
                            className="h-12 px-7 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-200 pointer-events-none"
                        >
                            <FileUp className="h-4 w-4 mr-2" />
                            Browse Files
                        </Button>
                        {uploadError && (
                            <p className="text-sm font-semibold text-red-600 mt-4">{uploadError}</p>
                        )}
                    </div>
                </Card>
            ) : (
                /* Main View with Resume Selector & Details */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Multi-Resume Selector List (Col span 4) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Uploaded Resumes ({resumes.length})
                            </h3>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                Add Another
                            </button>
                        </div>

                        <div className="space-y-3">
                            {resumes.map((resume) => {
                                const isSelected = resume.id === selectedResumeId;
                                return (
                                    <div
                                        key={resume.id}
                                        onClick={() => setSelectedResumeId(resume.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative group ${
                                            isSelected
                                                ? "border-purple-600 bg-purple-50/50 shadow-sm"
                                                : "border-slate-200/80 hover:border-slate-300 bg-white"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold ${
                                                        isSelected
                                                            ? "bg-purple-600 text-white"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">
                                                        {resume.fileName}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {resume.experience || "1"} YOE • {resume.parsedRole || "General"}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => handleDeleteResume(resume.id, e)}
                                                disabled={deletingId === resume.id}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                                                title="Delete resume"
                                            >
                                                {deletingId === resume.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>

                                        {isSelected && (
                                            <div className="mt-3 pt-2.5 border-t border-purple-100 flex items-center justify-between text-xs text-purple-700 font-semibold">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" /> Selected for Interview
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {new Date(resume.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Parsed Resume Details (Col span 8) */}
                    {activeResume && (
                        <div className="lg:col-span-8 space-y-6">
                            {/* Executive Summary Card */}
                            <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 p-6 text-white">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <Badge className="bg-white/20 hover:bg-white/20 text-white border-0 text-xs mb-2">
                                                Active Candidate Profile
                                            </Badge>
                                            <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                                                {activeResume.parsedRole || "Software Engineer"}
                                            </CardTitle>
                                            <p className="text-sm text-purple-100 mt-1">
                                                {activeResume.experience || "1"} Years of Professional Experience • Source: {activeResume.fileName}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/dashboard/new?resumeId=${activeResume.id}&role=${encodeURIComponent(activeResume.parsedRole || "")}&exp=${activeResume.experience || "1"}`}
                                        >
                                            <Button className="h-11 px-6 rounded-xl bg-white text-purple-700 hover:bg-purple-50 font-bold shadow-md shadow-purple-900/20 cursor-pointer shrink-0">
                                                Start Interview with this Resume
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-6 space-y-6">
                                    {/* Summary */}
                                    {activeResume.summary && (
                                        <div className="space-y-1.5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Candidate Profile Summary
                                            </h4>
                                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                {activeResume.summary}
                                            </p>
                                        </div>
                                    )}

                                    {/* Core Tech Stack */}
                                    {activeResume.techStack && (
                                        <div className="space-y-1.5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                <Code2 className="h-4 w-4 text-indigo-600" />
                                                Core Tech Stack
                                            </h4>
                                            <p className="text-sm font-semibold text-slate-800 bg-indigo-50/60 text-indigo-900 px-4 py-2.5 rounded-xl border border-indigo-100">
                                                {activeResume.techStack}
                                            </p>
                                        </div>
                                    )}

                                    {/* Skills Breakdown */}
                                    {activeResume.skills && activeResume.skills.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                <Layers className="h-4 w-4 text-purple-600" />
                                                Extracted Skills & Competencies ({activeResume.skills.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {activeResume.skills
                                                    .flatMap((s) => s.split(/[,•|]/))
                                                    .map((s) => s.trim().replace(/^[-*•\s]+/, ""))
                                                    .filter((s) => s.length > 0)
                                                    .map((skill, idx) => (
                                                        <span
                                                            key={`${skill}-${idx}`}
                                                            className="inline-block whitespace-normal break-words bg-purple-50 text-purple-800 border border-purple-200/70 text-xs sm:text-sm font-medium py-1 px-3 rounded-lg"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects & Work Highlights */}
                                    {parsedProjects.length > 0 && (
                                        <div className="space-y-3 pt-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                <FolderGit2 className="h-4 w-4 text-emerald-600" />
                                                Key Projects & Responsibilities ({parsedProjects.length})
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                                {parsedProjects.map((project, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5"
                                                    >
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {project.name}
                                                        </p>
                                                        {project.tech && (
                                                            <p className="text-xs font-semibold text-purple-700">
                                                                Tech: {project.tech}
                                                            </p>
                                                        )}
                                                        {project.description && (
                                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                                {project.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
