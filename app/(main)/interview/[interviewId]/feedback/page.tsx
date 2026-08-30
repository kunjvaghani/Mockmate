"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ScoreCircle from "@/components/feedback/ScoreCircle";
import RadarChartComponent from "@/components/feedback/RadarChartComponent";
import QuestionAccordion from "@/components/feedback/QuestionAccordion";
import SubmitInquiryModal from "@/components/inquiry/SubmitInquiryModal";
import {
    ArrowLeft,
    Loader2,
    ThumbsUp,
    AlertTriangle,
    RotateCcw,
    Download,
    MessageSquarePlus,
} from "lucide-react";

interface Feedback {
    overallScore: number;
    overallSummary: string;
    strengths: string[];
    areasForImprovement: string[];
    radarScores: {
        technicalAccuracy: number;
        communication: number;
        problemSolving: number;
        experienceDepth: number;
        confidence: number;
    };
    questionFeedback: {
        question: string;
        userAnswer: string;
        idealAnswer: string;
        rating: number;
        feedback: string;
    }[];
}

export default function FeedbackPage() {
    const params = useParams();
    const router = useRouter();
    const interviewId = params.interviewId as string;

    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

    useEffect(() => {
        generateFeedback();
    }, []);

    async function generateFeedback() {
        setGenerating(true);
        setError(null);

        try {
            const res = await fetch("/api/generate-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ interviewId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to generate feedback");
            }

            const data = await res.json();
            setFeedback(data.feedback);
        } catch (err: any) {
            console.error("Error generating feedback:", err);
            setError(err.message || "Failed to generate feedback");
        } finally {
            setLoading(false);
            setGenerating(false);
        }
    }

    if (loading || generating) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                    Analyzing Your Performance...
                </h2>
                <p className="text-slate-500 text-sm">
                    The AI is reviewing your answers and generating detailed feedback
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-md mx-auto px-4">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                    Something went wrong
                </h2>
                <p className="text-slate-500 text-sm mb-6 text-center">{error}</p>
                <Button onClick={generateFeedback} className="rounded-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
            </div>
        );
    }

    if (!feedback) return null;

    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
            {/* Back */}
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-8"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                    Interview Feedback
                </h1>
                <p className="text-slate-500 max-w-lg mx-auto">{feedback.overallSummary}</p>
            </div>

            {/* Score + Radar Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Score Circle */}
                <Card className="rounded-2xl border-0 shadow-lg shadow-indigo-100/50">
                    <CardContent className="flex items-center justify-center py-10">
                        <ScoreCircle score={feedback.overallScore} />
                    </CardContent>
                </Card>

                {/* Radar Chart */}
                <Card className="rounded-2xl border-0 shadow-lg shadow-indigo-100/50">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-lg font-semibold text-slate-800">
                            Performance Dimensions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadarChartComponent scores={feedback.radarScores} />
                    </CardContent>
                </Card>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                {/* Strengths */}
                <Card className="rounded-2xl border-0 shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <ThumbsUp className="h-5 w-5 text-green-600" />
                            Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2.5">
                            {feedback.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center mt-0.5 shrink-0">
                                        <span className="text-green-600 text-xs font-bold">✓</span>
                                    </div>
                                    <span className="text-sm text-slate-700 leading-relaxed">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Areas for Improvement */}
                <Card className="rounded-2xl border-0 shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            Areas for Improvement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2.5">
                            {feedback.areasForImprovement.map((a, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <div className="h-5 w-5 rounded-full bg-amber-50 flex items-center justify-center mt-0.5 shrink-0">
                                        <span className="text-amber-600 text-xs font-bold">!</span>
                                    </div>
                                    <span className="text-sm text-slate-700 leading-relaxed">{a}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Per-Question Breakdown */}
            <div className="mb-12">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                    Question-by-Question Breakdown
                </h2>
                <QuestionAccordion questions={feedback.questionFeedback} />
            </div>

            {/* Support & Admin Inquiry Banner */}
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 border border-purple-100 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-base font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                        <MessageSquarePlus className="h-5 w-5 text-purple-600" />
                        Have questions or feedback about this evaluation?
                    </h3>
                    <p className="text-xs text-slate-500">
                        Ask our admin team about your scoring or suggest improvements. Replies will appear privately in your User Dashboard.
                    </p>
                </div>
                <Button
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs cursor-pointer shrink-0"
                >
                    Ask Admin / Feedback
                </Button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 border-t border-slate-100">
                <Link href="/dashboard/new">
                    <Button className="h-12 px-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Practice Again
                    </Button>
                </Link>
                <Link href="/dashboard">
                    <Button variant="outline" className="h-12 px-8 rounded-full">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            <SubmitInquiryModal
                isOpen={isInquiryModalOpen}
                onClose={() => setIsInquiryModalOpen(false)}
                mockInterviewId={interviewId}
                initialCategory="INTERVIEW_FEEDBACK"
            />
        </div>
    );
}
