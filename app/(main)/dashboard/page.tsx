"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Plus,
    BrainCircuit,
    Calendar,
    ArrowRight,
    Briefcase,
    Sparkles,
    Hand,
    Star,
    Clock,
} from "lucide-react";

interface Interview {
    id: string;
    jobRole: string;
    jobExperience: string;
    createdAt: string;
    ended?: boolean;
    duration?: number | null;
    feedbackJson?: string | null;
}

function formatDuration(seconds?: number | null): string | null {
    if (seconds == null || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function getFeedbackScore(interview: Interview): number | null {
    if (!interview.feedbackJson) return null;
    try {
        const parsed = JSON.parse(interview.feedbackJson);
        return parsed.overallScore ?? null;
    } catch {
        return null;
    }
}

export default function DashboardPage() {
    const { user } = useUser();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInterviews() {
            try {
                const res = await fetch("/api/interview/list");
                if (res.ok) {
                    const data = await res.json();
                    setInterviews(data.interviews || []);
                }
            } catch (err) {
                console.error("Failed to fetch interviews:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchInterviews();
    }, []);

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-8 py-8 mb-10 shadow-xl shadow-indigo-200/50">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
                </div>
                <div className="relative">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                        Welcome back, {user?.firstName || "there"}! <Hand className="h-7 w-7 text-yellow-300" />
                    </h1>
                    <p className="text-indigo-100 text-base">
                        Ready to practice? Start a new interview or review your past sessions.
                    </p>
                </div>
            </div>

            {/* Interview Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* New Interview Card */}
                <Link href="/dashboard/new">
                    <Card className="group h-full min-h-[220px] border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer rounded-2xl flex items-center justify-center">
                        <CardContent className="flex flex-col items-center justify-center text-center p-8">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                                <Plus className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                Start New Interview
                            </h3>
                            <p className="text-sm text-slate-500">
                                Configure your role and begin practicing
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Loading Skeletons */}
                {loading &&
                    Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i} className="rounded-2xl p-6">
                            <Skeleton className="h-5 w-3/4 mb-4" />
                            <Skeleton className="h-4 w-1/2 mb-3" />
                            <Skeleton className="h-4 w-1/3 mb-6" />
                            <Skeleton className="h-9 w-full" />
                        </Card>
                    ))}

                {/* Interview History Cards */}
                {!loading &&
                    interviews.map((interview) => (
                        <Card
                            key={interview.id}
                            className="group rounded-2xl shadow-md hover:shadow-xl shadow-slate-100 hover:shadow-indigo-100 border-0 transition-all duration-300 hover:-translate-y-1"
                        >
                            <CardContent className="p-6 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                        <Briefcase className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="bg-indigo-50 text-indigo-700 border-0 text-xs"
                                    >
                                        {interview.jobExperience} YOE
                                    </Badge>
                                </div>

                                <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                                    {interview.jobRole}
                                </h3>

                                <div className="flex items-center gap-3 text-xs text-slate-400 mb-6">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(interview.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                    {formatDuration(interview.duration) && (
                                        <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                                            <Clock className="h-3 w-3 text-slate-400" />
                                            {formatDuration(interview.duration)}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-auto flex gap-2">
                                    <Link href={`/interview/${interview.id}/feedback`} className="flex-1">
                                        <Button
                                            variant="outline"
                                            className="w-full text-sm border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                        >
                                            View Feedback
                                            {(() => {
                                                const score = getFeedbackScore(interview);
                                                return score !== null ? (
                                                    <Badge className={`ml-2 text-xs border-0 ${score >= 70 ? 'bg-emerald-50 text-emerald-700' :
                                                            score >= 40 ? 'bg-amber-50 text-amber-700' :
                                                                'bg-red-50 text-red-700'
                                                        }`}>
                                                        <Star className="h-3 w-3 mr-0.5" />
                                                        {score}%
                                                    </Badge>
                                                ) : null;
                                            })()}
                                        </Button>
                                    </Link>
                                    {!interview.ended && (
                                        <Link href={`/interview/${interview.id}`}>
                                            <Button
                                                size="icon"
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                {/* Empty State */}
                {!loading && interviews.length === 0 && (
                    <Card className="sm:col-span-1 lg:col-span-2 rounded-2xl border-0 shadow-md">
                        <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
                            <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                                <Sparkles className="h-10 w-10 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">
                                No interviews yet
                            </h3>
                            <p className="text-slate-400 mb-6 max-w-sm">
                                Start your first mock interview to see your history and performance analytics here.
                            </p>
                            <Link href="/dashboard/new">
                                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200">
                                    <BrainCircuit className="h-4 w-4 mr-2" />
                                    Start Your First Interview
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
