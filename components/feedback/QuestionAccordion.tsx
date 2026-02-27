"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, MessageSquare, Lightbulb } from "lucide-react";

interface QuestionFeedback {
    question: string;
    userAnswer: string;
    idealAnswer: string;
    rating: number;
    feedback: string;
}

interface QuestionAccordionProps {
    questions: QuestionFeedback[];
}

function getRatingColor(rating: number) {
    if (rating >= 8) return "bg-green-50 text-green-700 border-green-200";
    if (rating >= 6) return "bg-blue-50 text-blue-700 border-blue-200";
    if (rating >= 4) return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-red-50 text-red-700 border-red-200";
}

export default function QuestionAccordion({ questions }: QuestionAccordionProps) {
    return (
        <Accordion type="single" collapsible className="space-y-3">
            {questions.map((q, index) => (
                <AccordionItem
                    key={index}
                    value={`q-${index}`}
                    className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                    <AccordionTrigger className="px-5 py-4 hover:no-underline">
                        <div className="flex items-center gap-3 text-left flex-1">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-sm font-bold shrink-0">
                                {index + 1}
                            </span>
                            <span className="text-sm font-medium text-slate-700 line-clamp-1 flex-1">
                                {q.question}
                            </span>
                            <Badge
                                variant="outline"
                                className={`ml-2 ${getRatingColor(q.rating)} shrink-0`}
                            >
                                {q.rating}/10
                            </Badge>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-5 pb-5">
                        <div className="space-y-4 pt-2">
                            {/* User's Answer */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    Your Answer
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3.5 text-sm text-slate-700 leading-relaxed">
                                    {q.userAnswer || "(No answer provided)"}
                                </div>
                            </div>

                            {/* Ideal Answer */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Ideal Answer
                                </div>
                                <div className="bg-green-50 rounded-lg p-3.5 text-sm text-green-800 leading-relaxed border border-green-100">
                                    {q.idealAnswer}
                                </div>
                            </div>

                            {/* Feedback */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600">
                                    <Lightbulb className="h-3.5 w-3.5" />
                                    Feedback
                                </div>
                                <div className="bg-indigo-50 rounded-lg p-3.5 text-sm text-indigo-800 leading-relaxed border border-indigo-100">
                                    {q.feedback}
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
