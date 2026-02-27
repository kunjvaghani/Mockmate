"use client";

import { BrainCircuit } from "lucide-react";

interface QuestionDisplayProps {
    question: string | null;
    questionNumber: number;
    totalQuestions: number;
    isThinking?: boolean;
}

export default function QuestionDisplay({
    question,
    questionNumber,
    totalQuestions,
    isThinking = false,
}: QuestionDisplayProps) {
    return (
        <div className="space-y-4">
            {/* Question counter */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                    <BrainCircuit className="h-4 w-4" />
                    AI Interviewer
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                        Question {questionNumber} of {totalQuestions}
                    </span>
                    <div className="flex gap-1">
                        {Array.from({ length: totalQuestions }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 w-6 rounded-full transition-colors ${i < questionNumber
                                        ? "bg-indigo-600"
                                        : "bg-slate-200"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Question text */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                {isThinking ? (
                    <div className="flex items-center gap-3 text-indigo-600">
                        <div className="flex gap-1">
                            <div className="typing-dot h-2.5 w-2.5 rounded-full bg-indigo-500" />
                            <div className="typing-dot h-2.5 w-2.5 rounded-full bg-indigo-500" />
                            <div className="typing-dot h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        </div>
                        <span className="text-sm font-medium">AI is thinking...</span>
                    </div>
                ) : question ? (
                    <p className="text-lg text-slate-800 leading-relaxed font-medium">
                        {question}
                    </p>
                ) : (
                    <p className="text-sm text-slate-400 italic">
                        Click &ldquo;Start Interview&rdquo; to begin...
                    </p>
                )}
            </div>
        </div>
    );
}
