"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SubmitInquiryModal from "@/components/inquiry/SubmitInquiryModal";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    Mic,
    MessageSquare,
    BarChart3,
    Settings,
    ChevronRight,
    Calendar,
    Briefcase,
    ArrowRight,
    TrendingUp,
    Target,
    Clock,
    Star,
    User,
    Bell,
    Shield,
    Palette,
    Trash2,
    Loader2,
    FileText,
    FileUp,
    CheckCircle2,
    HelpCircle,
    MessageSquarePlus,
    ShieldCheck,
} from "lucide-react";

interface Interview {
    id: string;
    jobRole: string;
    jobExperience: string;
    createdAt: string;
    ended?: boolean;
    duration?: number | null;
    feedbackJson?: string | null;
    messages?: { id: string; aiRating?: number | null }[];
}

interface ResumeInfo {
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

interface UserInquiryItem {
    id: string;
    subject: string;
    message: string;
    category: string;
    status: string;
    mockInterviewId?: string | null;
    adminReply?: string | null;
    adminRepliedAt?: string | null;
    adminName?: string | null;
    createdAt: string;
}

function formatDuration(seconds?: number | null): string | null {
    if (seconds == null || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function formatHHMMSS(seconds?: number | null): string {
    const total = seconds != null && seconds > 0 ? seconds : 300; // default 05:00 (300s -> 00:05:00)
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

type SidebarTab = "interviews" | "feedbacks" | "analysis" | "resumes" | "support" | "settings";

const sidebarItems: { key: SidebarTab; label: string; icon: React.ElementType; description: string }[] = [
    { key: "interviews", label: "Interviews", icon: Mic, description: "Your interview sessions" },
    { key: "feedbacks", label: "Feedbacks", icon: MessageSquare, description: "AI-generated feedback" },
    { key: "analysis", label: "Analysis", icon: BarChart3, description: "Performance analytics" },
    { key: "resumes", label: "Resume Info", icon: FileText, description: "Uploaded resumes & skills" },
    { key: "support", label: "Support & Inquiries", icon: HelpCircle, description: "Ask admin & view replies" },
    { key: "settings", label: "Settings", icon: Settings, description: "Account preferences" },
];

function UserDashboardContent() {
    const { user } = useUser();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab") as SidebarTab;

    const [activeTab, setActiveTab] = useState<SidebarTab>(
        tabParam && ["interviews", "feedbacks", "analysis", "resumes", "support", "settings"].includes(tabParam)
            ? tabParam
            : "interviews"
    );

    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [resumes, setResumes] = useState<ResumeInfo[]>([]);
    const [inquiries, setInquiries] = useState<UserInquiryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingResumes, setLoadingResumes] = useState(true);
    const [loadingInquiries, setLoadingInquiries] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

    useEffect(() => {
        const tab = searchParams.get("tab") as SidebarTab;
        if (tab && ["interviews", "feedbacks", "analysis", "resumes", "support", "settings"].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleDeleteInterview = async (interviewId: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this interview? This will permanently delete the interview and all associated answers.");
        if (!confirmed) return;

        setDeletingId(interviewId);
        try {
            const res = await fetch(`/api/interview/${interviewId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setInterviews((prev) => prev.filter((iv) => iv.id !== interviewId));
            } else {
                alert("Failed to delete interview. Please try again.");
            }
        } catch (err) {
            console.error("Failed to delete interview:", err);
            alert("Error deleting interview.");
        } finally {
            setDeletingId(null);
        }
    };

    async function fetchInquiries() {
        setLoadingInquiries(true);
        try {
            const res = await fetch("/api/inquiries");
            if (res.ok) {
                const data = await res.json();
                setInquiries(data.inquiries || []);
            }
        } catch (err) {
            console.error("Failed to fetch inquiries:", err);
        } finally {
            setLoadingInquiries(false);
        }
    }

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

        async function fetchResumes() {
            try {
                const res = await fetch("/api/resume");
                if (res.ok) {
                    const data = await res.json();
                    const list = data.resumes || (data.resume ? [data.resume] : []);
                    setResumes(list);
                }
            } catch (err) {
                console.error("Failed to fetch resumes:", err);
            } finally {
                setLoadingResumes(false);
            }
        }

        fetchInterviews();
        fetchResumes();
        fetchInquiries();
    }, []);

    const totalInterviews = interviews.length;
    const avgRating = interviews.length > 0
        ? (interviews.reduce((sum, iv) => {
            const ratings = iv.messages?.filter(m => m.aiRating != null).map(m => m.aiRating!) || [];
            return sum + (ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0);
        }, 0) / interviews.length).toFixed(1)
        : "N/A";

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    User Dashboard
                </h1>
                <p className="text-slate-500 mt-1">
                    Welcome back, {user?.firstName || "there"}! Manage your interviews and track your progress.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="lg:w-64 shrink-0">
                    <nav className="space-y-1.5 lg:sticky lg:top-24">
                        {/* User Profile Card */}
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 mb-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                {user?.firstName?.charAt(0) || "U"}{user?.lastName?.charAt(0) || ""}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                    {user?.fullName || "User"}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {user?.primaryEmailAddress?.emailAddress || ""}
                                </p>
                            </div>
                        </div>

                        {/* Nav Items */}
                        {sidebarItems.map((item) => {
                            const isActive = activeTab === item.key;
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveTab(item.key)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200"
                                        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                    <div className="text-left flex-1">
                                        <span className="block">{item.label}</span>
                                        <span className={`text-xs ${isActive ? "text-indigo-100" : "text-slate-400"}`}>
                                            {item.description}
                                        </span>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 ${isActive ? "text-white/70" : "text-slate-300 group-hover:text-indigo-400"}`} />
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {activeTab === "interviews" && (
                        <InterviewsPanel interviews={interviews} loading={loading} />
                    )}
                    {activeTab === "feedbacks" && (
                        <FeedbacksPanel interviews={interviews} loading={loading} />
                    )}
                    {activeTab === "analysis" && (
                        <AnalysisPanel
                            totalInterviews={totalInterviews}
                            avgRating={avgRating}
                            interviews={interviews}
                        />
                    )}
                    {activeTab === "resumes" && (
                        <ResumeInfoPanel resumes={resumes} loading={loadingResumes} />
                    )}
                    {activeTab === "support" && (
                        <InquiriesPanel
                            inquiries={inquiries}
                            loading={loadingInquiries}
                            onOpenModal={() => setIsInquiryModalOpen(true)}
                        />
                    )}
                    {activeTab === "settings" && (
                        <SettingsPanel
                            user={user}
                            interviews={interviews}
                            onDeleteInterview={handleDeleteInterview}
                            deletingId={deletingId}
                        />
                    )}
                </main>
            </div>

            <SubmitInquiryModal
                isOpen={isInquiryModalOpen}
                onClose={() => setIsInquiryModalOpen(false)}
                onSuccess={fetchInquiries}
            />
        </div>
    );
}

export default function UserDashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
            }
        >
            <UserDashboardContent />
        </Suspense>
    );
}

/* ─── INTERVIEWS PANEL ────────────────────────────────────────────── */
function InterviewsPanel({ interviews, loading }: { interviews: Interview[]; loading: boolean }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Your Interviews</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{interviews.length} total sessions</p>
                </div>
                <Link href="/dashboard/new">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 gap-2">
                        <Mic className="h-4 w-4" />
                        New Interview
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="rounded-2xl border-0 shadow-sm">
                            <CardContent className="p-5">
                                <Skeleton className="h-5 w-3/4 mb-3" />
                                <Skeleton className="h-4 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : interviews.length === 0 ? (
                <Card className="rounded-2xl border-0 shadow-md">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                            <Mic className="h-8 w-8 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-1">No interviews yet</h3>
                        <p className="text-sm text-slate-400 mb-5 max-w-xs">Start your first mock interview to see your history here.</p>
                        <Link href="/dashboard/new">
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                Start Interview
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {interviews.map((interview) => (
                        <Card
                            key={interview.id}
                            className="group rounded-2xl border-0 shadow-sm hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300"
                        >
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Briefcase className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-slate-800 truncate">{interview.jobRole}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(interview.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-0 text-xs">
                                            {interview.jobExperience} YOE
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {(() => {
                                        const score = getFeedbackScore(interview);
                                        return score !== null ? (
                                            <Badge className={`text-xs border-0 ${score >= 70 ? 'bg-emerald-50 text-emerald-700' :
                                                    score >= 40 ? 'bg-amber-50 text-amber-700' :
                                                         'bg-red-50 text-red-700'
                                                 }`}>
                                                <Star className="h-3 w-3 mr-1" />
                                                {score}%
                                            </Badge>
                                        ) : null;
                                    })()}
                                    <Link href={`/interview/${interview.id}/feedback`}>
                                        <Button variant="outline" size="sm" className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                             Feedback
                                        </Button>
                                    </Link>
                                    <Badge variant="outline" className="text-xs font-mono font-bold text-slate-900 bg-slate-100 border-slate-300 shadow-xs flex items-center gap-1.5 py-1 px-2.5 tracking-tight">
                                        <Clock className="h-3.5 w-3.5 text-indigo-600" />
                                        {formatHHMMSS(interview.duration)}
                                    </Badge>
                                    {!interview.ended && (
                                        <Link href={`/interview/${interview.id}`}>
                                            <Button size="icon" className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── FEEDBACKS PANEL ─────────────────────────────────────────────── */
function FeedbacksPanel({ interviews, loading }: { interviews: Interview[]; loading: boolean }) {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Feedback History</h2>
                <p className="text-sm text-slate-500 mt-0.5">Review AI feedback from your past interviews</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="rounded-2xl border-0 shadow-sm">
                            <CardContent className="p-5">
                                <Skeleton className="h-5 w-3/4 mb-3" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : interviews.length === 0 ? (
                <Card className="rounded-2xl border-0 shadow-md">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                            <MessageSquare className="h-8 w-8 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-1">No feedback yet</h3>
                        <p className="text-sm text-slate-400 max-w-xs">Complete an interview to receive detailed AI feedback.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {interviews.map((interview) => (
                        <Link key={interview.id} href={`/interview/${interview.id}/feedback`}>
                            <Card className="group rounded-2xl border-0 shadow-sm hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300 cursor-pointer mb-3">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                        <MessageSquare className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-slate-800 truncate">{interview.jobRole}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(interview.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                            {formatDuration(interview.duration) && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                    {formatDuration(interview.duration)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {(() => {
                                        const score = getFeedbackScore(interview);
                                        return score !== null ? (
                                            <Badge className={`text-xs border-0 ${score >= 70 ? 'bg-emerald-50 text-emerald-700' :
                                                    score >= 40 ? 'bg-amber-50 text-amber-700' :
                                                        'bg-red-50 text-red-700'
                                                }`}>
                                                <Star className="h-3 w-3 mr-1" />
                                                {score}%
                                            </Badge>
                                        ) : null;
                                    })()}
                                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── ANALYSIS PANEL ──────────────────────────────────────────────── */
function AnalysisPanel({
    totalInterviews,
    avgRating,
    interviews,
}: {
    totalInterviews: number;
    avgRating: string;
    interviews: Interview[];
}) {
    const recentCount = interviews.filter(
        (iv) => new Date(iv.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const statCards = [
        { label: "Total Interviews", value: totalInterviews.toString(), icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Avg. Rating", value: avgRating, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "This Week", value: recentCount.toString(), icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Improvement", value: totalInterviews > 1 ? "+12%" : "N/A", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    // Sort interviews chronologically (oldest to newest) for trend chart
    const chronologicalInterviews = [...interviews].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const chartData = chronologicalInterviews.map((iv, idx) => {
        let score = getFeedbackScore(iv);
        if (score === null && iv.messages && iv.messages.length > 0) {
            const ratings = iv.messages.filter((m) => m.aiRating != null).map((m) => m.aiRating!);
            if (ratings.length > 0) {
                score = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10);
            }
        }
        return {
            id: iv.id,
            session: `Session ${idx + 1}`,
            role: iv.jobRole,
            date: new Date(iv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            score: score ?? 0,
        };
    });

    const CustomScoreTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/95 backdrop-blur text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
                    <p className="font-bold text-indigo-300">{data.session} • {data.role}</p>
                    <p className="text-slate-400 mt-0.5">{data.date}</p>
                    <div className="mt-2 flex items-center gap-1.5 font-semibold text-emerald-400 text-sm">
                        <Star className="h-3.5 w-3.5 fill-emerald-400" />
                        <span>Score: {data.score}%</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Performance Analysis</h2>
                <p className="text-sm text-slate-500 mt-0.5">Track your interview performance over time</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="rounded-2xl border-0 shadow-sm">
                        <CardContent className="p-5">
                            <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Score Progress Trend Chart */}
            <Card className="rounded-2xl border-0 shadow-sm mb-8 overflow-hidden bg-white">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            Score Progress Trend
                        </CardTitle>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-0 text-xs font-semibold">
                            Overall Score (%)
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-400">Chronological score progression across your interview sessions</p>
                </CardHeader>
                <CardContent className="pt-4 pb-6 px-4">
                    {chartData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <BarChart3 className="h-10 w-10 text-slate-300 mb-2" />
                            <p className="text-sm font-medium text-slate-600">No interview score data yet</p>
                            <p className="text-xs text-slate-400 max-w-xs mt-1">
                                Complete your first mock interview to generate performance analytics.
                            </p>
                        </div>
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                        tickFormatter={(v) => `${v}%`}
                                    />
                                    <Tooltip content={<CustomScoreTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#scoreAreaGradient)"
                                        dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4, stroke: "#ffffff" }}
                                        activeDot={{ r: 6, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {interviews.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">
                            Complete interviews to see your activity timeline.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {interviews.slice(0, 5).map((interview, i) => (
                                <div key={interview.id} className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                            {i + 1}
                                        </div>
                                        {i < Math.min(interviews.length, 5) - 1 && (
                                            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-4 bg-indigo-100" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700">{interview.jobRole}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(interview.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-0 text-xs">
                                        {interview.jobExperience} YOE
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/* ─── RESUME INFO PANEL ───────────────────────────────────────────── */
function ResumeInfoPanel({
    resumes,
    loading,
}: {
    resumes: ResumeInfo[];
    loading: boolean;
}) {
    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Resume Info</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Your uploaded resumes, extracted job profiles, and highlighted technical skills
                    </p>
                </div>
                <Link href="/resume">
                    <Button className="h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-sm cursor-pointer">
                        <FileUp className="h-4 w-4 mr-2" />
                        Upload New Resume
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <Card key={i} className="rounded-2xl border-0 shadow-sm p-6 bg-white">
                            <Skeleton className="h-6 w-1/3 mb-3" />
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <Skeleton className="h-8 w-3/4" />
                        </Card>
                    ))}
                </div>
            ) : resumes.length === 0 ? (
                <Card className="rounded-2xl border-0 shadow-sm p-10 text-center bg-white">
                    <div className="mx-auto h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                        <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">No resumes uploaded yet</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                        Upload your resume (.PDF, .DOCX, .TXT) to automatically extract your skills, past projects, and ground your mock interviews.
                    </p>
                    <Link href="/resume">
                        <Button className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm">
                            <FileUp className="h-4 w-4 mr-2" />
                            Upload Resume Now
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-4">
                    {resumes.map((resume) => {
                        // Extract 5 to 7 highlighted skills
                        const highlightedSkills = (resume.skills || [])
                            .flatMap((s) => s.split(/[,•|]/))
                            .map((s) => s.trim().replace(/^[-*•\s]+/, ""))
                            .filter((s) => s.length > 0)
                            .slice(0, 7);

                        return (
                            <Card
                                key={resume.id}
                                className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden"
                            >
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                            <div className="h-11 w-11 shrink-0 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mt-0.5">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-base font-bold text-slate-900 truncate">
                                                        {resume.fileName}
                                                    </h3>
                                                    {resume.parsedRole && (
                                                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
                                                            {resume.parsedRole}
                                                        </Badge>
                                                    )}
                                                    {resume.experience && (
                                                        <Badge className="bg-slate-100 text-slate-700 border-0 text-xs font-medium">
                                                            {resume.experience} YOE
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                        Uploaded on{" "}
                                                        {new Date(resume.createdAt).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                    {resume.fileSize > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{(resume.fileSize / 1024).toFixed(0)} KB</span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Highlighted Skills (5 to 7) */}
                                                {highlightedSkills.length > 0 && (
                                                    <div className="mt-3.5">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                            Highlighted Skills ({highlightedSkills.length})
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5 max-w-full">
                                                            {highlightedSkills.map((skill, idx) => (
                                                                <span
                                                                    key={`${skill}-${idx}`}
                                                                    className="inline-block whitespace-normal break-words bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-medium py-1 px-2.5 rounded-lg"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                                            <Link
                                                href={`/dashboard/new?resumeId=${resume.id}&mode=RESUME&role=${encodeURIComponent(resume.parsedRole || "")}&exp=${resume.experience || "1"}`}
                                            >
                                                <Button
                                                    size="sm"
                                                    className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                                                >
                                                    Start Interview
                                                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                                                </Button>
                                            </Link>
                                            <Link href="/resume">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-3 text-xs text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl cursor-pointer"
                                                >
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── INQUIRIES & SUPPORT PANEL ───────────────────────────────────── */
function InquiriesPanel({
    inquiries,
    loading,
    onOpenModal,
}: {
    inquiries: UserInquiryItem[];
    loading: boolean;
    onOpenModal: () => void;
}) {
    const categoryLabels: Record<string, string> = {
        INTERVIEW_FEEDBACK: "Interview Feedback",
        FEATURE_REQUEST: "Feature Request",
        BUG_REPORT: "Bug Report",
        GENERAL_QUESTION: "General Question",
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "RESOLVED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Resolved / Replied
                    </span>
                );
            case "IN_PROGRESS":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        In Progress
                    </span>
                );
            case "CLOSED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Closed
                    </span>
                );
            case "PENDING":
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Pending Review
                    </span>
                );
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Support & Inquiries</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Ask questions about your evaluations, report bugs, or suggest improvements.
                    </p>
                </div>
                <Button
                    onClick={onOpenModal}
                    className="h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-purple-200 cursor-pointer flex items-center gap-2 shrink-0"
                >
                    <MessageSquarePlus className="h-4 w-4" />
                    Ask Question / Feedback
                </Button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <Card key={i} className="rounded-2xl border-slate-100 shadow-sm p-6 space-y-3">
                            <Skeleton className="h-6 w-1/3 rounded-lg" />
                            <Skeleton className="h-4 w-1/4 rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                        </Card>
                    ))}
                </div>
            ) : inquiries.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-slate-200 p-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                        <HelpCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No inquiries submitted yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                        Have a question about an interview evaluation, scoring, or want to suggest an improvement? Send a message directly to our admin team.
                    </p>
                    <Button
                        onClick={onOpenModal}
                        size="sm"
                        className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium cursor-pointer"
                    >
                        <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
                        Ask Your First Question
                    </Button>
                </Card>
            ) : (
                <div className="space-y-5">
                    {inquiries.map((item) => {
                        const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        });

                        return (
                            <Card
                                key={item.id}
                                className="rounded-2xl border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden"
                            >
                                <CardContent className="p-5 sm:p-6 space-y-4">
                                    {/* Top Bar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-50 border-0 text-[11px] font-semibold">
                                                    {categoryLabels[item.category] || item.category}
                                                </Badge>
                                                {item.mockInterviewId && (
                                                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                        Interview: {item.mockInterviewId.slice(-6)}
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-400">
                                                    Submitted on {formattedDate}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-slate-900 pt-0.5">
                                                {item.subject}
                                            </h3>
                                        </div>
                                        <div className="shrink-0">
                                            {getStatusBadge(item.status)}
                                        </div>
                                    </div>

                                    {/* User Message */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {item.message}
                                    </div>

                                    {/* Admin Official Reply (if any) */}
                                    {item.adminReply ? (
                                        <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-white border border-purple-200 rounded-xl p-4 sm:p-5 space-y-2 mt-2">
                                            <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-purple-100">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                                                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                                                    <span>Admin Response • {item.adminName || "MockMate Support"}</span>
                                                </div>
                                                {item.adminRepliedAt && (
                                                    <span className="text-[11px] text-purple-600 font-medium">
                                                        Replied on{" "}
                                                        {new Date(item.adminRepliedAt).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap pt-1">
                                                {item.adminReply}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-slate-400 italic pt-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>Waiting for an administrator to review and reply. You will see the answer here.</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── SETTINGS PANEL ──────────────────────────────────────────────── */
function SettingsPanel({
    user,
    interviews,
    onDeleteInterview,
    deletingId,
}: {
    user: ReturnType<typeof useUser>["user"];
    interviews: Interview[];
    onDeleteInterview: (id: string) => Promise<void>;
    deletingId: string | null;
}) {
    const settingsSections = [
        {
            title: "Profile",
            icon: User,
            description: "Manage your personal information",
            items: [
                { label: "Full Name", value: user?.fullName || "Not set" },
                { label: "Email", value: user?.primaryEmailAddress?.emailAddress || "Not set" },
            ],
        },
        {
            title: "Notifications",
            icon: Bell,
            description: "Configure how you receive updates",
            items: [
                { label: "Email notifications", value: "Enabled" },
                { label: "Interview reminders", value: "Enabled" },
            ],
        },
        {
            title: "Privacy & Security",
            icon: Shield,
            description: "Manage your account security",
            items: [
                { label: "Two-Factor Auth", value: "Not configured" },
                { label: "Data Sharing", value: "Off" },
            ],
        },
        {
            title: "Preferences",
            icon: Palette,
            description: "Customize your experience",
            items: [
                { label: "Theme", value: "Light" },
                { label: "Language", value: "English" },
            ],
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Settings</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage your account and preferences</p>
            </div>

            <div className="space-y-6">
                {/* Interview Management & Deletion */}
                <Card className="rounded-2xl border-0 shadow-sm overflow-hidden border-red-100 bg-white">
                    <CardHeader className="pb-3 border-b border-red-50 bg-red-50/40">
                        <CardTitle className="text-base font-semibold text-red-900 flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-600" />
                            Manage & Delete Interviews
                        </CardTitle>
                        <p className="text-xs text-red-700/80">
                            Delete any mock interview. This permanently deletes the session and all user answers associated with it.
                        </p>
                    </CardHeader>
                    <CardContent className="p-5">
                        {interviews.length === 0 ? (
                            <p className="text-sm text-slate-400 py-3 text-center">
                                No interviews available to delete.
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                {interviews.map((iv) => (
                                    <div
                                        key={iv.id}
                                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-100"
                                    >
                                        <div className="min-w-0 flex-1 mr-4">
                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                {iv.jobRole}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                <span>
                                                    {new Date(iv.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                                <span>•</span>
                                                <span>{iv.jobExperience} YOE</span>
                                                <span>•</span>
                                                <span className="font-mono font-medium text-slate-600">
                                                    {formatHHMMSS(iv.duration)}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={deletingId === iv.id}
                                            onClick={() => onDeleteInterview(iv.id)}
                                            className="rounded-xl h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                                        >
                                            {deletingId === iv.id ? (
                                                <>
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Other Settings Sections */}
                <div className="space-y-4">
                    {settingsSections.map((section) => (
                        <Card key={section.title} className="rounded-2xl border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                    <section.icon className="h-5 w-5 text-indigo-600" />
                                    {section.title}
                                </CardTitle>
                                <p className="text-xs text-slate-400">{section.description}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {section.items.map((item) => (
                                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                            <span className="text-sm text-slate-600">{item.label}</span>
                                            <span className="text-sm font-medium text-slate-800">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
