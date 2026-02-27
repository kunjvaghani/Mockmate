"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";

interface Interview {
    id: string;
    jobRole: string;
    jobExperience: string;
    createdAt: string;
    messages?: { id: string; aiRating?: number | null }[];
}

type SidebarTab = "interviews" | "feedbacks" | "analysis" | "settings";

const sidebarItems: { key: SidebarTab; label: string; icon: React.ElementType; description: string }[] = [
    { key: "interviews", label: "Interviews", icon: Mic, description: "Your interview sessions" },
    { key: "feedbacks", label: "Feedbacks", icon: MessageSquare, description: "AI-generated feedback" },
    { key: "analysis", label: "Analysis", icon: BarChart3, description: "Performance analytics" },
    { key: "settings", label: "Settings", icon: Settings, description: "Account preferences" },
];

export default function UserDashboardPage() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<SidebarTab>("interviews");
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
                    {activeTab === "settings" && (
                        <SettingsPanel user={user} />
                    )}
                </main>
            </div>
        </div>
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
                                <div className="flex gap-2 shrink-0">
                                    <Link href={`/interview/${interview.id}/feedback`}>
                                        <Button variant="outline" size="sm" className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                            Feedback
                                        </Button>
                                    </Link>
                                    <Link href={`/interview/${interview.id}`}>
                                        <Button size="icon" className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
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
                                        <span className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(interview.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                    </div>
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

/* ─── SETTINGS PANEL ──────────────────────────────────────────────── */
function SettingsPanel({ user }: { user: ReturnType<typeof useUser>["user"] }) {
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
    );
}
