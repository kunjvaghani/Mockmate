"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageSquarePlus } from "lucide-react";

interface SubmitInquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mockInterviewId?: string | null;
    initialCategory?: string;
    onSuccess?: () => void;
}

export default function SubmitInquiryModal({
    isOpen,
    onClose,
    mockInterviewId,
    initialCategory = "GENERAL_QUESTION",
    onSuccess,
}: SubmitInquiryModalProps) {
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState(initialCategory);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: subject.trim(),
                    category,
                    message: message.trim(),
                    mockInterviewId: mockInterviewId || null,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSubject("");
                setMessage("");
                onClose();
                if (onSuccess) onSuccess();
            } else {
                setError(data.error || "Failed to submit inquiry. Please try again.");
            }
        } catch (err) {
            console.error("Error submitting inquiry:", err);
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg rounded-2xl p-6 bg-white shadow-xl">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                            <MessageSquarePlus className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-slate-900">
                                Ask Admin / Submit Feedback
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Send a private inquiry to the MockMate team. Only you and the admin can see the reply.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {mockInterviewId && (
                        <div className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 flex items-center gap-1.5">
                            <span>Linked to Interview Session:</span>
                            <span className="font-mono text-[11px] text-purple-900">{mockInterviewId}</span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                        >
                            <option value="INTERVIEW_FEEDBACK">Interview Feedback / Scoring</option>
                            <option value="FEATURE_REQUEST">Feature Request / Improvement</option>
                            <option value="BUG_REPORT">Bug Report / Technical Issue</option>
                            <option value="GENERAL_QUESTION">General Question for Admin</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Subject
                        </label>
                        <Input
                            placeholder="e.g. Question about Question 3 scoring, suggestion for timer..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="h-10 rounded-xl border-slate-200 text-sm"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Your Message / Details
                        </label>
                        <Textarea
                            placeholder="Describe your question or feedback in detail..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[110px] rounded-xl border-slate-200 text-sm resize-none"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg">
                            {error}
                        </p>
                    )}

                    <DialogFooter className="pt-2 flex sm:justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="h-10 rounded-xl text-xs text-slate-600 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !subject.trim() || !message.trim()}
                            className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="h-3.5 w-3.5 mr-1.5" />
                                    Send to Admin
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
