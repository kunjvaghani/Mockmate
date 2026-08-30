"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ShieldCheck,
    Clock,
    AlertCircle,
    CheckCircle2,
    Search,
    MessageSquare,
    Send,
    ExternalLink,
    Filter,
    Loader2,
    RefreshCw,
    Sparkles,
} from "lucide-react";

interface Inquiry {
    id: string;
    userId: string;
    userEmail?: string | null;
    userName?: string | null;
    mockInterviewId?: string | null;
    category: string;
    subject: string;
    message: string;
    status: string;
    adminReply?: string | null;
    adminRepliedAt?: string | null;
    adminName?: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Stats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
}

export default function AdminInquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Active Reply State: { [inquiryId]: string }
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

    const categoryLabels: Record<string, string> = {
        INTERVIEW_FEEDBACK: "Interview Feedback",
        FEATURE_REQUEST: "Feature Request",
        BUG_REPORT: "Bug Report",
        GENERAL_QUESTION: "General Question",
    };

    const cannedTemplates = [
        "Thank you for reaching out! We have reviewed your inquiry and our team is investigating.",
        "We took a look at your interview scoring criteria and question feedback. Everything has been validated.",
        "Thanks for the great feature idea! We've added this to our upcoming MockMate release roadmap.",
    ];

    async function fetchInquiries() {
        setLoading(true);
        setAccessDenied(false);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.append("status", statusFilter);
            if (categoryFilter !== "ALL") params.append("category", categoryFilter);
            if (searchQuery.trim()) params.append("search", searchQuery.trim());

            const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
            if (res.status === 403) {
                setAccessDenied(true);
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setInquiries(data.inquiries || []);
                if (data.stats) setStats(data.stats);
            }
        } catch (err) {
            console.error("Failed to load admin inquiries:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInquiries();
    }, [statusFilter, categoryFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchInquiries();
    };

    const handleStatusChange = async (inquiryId: string, newStatus: string) => {
        setUpdatingStatusId(inquiryId);
        try {
            const res = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setInquiries((prev) =>
                    prev.map((item) => (item.id === inquiryId ? { ...item, status: newStatus } : item))
                );
                // Update local stats
                setStats((prev) => {
                    const oldItem = inquiries.find((i) => i.id === inquiryId);
                    if (!oldItem || oldItem.status === newStatus) return prev;
                    return {
                        ...prev,
                        pending: newStatus === "PENDING" ? prev.pending + 1 : oldItem.status === "PENDING" ? Math.max(0, prev.pending - 1) : prev.pending,
                        inProgress: newStatus === "IN_PROGRESS" ? prev.inProgress + 1 : oldItem.status === "IN_PROGRESS" ? Math.max(0, prev.inProgress - 1) : prev.inProgress,
                        resolved: newStatus === "RESOLVED" ? prev.resolved + 1 : oldItem.status === "RESOLVED" ? Math.max(0, prev.resolved - 1) : prev.resolved,
                    };
                });
            }
        } catch (err) {
            console.error("Status update error:", err);
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleSendReply = async (inquiryId: string) => {
        const replyText = replyDrafts[inquiryId]?.trim();
        if (!replyText) return;

        setSubmittingReplyId(inquiryId);
        try {
            const res = await fetch(`/api/admin/inquiries/${inquiryId}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reply: replyText }),
            });

            if (res.ok) {
                const data = await res.json();
                setInquiries((prev) =>
                    prev.map((item) => (item.id === inquiryId ? data.inquiry : item))
                );
                // Clear draft for this inquiry
                setReplyDrafts((prev) => {
                    const next = { ...prev };
                    delete next[inquiryId];
                    return next;
                });
                // Update stats
                setStats((prev) => ({
                    ...prev,
                    resolved: prev.resolved + 1,
                    pending: Math.max(0, prev.pending - 1),
                }));
            }
        } catch (err) {
            console.error("Send reply error:", err);
        } finally {
            setSubmittingReplyId(null);
        }
    };

    if (accessDenied) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-20 text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                    <AlertCircle className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Access Required</h1>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    You do not have permission to view the Admin Support Portal. Please ensure your email is added to the <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">ADMIN_EMAILS</code> configuration.
                </p>
                <div className="mt-6">
                    <Link href="/user-dashboard">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                            Return to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Admin Support & Inquiry Portal
                        </h1>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Review candidate queries, update ticket status, and send private answers.
                    </p>
                </div>
                <Button
                    onClick={fetchInquiries}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs gap-2 cursor-pointer self-start sm:self-auto"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="rounded-2xl border-slate-200/80 shadow-xs">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">Total Tickets</span>
                            <MessageSquare className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-amber-200/60 bg-amber-50/20 shadow-xs">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-amber-700">Pending Review</span>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold text-amber-700 mt-2">{stats.pending}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-blue-200/60 bg-blue-50/20 shadow-xs">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-blue-700">In Progress</span>
                            <AlertCircle className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-blue-700 mt-2">{stats.inProgress}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-emerald-200/60 bg-emerald-50/20 shadow-xs">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-emerald-700">Resolved</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-700 mt-2">{stats.resolved}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <Card className="rounded-2xl border-slate-200/80 shadow-xs p-4">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by candidate name, email, subject, or message keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 rounded-xl border-slate-200 text-sm w-full"
                        />
                    </div>

                    <div className="flex items-center gap-2.5 w-full md:w-auto">
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium shrink-0">
                            <Filter className="h-3.5 w-3.5" />
                            <span>Status:</span>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none cursor-pointer shrink-0"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending Review</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none cursor-pointer shrink-0"
                        >
                            <option value="ALL">All Categories</option>
                            <option value="INTERVIEW_FEEDBACK">Interview Feedback</option>
                            <option value="FEATURE_REQUEST">Feature Request</option>
                            <option value="BUG_REPORT">Bug Report</option>
                            <option value="GENERAL_QUESTION">General Question</option>
                        </select>

                        <Button
                            type="submit"
                            size="sm"
                            className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs cursor-pointer shrink-0"
                        >
                            Search
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Inquiries Feed */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="rounded-2xl border-slate-100 shadow-sm p-6 space-y-3">
                            <Skeleton className="h-6 w-1/4 rounded-lg" />
                            <Skeleton className="h-4 w-1/3 rounded-lg" />
                            <Skeleton className="h-20 w-full rounded-xl" />
                        </Card>
                    ))}
                </div>
            ) : inquiries.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-slate-200 p-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No user inquiries found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        There are currently no tickets matching your active filter criteria.
                    </p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {inquiries.map((item) => {
                        const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        });

                        const currentDraft = replyDrafts[item.id] || "";
                        const isReplying = submittingReplyId === item.id;
                        const isUpdatingStatus = updatingStatusId === item.id;

                        return (
                            <Card
                                key={item.id}
                                className="rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
                            >
                                <CardContent className="p-6 space-y-5">
                                    {/* Header info */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-3 border-b border-slate-100">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-0 text-xs font-semibold">
                                                    {categoryLabels[item.category] || item.category}
                                                </Badge>

                                                {item.mockInterviewId && (
                                                    <Link
                                                        href={`/interview/${item.mockInterviewId}/feedback`}
                                                        target="_blank"
                                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-0.5 rounded-md transition-colors"
                                                    >
                                                        <span>Interview: {item.mockInterviewId.slice(-6)}</span>
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                )}

                                                <span className="text-xs text-slate-400">
                                                    Submitted: {formattedDate}
                                                </span>
                                            </div>

                                            <h2 className="text-lg font-bold text-slate-900 pt-1">
                                                {item.subject}
                                            </h2>

                                            <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-slate-700">
                                                    Candidate: {item.userName || "Anonymous Candidate"}
                                                </span>
                                                {item.userEmail && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-mono text-slate-600">{item.userEmail}</span>
                                                    </>
                                                )}
                                                <span>•</span>
                                                <span className="font-mono text-[11px] text-slate-400">ID: {item.id}</span>
                                            </div>
                                        </div>

                                        {/* Status Management Dropdown */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs font-medium text-slate-400">Status:</span>
                                            <select
                                                disabled={isUpdatingStatus}
                                                value={item.status}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                className={`h-9 px-3 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer transition-all ${
                                                    item.status === "RESOLVED"
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : item.status === "IN_PROGRESS"
                                                        ? "border-blue-200 bg-blue-50 text-blue-700"
                                                        : item.status === "CLOSED"
                                                        ? "border-slate-200 bg-slate-100 text-slate-600"
                                                        : "border-amber-200 bg-amber-50 text-amber-700"
                                                }`}
                                            >
                                                <option value="PENDING">🟡 Pending Review</option>
                                                <option value="IN_PROGRESS">🔵 In Progress</option>
                                                <option value="RESOLVED">🟢 Resolved</option>
                                                <option value="CLOSED">⚪ Closed</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Candidate Message Box */}
                                    <div className="space-y-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            User Inquiry
                                        </span>
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                            {item.message}
                                        </div>
                                    </div>

                                    {/* Existing Admin Reply (if any) */}
                                    {item.adminReply && (
                                        <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 space-y-1.5">
                                            <div className="flex items-center justify-between text-xs font-bold text-purple-900 pb-1 border-b border-purple-100">
                                                <div className="flex items-center gap-1.5">
                                                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                                                    <span>Official Reply by {item.adminName || "Admin"}</span>
                                                </div>
                                                {item.adminRepliedAt && (
                                                    <span className="text-[11px] text-purple-600 font-medium">
                                                        {new Date(item.adminRepliedAt).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap pt-1">
                                                {item.adminReply}
                                            </p>
                                        </div>
                                    )}

                                    {/* Reply Composer */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                {item.adminReply ? "Send Updated / Additional Reply" : "Compose Reply to Candidate"}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                Candidate will see this in their Support tab
                                            </span>
                                        </div>

                                        {/* Canned Quick Response Pills */}
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mr-1">
                                                <Sparkles className="h-3 w-3 text-purple-500" />
                                                Quick templates:
                                            </span>
                                            {cannedTemplates.map((template, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() =>
                                                        setReplyDrafts((prev) => ({
                                                            ...prev,
                                                            [item.id]: template,
                                                        }))
                                                    }
                                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-800 text-[11px] transition-colors cursor-pointer text-left"
                                                >
                                                    {template.slice(0, 32)}...
                                                </button>
                                            ))}
                                        </div>

                                        <textarea
                                            rows={3}
                                            placeholder="Type your official answer to this candidate..."
                                            value={currentDraft}
                                            onChange={(e) =>
                                                setReplyDrafts((prev) => ({
                                                    ...prev,
                                                    [item.id]: e.target.value,
                                                }))
                                            }
                                            className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-y"
                                        />

                                        <div className="flex items-center justify-end">
                                            <Button
                                                onClick={() => handleSendReply(item.id)}
                                                disabled={isReplying || !currentDraft.trim()}
                                                className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                                            >
                                                {isReplying ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Sending Reply...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-3.5 w-3.5" />
                                                        Send Reply & Mark Resolved
                                                    </>
                                                )}
                                            </Button>
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
