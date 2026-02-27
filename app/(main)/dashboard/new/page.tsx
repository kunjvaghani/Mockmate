"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    BrainCircuit,
    Briefcase,
    FileText,
    Clock,
    ArrowLeft,
    Loader2,
    Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function NewInterviewPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        jobRole: "",
        jobDesc: "",
        jobExperience: "2",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.jobRole.trim() || !formData.jobDesc.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/interview/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
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
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
            {/* Back Button */}
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-8"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>

            <Card className="rounded-2xl shadow-xl shadow-slate-100 border-0 overflow-hidden">
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
                                Tell us about the role you&apos;re preparing for
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-8 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Job Role */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Briefcase className="h-4 w-4 text-indigo-500" />
                                Job Role / Position
                            </label>
                            <Input
                                placeholder="e.g. Full Stack Developer, Data Scientist..."
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
                                Job Description
                            </label>
                            <Textarea
                                placeholder="Paste the job description here. This helps the AI tailor questions to the specific role..."
                                value={formData.jobDesc}
                                onChange={(e) =>
                                    setFormData({ ...formData, jobDesc: e.target.value })
                                }
                                className="min-h-[140px] rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 resize-none text-base leading-relaxed"
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
                                <span className="text-sm text-slate-500">years</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading || !formData.jobRole.trim() || !formData.jobDesc.trim()}
                            className="w-full h-13 text-base rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Generating Interview...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5 mr-2" />
                                    Generate Interview
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
